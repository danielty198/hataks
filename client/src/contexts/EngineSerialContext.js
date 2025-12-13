import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { baseUrl } from '../assets';


// Create the context
const EngineSerialContext = createContext();

// Provider component
export const EngineSerialProvider = ({ children }) => {
    const [enginesList, setEnginesList] = useState([]);  // State to store engineSerial data
    const [loading, setLoading] = useState(true); // Loading state for fetching
    const [error, setError] = useState(null); // Error state if fetch fails

    // Memoize the fetch function so it doesn't change on every render
    const fetchEngineSerials = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/repairs/getEngines');

            if (!response.ok) {
                throw new Error('Failed to fetch engineSerials');
            }

            const data = await response.json();  // Parse the JSON response
            console.log(data)
            // Ensure data is an array
            setEnginesList(data);  // If data is not an array, fallback to empty array
            setLoading(false);  // Set loading to false after data is fetched
        } catch (err) {
            setError(err.message || 'Failed to fetch engineSerials');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch engine serials from the API on component mount
        fetchEngineSerials();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const engineExists = (engine) => {
        fetchEngineSerials()
        return enginesList.includes(engine)
    }
    return (
        <EngineSerialContext.Provider value={{ enginesList, loading, error, fetchEngineSerials, engineExists }}>
            {children}
        </EngineSerialContext.Provider>
    );
};

// Custom hook to use engineSerial context in other components
export const useEngineSerials = () => {
    return useContext(EngineSerialContext);
};