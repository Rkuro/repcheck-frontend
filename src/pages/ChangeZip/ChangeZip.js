import React, { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ZipCodeContext } from '../../contexts/ZipCodeContext';
import { ArrowRight } from 'react-feather';
import './ChangeZip.css';

function ChangeZip() {
  const { zipCode, setZipCode } = useContext(ZipCodeContext);
  const [inputZip, setInputZip] = useState(zipCode);
  const navigate = useNavigate();

  const handleUpdate = (e) => {
    const inputValue = e.target.value;
    // Allow only numeric values and limit to 5 digits
    if (/^\d{0,5}$/.test(inputValue)) {
      setInputZip(inputValue);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setZipCode(inputZip);
    navigate('/bills');
  };

  return (
    <div className="change-zip">
      <div className="change-zip-container">
        <h2>Enter your zip code</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            id="zip-code"
            value={inputZip}
            onChange={handleUpdate}
            required
          />
          <button type="submit" className="submit-button">
            Get Started <ArrowRight className="arrow-icon" />
          </button>
        </form>
        <div className="change-zip-about-link">
          <NavLink to="/about">
            Why? What is this site?
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default ChangeZip;
