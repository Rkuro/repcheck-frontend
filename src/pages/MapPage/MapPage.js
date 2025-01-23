import React, { useEffect, useContext, useState, useCallback } from 'react';
import { ZipCodeContext } from '../../contexts/ZipCodeContext';
import { getReps, getZipCode } from '../../services/repcheck_backend/api';
import Map, {Source, Layer} from 'react-map-gl';
import { mapBoxToken } from '../../config';
import './MapPage.css'

function MapPage() {

    const { zipCode } = useContext(ZipCodeContext);
    const [zipCodeData, setZipCodeData] = useState(null)
    const [repsData, setRepsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hoverInfo, setHoverInfo] = useState(null);

    useEffect(() => {

        const fetchData = async () => {
            try {
                setLoading(true);
                const reps = await getReps(zipCode);
                const zipCodeData = await getZipCode(zipCode);
                setRepsData(reps);
                setZipCodeData(zipCodeData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [zipCode]);

    const onHover = useCallback(event => {
        const {
          features,
          point: {x, y}
        } = event;
        const hoveredFeature = features && features[0];
    
        setHoverInfo(hoveredFeature && {feature: hoveredFeature, x, y});
    }, []);


    if (!zipCode) {
        return (
            <div className="map-page">
                <h2>You found the secret map page!</h2>
                <p>Please enter your zip code to view your map.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="map-page">
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="map-page">
                <p>Error: {error}</p>
            </div>
        );
    }

    if (repsData.length === 0) {
        return (
            <div className="map-page">
                <p>No representatives found for zip code {zipCode} so no polygons..</p>
            </div>
        );
    }

    const mapBoxZipCodeData = {
        type: "Feature",
        geometry: zipCodeData.geometry,
        properties: {}
    }

    /**
     * {
    "type": "FeatureCollection",
    "features": [
     */

    console.log(zipCodeData)
    console.log(repsData)

    return (
        <div className="map-page">
            
            <h2>Map of {zipCode}</h2>

            <div className="map-container">
                {/* Mapbox Map */}
                {/* Apparently its fine for this to be public... */}
                <Map
                    mapboxAccessToken={mapBoxToken}
                    initialViewState={{
                        longitude: zipCodeData.area.centroid_lon,
                        latitude: zipCodeData.area.centroid_lat,
                        zoom: 12
                    }}
                    style={{ height: "40vh", width: "100vw" }}
                    mapStyle="mapbox://styles/mapbox/light-v11"
                    attributionControl={false}
                    collectResourceTiming={false} // Disables telemetry
                    interactiveLayerIds={['data']}
                    onMouseMove={onHover}
                >
                    <Source id="polygon-source" type="geojson" data={mapBoxZipCodeData}>
                        <Layer
                            id="polygon-layer"
                            type="fill"
                            paint={{
                                'fill-color': '#088',
                                'fill-opacity': 0.5,
                            }}
                        />
                    </Source>
                    {hoverInfo && (
                        <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}}>
                            <div>State: {hoverInfo.feature.properties.name}</div>
                            <div>Median Household Income: {hoverInfo.feature.properties.value}</div>
                            <div>Percentile: {(hoverInfo.feature.properties.percentile / 8) * 100}</div>
                        </div>
                    )}
                </Map>
            </div>
        </div>
    )
}

export default MapPage;