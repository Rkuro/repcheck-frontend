import {backendUrl} from "../../config";

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