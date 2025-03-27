import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css'

function Footer() {

    {/* Footer Section */}
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>
                © {new Date().getFullYear()} RepCheck • Empowering Citizens With
                Government Transparency
                </p>
                <ul className="footer-links">
                    
                <li><NavLink to="/privacy">Privacy Policy</NavLink></li>
                <li><NavLink to="/terms-of-use">Terms of Use</NavLink></li>
                <li><a href="mailto:info@repcheck.us">Contact</a></li>
                </ul>
            </div>
        </footer>
    )
}

export default Footer;