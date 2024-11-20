// components/RepCard/RepCard.js
import React from 'react';
import './RepCard.css';

function RepCard({ rep }) {
    const {
        name,
        image,
        current_party,
        current_chamber,
        current_district,
        email,
        capitol_voice,
        district_voice,
        capitol_address,
        district_address,
        twitter,
        facebook,
        instagram,
        youtube,
        links,
    } = rep;

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
                    <strong>Party:</strong> {current_party}
                </p>
                <p>
                    <strong>Chamber:</strong> {current_chamber}
                </p>
                <p>
                    <strong>District:</strong> {current_district}
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
                    {twitter && (
                        <a href={`https://twitter.com/${twitter}`} target="_blank" rel="noopener noreferrer">
                            Twitter
                        </a>
                    )}
                    {facebook && (
                        <a href={`https://facebook.com/${facebook}`} target="_blank" rel="noopener noreferrer">
                            Facebook
                        </a>
                    )}
                    {instagram && (
                        <a
                            href={`https://instagram.com/${instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Instagram
                        </a>
                    )}
                    {youtube && (
                        <a href={`https://youtube.com/${youtube}`} target="_blank" rel="noopener noreferrer">
                            YouTube
                        </a>
                    )}
                    {links && links.length > 0 && (
                        <a href={links[0]} target="_blank" rel="noopener noreferrer">
                            Website
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RepCard;
