import React, { useEffect, useContext, useState, useCallback } from 'react';
import { ZipCodeContext } from '../../contexts/ZipCodeContext';

import {
    getReps,
    getZipCode,
    getPrecincts,
    getAreaGeometry
} from '../../services/repcheck_backend/api';

import Map, { Source, Layer, ScaleControl } from 'react-map-gl';
import { mapBoxToken } from '../../config';
import './MapPage.css';
import { startCase } from 'lodash';

/*
  Classify area ID for constituent lines.
*/
function getClassification(areaId) {
    if (areaId === 'ocd-division/country:us') {
        return 'federal';
    }
    if (areaId.match(/^ocd-division\/country:us\/state:[a-z]{2}$/)) {
        return 'state';
    }
    if (areaId.match(/^ocd-division\/country:us\/state:[a-z]{2}\/cd:.*/)) {
        return 'federal congressional district';
    }
    if (areaId.match(/^ocd-division\/country:us\/state:[a-z]{2}\/sldu:.*/)) {
        return 'state senate district';
    }
    if (areaId.match(/^ocd-division\/country:us\/state:[a-z]{2}\/sldl:.*/)) {
        return 'state house district';
    }
    return 'local';
}

/*
  For precinct fill:
  - Color: Blue if DEM > REP, Red if REP > DEM, Purple if tie
  - Opacity: ratio * 0.5 => max 0.5
*/
const precinctFillPaint = {
    'fill-color': [
        'case',
        ['>', ['get', 'votes_dem'], ['get', 'votes_rep']], '#0000FF', // Blue
        ['>', ['get', 'votes_rep'], ['get', 'votes_dem']], '#ce0000', // Red
        '#800080' // Tie => Purple
    ],
    'fill-opacity': [
        'case',
        // If DEM > REP => (dem / (dem+rep)) * 0.5
        ['>', ['get', 'votes_dem'], ['get', 'votes_rep']],
        ['*',
            ['/', ['get', 'votes_dem'], ['+', ['get', 'votes_dem'], ['get', 'votes_rep']]],
            0.6
        ],
        // If REP > DEM => (rep / (dem+rep)) * 0.5
        ['>', ['get', 'votes_rep'], ['get', 'votes_dem']],
        ['*',
            ['/', ['get', 'votes_rep'], ['+', ['get', 'votes_dem'], ['get', 'votes_rep']]],
            0.6
        ],
        // Tie => 0.5 * 0.5 = 0.25 or just a constant
        0.25
    ]
};

/*
  We'll keep the ZIP / Constituent boundaries as lines with color-coded classification for the constituent lines.
  ZIP boundary can be a single color. 
*/

/* 
  We'll highlight lines on hover with separate highlight layers.
*/

/*
  For the constituent lines, color by classification:
  - federal => #b4e4e4
  - state => #c8b49d
  - federal congressional district => #525174
  - state senate district => #037171
  - state house district => #FE938C
  - local => #ccccff
*/
const constituentLinePaint = {
    'line-color': [
        'match',
        ['get', 'classification'],
        'federal', '#b4e4e4',
        'state', '#c8b49d',
        'federal congressional district', '#525174',
        'state senate district', '#037171',
        'state house district', '#FE938C',
        'local', '#ccccff',
        /* fallback */
        '#cccccc'
    ],
    'line-width': 2
};


