// components/RepCard/RepCard.js
import React from 'react';
import {startCase} from 'lodash';
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

    console.log(rep);

    const handleImageError = (e) => {
        e.target.onerror = null; // Prevents looping
        e.target.src = '/Person_Image_Placeholder.png'; // Place your placeholder image in the public folder
    };

    return (
        <div className="rep-card">
            <div className="rep-image">
                <img src={image || '/Person_Image_Placeholder.png'} alt={name} onError={handleImageError} />
            </div>
            <div className="rep-info">
                <h3>{name}</h3>
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
    );
}

export default RepCard;
