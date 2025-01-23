// Bills.js
import React, { useContext, useEffect, useState } from 'react';
import { ZipCodeContext } from '../../contexts/ZipCodeContext';
import BillCard from '../../components/BillCard/BillCard';
import './Bills.css';
import backendUrl from '../../config';
import { getBillsByZip } from '../../services/repcheck_backend/api';
import { Sliders } from 'react-feather';
import Select from 'react-select';

function Bills() {
	const { zipCode } = useContext(ZipCodeContext);
	const [bills, setBills] = useState([]);
	const [representatives, setRepresentatives] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// --- Filter/Sort States ---
	const [showFilters, setShowFilters] = useState(false);
	const [hasVotes, setHasVotes] = useState(true);
	const [jurisdictionLevel, setJurisdictionLevel] = useState(''); // '' | 'federal' | 'state' | 'local'
	const [dateType, setDateType] = useState('latest_action_date'); // 'creation_date' | 'latest_action_date'
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [selectedRepIds, setSelectedRepIds] = useState([]);
	const [sortBy, setSortBy] = useState('latest_action_date');
	const [sortOrder, setSortOrder] = useState('desc');

	useEffect(() => {
		if (zipCode) {
			fetchRepresentatives(zipCode);
			fetchBills();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [zipCode, currentPage]);

	// Fetch your representatives for the multi-select
	const fetchRepresentatives = async (zip) => {
		try {
			const response = await fetch(`${backendUrl}/api/people/${zip}`);
			if (!response.ok) {
				throw new Error(`Error fetching representatives: ${response.statusText}`);
			}
			const data = await response.json();
			setRepresentatives(data);
		} catch (error) {
			console.error('Error fetching representatives:', error);
			setError('Unable to fetch representatives. Please try again later.');
		}
	};

	const fetchBills = async (page = currentPage) => {
		if (!zipCode) return;

		setLoading(true);
		setError(null);

		try {
			const data = await getBillsByZip(zipCode, page, {
				has_votes: hasVotes,
				date_type: dateType,
				start_date: startDate || undefined,
				end_date: endDate || undefined,
				jurisdiction_level: jurisdictionLevel || undefined,
				representative_ids: selectedRepIds,
				sort_by: sortBy,
				sort_order: sortOrder,
			});

			setBills(data?.bills || []);
			setTotalPages(data?.total_pages || 1);
		} catch (error) {
			console.error('Error fetching bills:', error);
			setError('Unable to fetch bills. Please try again later.');
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
		// The useEffect will trigger fetchBills on currentPage change
	};

	// Handle changes to filters/sorts by re-fetching from page 1
	const handleFilterChange = () => {
		closeFilters();
		setCurrentPage(1);
		fetchBills(1);
	};

	const closeFilters = () => {
		setShowFilters(false);
	};

	const toggleFiltersOpen = () => {
		setShowFilters((prev) => !prev);
	};

	if (!zipCode) {
		return <p>Please enter your zip code on the Home page.</p>;
	}

	return (
		<div className="bills">
			<BillsFilter
				showFilters={showFilters}
				closeFilters={closeFilters}
				setShowFilters={setShowFilters}
				hasVotes={hasVotes}
				setHasVotes={setHasVotes}
				jurisdictionLevel={jurisdictionLevel}
				setJurisdictionLevel={setJurisdictionLevel}
				dateType={dateType}
				setDateType={setDateType}
				startDate={startDate}
				setStartDate={setStartDate}
				endDate={endDate}
				setEndDate={setEndDate}
				representatives={representatives}
				selectedRepIds={selectedRepIds}
				setSelectedRepIds={setSelectedRepIds}
				sortBy={sortBy}
				setSortBy={setSortBy}
				sortOrder={sortOrder}
				setSortOrder={setSortOrder}
				handleFilterChange={handleFilterChange}
			/>

			<div className="bills-header">
				<button className="filters-button" onClick={toggleFiltersOpen}>
					<Sliders />
					<p>Filter & Sort</p>
				</button>
			</div>

			{loading && <p>Loading bills...</p>}
			{error && <p className="error">{error}</p>}
			{!loading && !error && bills.length === 0 && <p>No bills found for your area.</p>}

			<div className="bills-container">
				{bills.map((bill) => (
					<BillCard key={bill.id} bill={bill} representatives={representatives} />
				))}
			</div>

			{/* Pagination Controls */}
			<div className="pagination">
				<button
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1 || loading}
				>
					Previous
				</button>
				<span>{` Page ${currentPage} of ${totalPages} `}</span>
				<button
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages || loading}
				>
					Next
				</button>
			</div>
		</div>
	);
}

function BillsFilter({
	showFilters,
	closeFilters,
	setShowFilters,
	hasVotes,
	setHasVotes,
	jurisdictionLevel,
	setJurisdictionLevel,
	dateType,
	setDateType,
	startDate,
	setStartDate,
	endDate,
	setEndDate,
	representatives,
	selectedRepIds,
	setSelectedRepIds,
	sortBy,
	setSortBy,
	sortOrder,
	setSortOrder,
	handleFilterChange
}) {
	// react-select options for single selects:
	const jurisdictionOptions = [
		{ value: '', label: 'All' },
		{ value: 'federal', label: 'Federal' },
		{ value: 'state', label: 'State' },
		{ value: 'local', label: 'Local' },
	];

	const dateTypeOptions = [
		{ value: 'latest_action_date', label: 'Latest Action Date' },
		{ value: 'creation_date', label: 'Creation Date' },
	];

	const sortByOptions = [
		{ value: 'creation_date', label: 'Creation Date' },
		{ value: 'latest_action_date', label: 'Latest Action Date' },
		{ value: 'latest_vote_date', label: 'Latest Vote Date' },
		{ value: 'title', label: 'Title' },
	];

	const sortOrderOptions = [
		{ value: 'desc', label: 'Descending' },
		{ value: 'asc', label: 'Ascending' },
	];

	// react-select options for multi-select (representatives)
	const representativeOptions = (representatives || []).map((rep) => ({
		value: rep.id,
		label: rep.name,
	}));

	return (
		<>
			<div className={`filters-modal ${showFilters ? 'active' : ''}`}>
				<div className="filters-header">
					<h3>Filter & Sort</h3>
				</div>
				<div className="filters">
					{/* has_votes toggle */}
					<label className="has-votes">
						<input
							type="checkbox"
							checked={hasVotes}
							onChange={(e) => setHasVotes(e.target.checked)}
						/>
						Has at least one vote
					</label>

					{/* Jurisdiction (Single Select) */}
					<label>
						Jurisdiction:
						<Select
							options={jurisdictionOptions}
							value={jurisdictionOptions.find(
								(option) => option.value === jurisdictionLevel
							)}
							onChange={(selected) =>
								setJurisdictionLevel(selected ? selected.value : '')
							}
						// classNamePrefix="react-select"
						/>
					</label>

					{/* Date Type (Single Select) */}
					<label>
						Date Type:
						<Select
							options={dateTypeOptions}
							value={dateTypeOptions.find((option) => option.value === dateType)}
							onChange={(selected) =>
								setDateType(selected ? selected.value : 'latest_action_date')
							}
						/>
					</label>

					{/* Start / End Date (HTML date inputs remain) */}
					<label>
						Start Date:
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</label>
					<label>
						End Date:
						<input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
					</label>

					{/* Representative IDs: react-select multi */}
					<label className="rep-filter">
						Filter by Representative(s):
						<Select
							isMulti
							name="representatives"
							options={representativeOptions}
							value={representativeOptions.filter((opt) =>
								selectedRepIds.includes(opt.value)
							)}
							onChange={(selectedOptions) => {
								setSelectedRepIds(
									selectedOptions ? selectedOptions.map((opt) => opt.value) : []
								);
							}}
						/>
					</label>

					{/* Sort By (Single Select) */}
					<label>
						Sort By:
						<Select
							options={sortByOptions}
							value={sortByOptions.find((option) => option.value === sortBy)}
							onChange={(selected) =>
								setSortBy(selected ? selected.value : 'creation_date')
							}
						/>
					</label>

					{/* Sort Order (Single Select) */}
					<label>
						Sort Order:
						<Select
							options={sortOrderOptions}
							value={sortOrderOptions.find((option) => option.value === sortOrder)}
							onChange={(selected) =>
								setSortOrder(selected ? selected.value : 'desc')
							}
						/>
					</label>
				</div>

				<div className="apply-filters">
					{/* Apply Filters Button */}
					<button onClick={handleFilterChange}>Apply Filters</button>
				</div>
			</div>

			{showFilters && <div className="overlay" onClick={closeFilters}></div>}
		</>
	);
}

export default Bills;
