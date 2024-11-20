// ZipCodeContext.js
import React, { createContext, useState, useEffect } from 'react';

export const ZipCodeContext = createContext();

export const ZipCodeProvider = ({ children }) => {
  const [zipCode, setZipCode] = useState(() => {
    // Initialize zipCode from localStorage if available
    return localStorage.getItem('zipCode') || '';
  });

  useEffect(() => {
    // Update localStorage whenever zipCode changes
    if (zipCode) {
      localStorage.setItem('zipCode', zipCode);
    } else {
      localStorage.removeItem('zipCode');
    }
  }, [zipCode]);

  return (
    <ZipCodeContext.Provider value={{ zipCode, setZipCode }}>
      {children}
    </ZipCodeContext.Provider>
  );
};