// Votes.js
import React, { useContext, useEffect, useState } from 'react';
import { ZipCodeContext } from '../../contexts/ZipCodeContext';
import BillCard from '../../components/BillCard/BillCard';
import './Bills.css';
import backendUrl from '../../config';

function Bills() {
  const { zipCode } = useContext(ZipCodeContext);
  const [bills, setBills] = useState([]);
  const [representatives, setRepresentatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (zipCode) {
      fetchRepresentatives(zipCode);
      fetchBills(zipCode, currentPage);
    }
  }, [zipCode, currentPage]);

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

  const fetchBills = async (zip, page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/zipcodes/${zip}/bills?page=${page}`);
      if (!response.ok) {
        throw new Error(`Error fetching bills: ${response.statusText}`);
      }
      const data = await response.json();
      setBills(data.bills || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError('Unable to fetch bills. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (!zipCode) {
    return <p>Please enter your zip code on the Home page.</p>;
  }

  return (
    <div className="bills">
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

export default Bills;
