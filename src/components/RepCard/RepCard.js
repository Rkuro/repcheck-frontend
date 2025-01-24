import React, { useState, useEffect } from 'react';
import { startCase } from 'lodash';
import { replaceUrlPrefix } from '../../utils';
import './RepCard.css';

function RepCard({ rep }) {
    const {
        name,
        image,
        chamber,
        constituent_area,
        jurisdiction_area,
        email,
        capitol_voice,
        district_voice,
        capitol_address,
        district_address,
        links,
    } = rep;


    const [dimensions, setDimensions] = useState(null);
    const fetchImageSize = async (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                });
            };

            img.onerror = () => {
                reject(new Error(`Failed to load image from ${url}`));
            };

            img.src = replaceUrlPrefix(url);
        });
    };

    useEffect(() => {
        const getImageSize = async () => {
            try {
                const size = await fetchImageSize(image);
                setDimensions(size);
            } catch (err) {
                console.error(err);
            }
        };

        getImageSize();
    }, [image]);

    // Dynamically calculate style
    const getDynamicStyle = () => {
        if (!dimensions) return {};
        const aspectRatio = dimensions.width / dimensions.height;

        return {
            maxWidth: aspectRatio > 1 ? '100%' : '50%', // Wider images take full width, taller ones half-width
            maxHeight: aspectRatio > 1 ? '50%' : '100%', // Adjust height proportionally
            border: '1px solid #ccc',
        };
    };

    const handleImageError = (e) => {
        e.target.onerror = null; // Prevents looping
        e.target.src = '/Person_Image_Placeholder.png'; // Place your placeholder image in the public folder
    };

    return (
        <div className="rep-card">
            <div className='rep-card-header'>
                <h3>{name}</h3>
            </div>
            <div className='rep-card-content'>
                <div className="rep-image-container">
                    <div className="rep-image">
                        <img src={replaceUrlPrefix(image) || '/Person_Image_Placeholder.png'} alt={name} onError={handleImageError} />
                    </div>
                </div>
                <div className="rep-info">
                    <p>
                        <strong>Chamber:</strong> {chamber}
                    </p>
                    <p>
                        <strong>Jurisdiction Area:</strong> {jurisdiction_area.name}
                    </p>
                    <p>
                        <strong>Constituent Area:</strong> {constituent_area.name}
                    </p>

                    {email && (
                        <p>
                            <strong>Email:</strong>{' '}
                            <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer">
                                {email}
                            </a>
                        </p>
                    )}
                    {(capitol_voice || district_voice) && (
                        <p>
                            <strong>Phone:</strong> {capitol_voice || district_voice}
                        </p>
                    )}
                    {(capitol_address || district_address) && (
                        <p>
                            <strong>Office:</strong> {capitol_address || district_address}
                        </p>
                    )}

                    <div className="rep-social">
                        {links && links.length > 0 && links.map((link) => (
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                {startCase(link.note)}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RepCard;
