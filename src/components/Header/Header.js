// src/components/Header/Header.js
import React, { useContext } from 'react';
import { ZipCodeContext } from '../../contexts/ZipCodeContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ toggleSidebar }) {
	const { zipCode } = useContext(ZipCodeContext);
	const navigate = useNavigate();

	const handleChangeZip = () => {
		navigate('/');
	};

	return (
		<header className="header">
			<div className="header-left">
				<div className="hamburger-menu" onClick={toggleSidebar}>
					{/* Divs here are styled to look like 3 lines in a hamburger menu */}
					<div></div>
					<div></div>
					<div></div>
				</div>
				<h1>Repcheck</h1>
				<div className='beta'>BETA</div>
			</div>
			{zipCode && (
				<div className="zip-code-display">
					<span>Zip Code: <div>{zipCode}</div></span>
					<button onClick={handleChangeZip}>Change</button>
				</div>
			)}
		</header>
	);
}

export default Header;
