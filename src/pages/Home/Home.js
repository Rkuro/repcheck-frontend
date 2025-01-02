// src/pages/Home/Home.js
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZipCodeContext } from '../../contexts/ZipCodeContext';
import './Home.css';

function Home() {
	const { setZipCode } = useContext(ZipCodeContext);
	const [inputZip, setInputZip] = useState('');
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();
		setZipCode(inputZip);
		navigate('/bills');
	};

	return (
		<div className="home">
			<div className="home-container">
				<h2>Enter your zip code</h2>
				<form onSubmit={handleSubmit}>
					<input
						type="text"
						id="zip-code"
						value={inputZip}
						onChange={(e) => setInputZip(e.target.value)}
						required
						maxLength="10"
					/>
					<button type="submit">Go</button>
				</form>
			</div>
		</div>
	);
}

export default Home;
