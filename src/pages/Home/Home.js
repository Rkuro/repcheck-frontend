import React, { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ZipCodeContext } from '../../contexts/ZipCodeContext';
import './Home.css';

function Home() {
	const { setZipCode } = useContext(ZipCodeContext);
	const [inputZip, setInputZip] = useState('');
	const navigate = useNavigate();

	const handleUpdate = (e) => {
		const inputValue = e.target.value;

		// Allow only numeric values and limit to 5 digits
		if (/^\d{0,5}$/.test(inputValue)) {
			setInputZip(inputValue);
		}
	}

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
						type="number"
						id="zip-code"
						value={inputZip}
						onChange={handleUpdate}
						required
					/>
					<button type="submit">Go</button>
				</form>

				<div className="home-about-link">
					<NavLink to="/about">
						Why? What is this site?
					</NavLink>
				</div>
			</div>
		</div>
	);
}

export default Home;