function MapPage() {
    const { zipCode } = useContext(ZipCodeContext);

    // Data
    const [zipCodeData, setZipCodeData] = useState(null);
    const [precinctsData, setPrecinctsData] = useState(null);
    const [repsData, setRepsData] = useState([]);
    const [constituentFeatures, setConstituentFeatures] = useState([]);

    // Loading / error
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /*
      Hover info: we store which feature is hovered so we can highlight the boundary lines.
      We'll store:
        hoveredZipId,
        hoveredConstituentId,
        hoveredPrecinctId,
      etc.
    */
    const [hoverInfo, setHoverInfo] = useState({
        x: 0,
        y: 0,
        hoveredZipId: null,
        hoveredConstituentId: null,
        hoveredPrecinctId: null,
        features: []
    });

    // Toggles
    const [showZip, setShowZip] = useState(true);
    const [showPrecincts, setShowPrecincts] = useState(false);
    const [showConstituent, setShowConstituent] = useState(true);

    // Fetch data
    useEffect(() => {
        if (!zipCode) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1) Reps
                const reps = await getReps(zipCode);
                setRepsData(reps);

                // 2) ZIP geometry
                const zipResponse = await getZipCode(zipCode);
                setZipCodeData(zipResponse);

                // 3) Precincts
                const precinctsResponse = await getPrecincts(zipCode, 5);
                setPrecinctsData(precinctsResponse);

                // 4) Constituent areas
                const fetchedFeatures = [];
                for (const rep of reps) {
                    if (rep.constituent_area_id) {
                        try {
                            const areaGeo = await getAreaGeometry(rep.constituent_area_id);
                            if (!areaGeo.error && areaGeo.geometry) {
                                const classification = getClassification(areaGeo.area_id);
                                fetchedFeatures.push({
                                    type: 'Feature',
                                    geometry: areaGeo.geometry,
                                    properties: {
                                        representative_name: rep.name,
                                        area_id: areaGeo.area_id,
                                        classification
                                    }
                                });
                            }
                        } catch (err) {
                            console.warn('Error fetching constituent area geometry:', err);
                        }
                    }
                }
                setConstituentFeatures(fetchedFeatures);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [zipCode]);

    /*
      onHover:
      We want to detect if the user is inside the ZIP or a constituent polygon, 
      even though we only display lines. So we create "fill" layers with 0 opacity 
      for interaction. 
    */
    const onHover = useCallback((event) => {
        const { features, point: { x, y } } = event;
        if (!features) {
            setHoverInfo({
                x, y,
                hoveredZipId: null,
                hoveredConstituentId: null,
                hoveredPrecinctId: null,
                features: []
            });
            return;
        }

        // Which fill layers might we see? zip-fill-layer, constituent-fill-layer, or the precinct fill
        // Because precinct fill is also interactive (for the actual color).
        let zipFill = features.find(f => f.layer.id === 'zip-fill-layer');
        let precinctFill = features.find(f => f.layer.id === 'precincts-fill-layer');
        let constituentFill = features.find(f => f.layer.id === 'constituent-fill-layer');

        console.log(zipFill)
        setHoverInfo({
            x,
            y,
            hoveredZipId: zipFill ? zipFill.properties.area_id : null,
            hoveredConstituentId: constituentFill ? constituentFill.properties.area_id : null,
            hoveredPrecinctId: precinctFill ? precinctFill.properties.precinct_id : null,
            features
        });
    }, []);

    // Early returns
    if (!zipCode) {
        return <div className="map-page"><h2>Please enter a ZIP code.</h2></div>;
    }
    if (loading) {
        return <div className="map-page"><p>Loading data...</p></div>;
    }
    if (error) {
        return <div className="map-page"><p>Error: {error}</p></div>;
    }
    if (!zipCodeData) {
        return <div className="map-page"><p>No ZIP code data yet.</p></div>;
    }

    // Build map data
    const zipFeature = {
        type: 'Feature',
        geometry: zipCodeData.geometry,
        properties: {
            area_id: zipCode
        }
    };

    const precinctFeatures = (precinctsData?.precincts || []).map((p) => ({
        type: 'Feature',
        geometry: p.geometry,
        properties: {
            precinct_id: p.precinct_id,
            votes_dem: p.votes_dem,
            votes_rep: p.votes_rep
        }
    }));

    const precinctsFeatureCollection = {
        type: 'FeatureCollection',
        features: precinctFeatures
    };

    const constituentFC = {
        type: 'FeatureCollection',
        features: constituentFeatures
    };

    // Map initial
    const initialViewState = {
        longitude: zipCodeData.area.centroid_lon,
        latitude: zipCodeData.area.centroid_lat,
        zoom: 13
    };

    /*
      Interactive Layers
      We'll make the "fill" layers interactive for ZIP and constituent 
      so that the user can hover inside the polygon. 
      We'll keep the precinct fill also interactive for the same reason.
    */
    const interactiveLayerIds = [
        'zip-fill-layer',
        'precincts-fill-layer',
        'constituent-fill-layer'
    ];

    return (
        <div className="map-page">
            <h2>Map of {zipCode}</h2>

            <div className="legend">
                <label>
                    <input
                        type="checkbox"
                        checked={showZip}
                        onChange={(e) => setShowZip(e.target.checked)}
                    />
                    Show ZIP
                </label>
                &nbsp;&nbsp;
                <label>
                    <input
                        type="checkbox"
                        checked={showPrecincts}
                        onChange={(e) => setShowPrecincts(e.target.checked)}
                    />
                    Show Federal Election 2024 Results
                </label>
                &nbsp;&nbsp;
                <label>
                    <input
                        type="checkbox"
                        checked={showConstituent}
                        onChange={(e) => setShowConstituent(e.target.checked)}
                    />
                    Show Legislator Districts
                </label>
            </div>

            <div className="map-container">
                <Map
                    mapboxAccessToken={mapBoxToken}
                    initialViewState={initialViewState}
                    style={{ height: '60vh', width: '100%' }}
                    mapStyle="mapbox://styles/mapbox/light-v11"
                    attributionControl={false}
                    collectResourceTiming={false}
                    interactiveLayerIds={interactiveLayerIds}
                    onMouseMove={onHover}
                >
                    <ScaleControl unit="imperial" />

                    {/* ZIP source (one feature) */}
                    <Source id="zip-source" type="geojson" data={zipFeature}>

                        {/* 1) Invisible fill for interaction */}
                        <Layer
                            id="zip-fill-layer"
                            type="fill"
                            paint={{
                                'fill-color': '#000000',
                                'fill-opacity': 0
                            }}
                            layout={{
                                visibility: showZip ? 'visible' : 'none'
                            }}
                        />

                        {/* 2) Visible line for boundary */}
                        <Layer
                            id="zip-line-layer"
                            type="line"
                            paint={{
                                'line-color': '#088',
                                'line-width': 2
                            }}
                            layout={{
                                visibility: showZip ? 'visible' : 'none'
                            }}
                        />
                    </Source>

                    {/* Precincts fill */}
                    {precinctsFeatureCollection.features.length > 0 && (
                        <Source id="precincts-source" type="geojson" data={precinctsFeatureCollection}>
                            <Layer
                                id="precincts-fill-layer"
                                type="fill"
                                paint={precinctFillPaint}
                                layout={{
                                    visibility: showPrecincts ? 'visible' : 'none'
                                }}
                            />
                        </Source>
                    )}

                    {/* Constituent areas */}
                    {constituentFC.features.length > 0 && (
                        <Source id="constituent-source" type="geojson" data={constituentFC}>

                            {/* Invisible fill for mouseover */}
                            <Layer
                                id="constituent-fill-layer"
                                type="fill"
                                paint={{
                                    'fill-color': '#000000',
                                    'fill-opacity': 0
                                }}
                                layout={{
                                    visibility: showConstituent ? 'visible' : 'none'
                                }}
                            />

                            {/* Visible line for boundaries */}
                            <Layer
                                id="constituent-line-layer"
                                type="line"
                                paint={constituentLinePaint}
                                layout={{
                                    visibility: showConstituent ? 'visible' : 'none'
                                }}
                            />
                        </Source>
                    )}

                    {/* Highlights */}
                    {/* ZIP highlight if hovered */}
                    <Layer
                        id="zip-highlight-layer"
                        type="line"
                        source="zip-source"
                        paint={{
                            'line-color': '#000',
                            'line-width': 4
                        }}
                        filter={[
                            '==',
                            ['get', 'area_id'],
                            hoverInfo.hoveredZipId || ''
                        ]}
                    />

                    {/* Precinct highlight if hovered (outline the precinct) */}
                    {precinctsFeatureCollection.features.length > 0 && (
                        <Layer
                            id="precincts-highlight-layer"
                            type="line"
                            source="precincts-source"
                            paint={{
                                'line-color': '#000',
                                'line-width': 3
                            }}
                            filter={[
                                '==',
                                ['get', 'precinct_id'],
                                hoverInfo.hoveredPrecinctId || ''
                            ]}
                        />
                    )}

                    {/* Constituent highlight if hovered */}
                    {constituentFC.features.length > 0 && (
                        <Layer
                            id="constituent-highlight-layer"
                            type="line"
                            source="constituent-source"
                            paint={{
                                'line-color': '#000',
                                'line-width': 4
                            }}
                            filter={[
                                '==',
                                ['get', 'area_id'],
                                hoverInfo.hoveredConstituentId || ''
                            ]}
                        />
                    )}

                    {/* Tooltip */}
                    {hoverInfo.features.length > 0 && (
                        <div
                            className="tooltip"
                            style={{ left: hoverInfo.x, top: hoverInfo.y }}
                        >
                            {hoverInfo.features.map((feat, i) => {
                                const layerId = feat.layer.id;
                                const props = feat.properties;

                                if (layerId === 'zip-fill-layer') {
                                    return (
                                        <div key={i}>
                                            <div>Zip Code: {props.area_id}</div>
                                        </div>
                                    );
                                } else if (layerId === 'precincts-fill-layer') {
                                    return (
                                        <div key={i}>
                                            <div>Dem votes: {props.votes_dem}</div>
                                            <div>Rep votes: {props.votes_rep}</div>
                                        </div>
                                    );
                                } else if (layerId === 'constituent-fill-layer') {
                                    return (
                                        <div key={i}>
                                            <div>{startCase(props.classification)}: {props.representative_name}</div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                </Map>
            </div>
        </div>
    );
}

export default MapPage;
