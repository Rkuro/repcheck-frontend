import { backendUrl } from "../../config";


export const getBillsByZip = async (
	zip,
	page = 1,
	{
		has_votes = false,
		date_type,
		start_date,
		end_date,
		jurisdiction_level,
		representative_ids = [],
		sort_by,
		sort_order,
	} = {}
) => {
	try {
		const url = new URL(`${backendUrl}/api/zipcodes/${zip}/bills`);

		// Required pagination params
		url.searchParams.append('page', page);
		url.searchParams.append('has_votes', has_votes);

		// Optional filters
		if (date_type) url.searchParams.append('date_type', date_type);
		if (start_date) url.searchParams.append('start_date', start_date);
		if (end_date) url.searchParams.append('end_date', end_date);
		if (jurisdiction_level) {
			url.searchParams.append('jurisdiction_level', jurisdiction_level);
		}

		// If representative_ids is an array, append each one individually
		if (representative_ids.length > 0) {
			representative_ids.forEach((repId) => {
				url.searchParams.append('representative_ids', repId);
			});
		}

		// Optional sorting
		if (sort_by) url.searchParams.append('sort_by', sort_by);
		if (sort_order) url.searchParams.append('sort_order', sort_order);

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`Error fetching bills: ${response.statusText}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching bills:', error);
	}
};


export const getBill = async (billId) => {
	try {
		let params = new URLSearchParams({ bill_id: billId });
		const url = new URL(`${backendUrl}/api/bills`)
		url.search = params.toString();
		const response = await fetch(url);
		if (!response.ok) {
			console.error(response);
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		// Handle different possible data structures
		const bill = data.results?.[0] || data.bills?.[0] || data;
		return bill;
	} catch (error) {
		console.error('Error fetching bill data:', error);
		return error;
	}
}

export const getReps = async (zipCode) => {

	try {
		const url = new URL(`${backendUrl}/api/people/${zipCode}`);
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error("Network response was not okay");
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching rep data:', error);
		return error;
	}
}

export const getRepsById = async (repIds) => {

	try {
		const url = new URL(`${backendUrl}/api/people`);
		const response = await fetch(url, {
			method: 'POST', headers: {
				"Content-Type": "application/json", // Indicates we're sending JSON
				"Accept": "application/json",        // Indicates we want JSON back
			},
			body: JSON.stringify({
				ids: repIds
			})
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching rep data:', error);
		return error;
	}
}

export const getZipCode = async (zip_code) => {

	try {
		const url = new URL(`${backendUrl}/api/zipcodes/${zip_code}`);
		const response = await fetch(url, {
			method: 'GET', headers: {
				"Content-Type": "application/json", // Indicates we're sending JSON
				"Accept": "application/json",        // Indicates we want JSON back
			}
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching zipcode:', error);
		return error;
	}
}


/**
 * Fetch precincts within `radiusMiles` miles of the ZIP code’s centroid.
 * 
 * @param {string} zipCode - The ZIP code to look up (e.g. "90210").
 * @param {number} [radiusMiles=5.0] - The radius in miles (defaults to 5.0).
 * @returns {Promise<object>} - Returns the JSON response or throws an error.
 */
export const getPrecincts = async (zipCode, radiusMiles = 5.0) => {
	try {
		// Construct the URL with query parameter "radius_miles"
		const url = `${backendUrl}/api/precincts/${zipCode}?radius_miles=${radiusMiles}`;

		const response = await fetch(url);
		if (!response.ok) {
			// You can throw a more descriptive error if needed
			throw new Error(`Failed to fetch precincts: ${response.statusText}`);
		}

		// Convert response to JSON
		const data = await response.json();

		// The backend response should look like:
		// {
		//   "zip_code": <string>,
		//   "radius_miles": <number>,
		//   "count": <number>,
		//   "precincts": [ { ... }, { ... } ],
		//   "error": <string?>  // possibly
		// }
		// You can do additional data checks as needed
		return data;
	} catch (error) {
		console.error("Error in getPrecincts:", error);
		throw error; // Re-throw so your caller can handle it
	}
};


export const getAreaGeometry = async (area_id) => {
	const url = `${backendUrl}/api/areas/${encodeURIComponent(area_id)}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch area geometry: ${response.statusText}`);
	}
	return await response.json(); // Should contain { area_id, geometry, error }
};
