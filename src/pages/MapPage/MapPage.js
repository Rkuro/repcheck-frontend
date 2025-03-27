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
import FAQItem from '../../components/FAQItem/FAQItem';
import { useNavigate } from 'react-router-dom';

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
        // If DEM > REP => (dem / (dem+rep)) * 0.6
        ['>', ['get', 'votes_dem'], ['get', 'votes_rep']],
        ['*',
            ['/', ['get', 'votes_dem'], ['+', ['get', 'votes_dem'], ['get', 'votes_rep']]],
            0.6
        ],
        // If REP > DEM => (rep / (dem+rep)) * 0.6
        ['>', ['get', 'votes_rep'], ['get', 'votes_dem']],
        ['*',
            ['/', ['get', 'votes_rep'], ['+', ['get', 'votes_dem'], ['get', 'votes_rep']]],
            0.6
        ],
        // Tie => constant
        0.25
    ]
};

// Colors for each classification
const backgroundColorMap = {
    'federal': '#b4e4e4',
    'federal_senate_district': '#c8b49d',
    'federal_house_district': '#525174',
    'state_senate_district': '#037171',
    'state_house_district': '#FE938C',
    'local': '#ccccff'
};

const constituentLinePaint = {
    'line-color': [
        'match',
        ['get', 'classification'],
        'federal', '#b4e4e4',
        'federal_senate_district', '#c8b49d',
        'federal_house_district', '#525174',
        'state_senate_district', '#037171',
        'state_house_district', '#FE938C',
        'local', '#ccccff',
        /* fallback */
        '#cccccc'
    ],
    'line-width': 2
};

