// pages/Reps/Reps.js
import React, { useContext, useState, useEffect } from 'react';
import './Reps.css';
import { ZipCodeContext } from '../../contexts/ZipCodeContext';
import RepCard from '../../components/RepCard/RepCard';
import { getReps, getZipCode } from '../../services/repcheck_backend/api';

function Reps() {
	const { zipCode } = useContext(ZipCodeContext);
	const [zipCodeData, setZipCodeData] = useState(null)
	const [repsData, setRepsData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

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

	if (!zipCode) {
		return (
			<div className="reps">
				<h2>Representatives</h2>
				<p>Please enter your zip code to view your representatives.</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="reps">
				<h2>Representatives</h2>
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="reps">
				<h2>Representatives</h2>
				<p>Error: {error}</p>
			</div>
		);
	}

	if (repsData.length === 0) {
		return (
			<div className="reps">
				<h2>Representatives</h2>
				<p>No representatives found for zip code {zipCode}.</p>
			</div>
		);
	}

	// Categorize reps by jurisdiction
	const federalReps = repsData.filter(
		(rep) => rep.jurisdiction_area_id === "ocd-division/country:us"
	);
	const stateReps = repsData.filter(
		(rep) => rep.jurisdiction_area_id.match(/^ocd-division\/country:us\/state:[a-z]{2}$/)
	);
	const localReps = repsData.filter(
		(rep) =>
			!federalReps.includes(rep) && !stateReps.includes(rep)
	);

	const mapBoxZipCodeData = {
		type: "Feature",
		geometry: zipCodeData.geometry,
		properties: {}
	}

	return (
		<div className="reps">
			<h2>Representatives for {zipCode}</h2>

			<h3>Federal Representatives</h3>
			{federalReps.length > 0 ? (
				<div className="reps-grid">
					{federalReps.map((rep) => (
						<RepCard key={rep.id} rep={rep} />
					))}
				</div>
			) : (
				<p>No federal representatives found for this zip code.</p>
			)}

			<h3>State Representatives</h3>
			{stateReps.length > 0 ? (
				<div className="reps-grid">
					{stateReps.map((rep) => (
						<RepCard key={rep.id} rep={rep} />
					))}
				</div>
			) : (
				<p>No state representatives found for this zip code.</p>
			)}

			<h3>Local Representatives</h3>
			{localReps.length > 0 ? (
				<div className="reps-grid">
					{localReps.map((rep) => (
						<RepCard key={rep.id} rep={rep} />
					))}
				</div>
			) : (
				<p>We don't have local representatives data yet for this zip code.</p>
			)}
		</div>
	);
}

export default Reps;