function MapPage() {
    const { zipCode } = useContext(ZipCodeContext);
    const navigate = useNavigate();

    // Data
    const [zipCodeData, setZipCodeData] = useState(null);
    const [precinctsData, setPrecinctsData] = useState(null);
    const [repsData, setRepsData] = useState([]);
    const [constituentFeatures, setConstituentFeatures] = useState([]);

    // Loading / error
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hover info
    const [hoverInfo, setHoverInfo] = useState({
        x: 0,
        y: 0,
        hoveredZipId: null,
        hoveredConstituentIds: [],
        hoveredPrecinctId: null,
        features: []
    });

    // Toggles
    const [showZip, setShowZip] = useState(true);
    const [showPrecincts, setShowPrecincts] = useState(false);

    // NEW: Instead of a single showConstituent, break it into 3 toggles:
    const [showFederal, setShowFederal] = useState(true);
    const [showState, setShowState] = useState(true);
    const [showLocal, setShowLocal] = useState(true);

    useEffect(() => {
        if (!zipCode) {
			navigate('/change-zip');
			return;
		}


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
                const precinctsResponse = await getPrecincts(zipCode, 10);
                setPrecinctsData(precinctsResponse);

                // 4) Constituent areas
                const fetchedFeatures = [];
                for (const rep of reps) {
                    if (rep.constituent_area_id) {
                        try {
                            const areaGeo = await getAreaGeometry(rep.constituent_area_id);
                            if (!areaGeo.error && areaGeo.geometry) {
                                fetchedFeatures.push({
                                    type: 'Feature',
                                    geometry: areaGeo.geometry,
                                    properties: {
                                        representative_name: rep.name,
                                        constituent_area: rep.constituent_area,
                                        area_id: areaGeo.area_id,
                                        classification: rep.constituent_area.classification
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

    const onHover = useCallback((event) => {
        const { features, point: { x, y } } = event;
        if (!features) {
            setHoverInfo({
                x, y,
                hoveredZipId: null,
                hoveredConstituentIds: [],
                hoveredPrecinctId: null,
                features: []
            });
            return;
        }

        let zipFill = features.find(f => f.layer.id === 'zip-fill-layer');
        let precinctFill = features.find(f => f.layer.id === 'precincts-fill-layer');
        let constituentFills = features.filter(f => f.layer.id === 'constituent-fill-layer');
        let hoveredConstituentIds = constituentFills.map(cf => cf.properties.area_id);

        setHoverInfo({
            x,
            y,
            hoveredZipId: zipFill ? zipFill.properties.area_id : null,
            hoveredConstituentIds,
            hoveredPrecinctId: precinctFill ? precinctFill.properties.precinct_id : null,
            features
        });
    }, []);

    if (!zipCode) {
        return <div className="map-page"><p>Please enter a ZIP code on the home page.</p></div>;
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

    const initialViewState = {
        longitude: zipCodeData.area.centroid_lon,
        latitude: zipCodeData.area.centroid_lat,
        zoom: 13
    };

    // We'll interact with zip-fill-layer, precincts-fill-layer, and constituent-fill-layer
    const interactiveLayerIds = [
        'zip-fill-layer',
        'precincts-fill-layer',
        'constituent-fill-layer'
    ];

    // Build up an array of classification strings that should be visible:
    const visibleClassifications = [];
    if (showFederal) {
        visibleClassifications.push('federal', 'federal_senate_district', 'federal_house_district');
    }
    if (showState) {
        visibleClassifications.push('state_senate_district', 'state_house_district');
        // If you had a plain 'state' classification, you'd include it here as well
        // visibleClassifications.push('state');
    }
    if (showLocal) {
        visibleClassifications.push('local');
    }

    const faqs = [
        {
            question: "What am I looking at?",
            answer: "This interactive map focuses on your zip code and its relationship with federal and state districts. It shows you three things. 1) Your zip code area, 2) Which areas are included in your representatives' districts and 3) How your neighbors voted in the 2024 federal election.",
        },
        {
            question: "Data Overlays",
            answer: "You can toggle on/off each data overlay. There are three data overlays. 1) Your zip code - this simply shows you where you live. 2) The Federal Election results overlay from The New York Times. When enabled, blue or red tiles will appear within 10 miles of your zip code. More blue = more democratic votes, more red = more republican votes.  3) The legislative district overlay. This shows which federal and state districts overlap with your zip code and who represents them as you hover over them with your mouse.",
        },
    ];

    return (
        <div className="map-page">
            <h1>Map of {zipCode}</h1>
            <div className="map-container">
                <Map
                    mapboxAccessToken={mapBoxToken}
                    initialViewState={initialViewState}
                    style={{ height: '65vh', width: '100%' }}
                    mapStyle="mapbox://styles/mapbox/light-v11"
                    collectResourceTiming={false}
                    interactiveLayerIds={interactiveLayerIds}
                    onMouseMove={onHover}
                >
                    <ScaleControl unit="imperial" />

                    {/* Toggle UI */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            zIndex: 1,
                            backgroundColor: 'white',
                            padding: '8px',
                            borderRadius: '4px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                        }}
                    >
                        <strong>Toggle Data Overlay:</strong>
                        <label style={{ display: 'block', marginBottom: '4px' }}>
                            <input
                                type="checkbox"
                                checked={showZip}
                                onChange={(e) => setShowZip(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            ZIP Code
                        </label>
                        <label style={{ display: 'block', marginBottom: '4px' }}>
                            <input
                                type="checkbox"
                                checked={showPrecincts}
                                onChange={(e) => setShowPrecincts(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            Federal Election 2024 Results
                        </label>

                        {/* Replaced "Legislator Districts" with separate Federal/State/Local toggles */}
                        <hr />
                        <strong>Legislator Districts:</strong>
                        <label style={{ display: 'block', marginBottom: '4px' }}>
                            <input
                                type="checkbox"
                                checked={showFederal}
                                onChange={(e) => setShowFederal(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            Show Federal Districts
                        </label>
                        <label style={{ display: 'block', marginBottom: '4px' }}>
                            <input
                                type="checkbox"
                                checked={showState}
                                onChange={(e) => setShowState(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            Show State Districts
                        </label>
                        <label style={{ display: 'block' }}>
                            <input
                                type="checkbox"
                                checked={showLocal}
                                onChange={(e) => setShowLocal(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            Show Local Districts
                        </label>
                    </div>

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

                            {/* Invisible fill for mouseover.
                                We filter out any classifications not in the visibleClassifications array. */}
                            <Layer
                                id="constituent-fill-layer"
                                type="fill"
                                paint={{
                                    'fill-color': '#000000',
                                    'fill-opacity': 0
                                }}
                                filter={[
                                    'in',
                                    ['get', 'classification'],
                                    ['literal', visibleClassifications]
                                ]}
                            />

                            {/* Visible line for boundaries */}
                            <Layer
                                id="constituent-line-layer"
                                type="line"
                                paint={constituentLinePaint}
                                filter={[
                                    'in',
                                    ['get', 'classification'],
                                    ['literal', visibleClassifications]
                                ]}
                            />
                        </Source>
                    )}

                    {/* Highlights */}
                    {/* ZIP highlight */}
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

                    {/* Precinct highlight if hovered */}
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
                                ...constituentLinePaint,
                                'line-width': 4
                            }}
                            filter={[
                                'all',
                                // Must match a hovered area_id
                                ['in', ['get', 'area_id'], ['literal', hoverInfo.hoveredConstituentIds]],
                                // Must also match a classification that’s visible
                                ['in', ['get', 'classification'], ['literal', visibleClassifications]]
                            ]}
                        />
                    )}

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
                                'line-color': '#44638c',
                                'line-width': 2
                            }}
                            layout={{
                                visibility: showZip ? 'visible' : 'none'
                            }}
                        />
                    </Source>

                    {/* Tooltip */}
                    {hoverInfo.features.length > 0 && (
                        <div
                            className="tooltip"
                            style={{
                                left: hoverInfo.x,
                                top: hoverInfo.y
                            }}
                        >
                            {[...hoverInfo.features]
                                .filter(obj => "layer" in obj)
                                .map(feat => {
                                    const layerId = feat.layer.id;
                                    const props = feat.properties;

                                    let sortKey = '';
                                    let content = null;

                                    if (layerId === 'zip-fill-layer') {
                                        sortKey = 'Zip Code';
                                        content = (
                                            <div className="tooltip-item">
                                                <div
                                                    className="constituent-tooltip-color"
                                                    style={{ backgroundColor: "#44638c" }}
                                                />
                                                <p><strong>{sortKey}:</strong> {props.area_id}</p>
                                            </div>
                                        );
                                    } else if (layerId === 'precincts-fill-layer') {
                                        sortKey = 'Precinct';
                                        content = (
                                            <div className="tooltip-item">
                                                <strong>2024 Federal Election Results</strong>
                                                <p><strong>Dem votes:</strong> {props.votes_dem}</p>
                                                <p><strong>Rep votes:</strong> {props.votes_rep}</p>
                                            </div>
                                        );
                                    } else if (layerId === 'constituent-fill-layer') {
                                        const constituent_area = JSON.parse(props.constituent_area);
                                        sortKey = constituent_area.name;
                                        content = (
                                            <div className="tooltip-item">
                                                <div
                                                    className="constituent-tooltip-color"
                                                    style={{
                                                        backgroundColor:
                                                            backgroundColorMap[props.classification] || '#cccccc'
                                                    }}
                                                />
                                                <p>
                                                    <strong>{constituent_area.name}:</strong> {props.representative_name}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return { sortKey, content };
                                })
                                .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
                                .map((item, i) => (
                                    <div key={i}>{item.content}</div>
                                ))
                            }
                        </div>
                    )}
                </Map>
            </div>

            <div className="map-page-faqs">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} faq={faq} />
                ))}
            </div>

            <div className="citations">
                "2024 Precinct-Level Election Results." New York Times, <a rel="noopener" href="https://www.nytimes.com/interactive/2025/us/elections/2024-election-map-precinct-results.html">https://www.nytimes.com/interactive/2025/us/elections/2024-election-map-precinct-results.html</a> Accessed {new Date().toLocaleDateString()}.
            </div>
        </div>
    );
}

export default MapPage;
