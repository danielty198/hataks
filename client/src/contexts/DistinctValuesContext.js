import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { baseUrl } from '../assets';

// Create the context
const DistinctValuesContext = createContext();

// Provider component
export const DistinctValuesProvider = ({ children }) => {
    const [distinctValues, setDistinctValues] = useState({});  // State to store distinct values
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch distinct values for specified fields



    useEffect(() => {
        fetchDistinctValues()
    }, [])



    const fetchDistinctValues = useCallback(async () => {


        setLoading(true);
        setError(null);

        try {

            const response = await fetch(
                `${baseUrl}/api/repairs/unique`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch distinct values');
            }

            const data = await response.json();
            console.log(data)
            setDistinctValues(prev => ({ ...prev, ...data }));
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to fetch distinct values');
            setLoading(false);
        }
    }, []);

    // Check if a value exists in a specific field
    const valueExists = (field, value) => distinctValues[field]?.includes(value) ?? false;

    // Get values for a specific field
    const getValuesForField = (field) => distinctValues[field] || [];

    return (
        <DistinctValuesContext.Provider value={{
            distinctValues,
            loading,
            error,
            fetchDistinctValues,
            valueExists,
            getValuesForField
        }}>
            {children}
        </DistinctValuesContext.Provider>
    );
};

// Custom hook
export const useDistinctValues = () => {
    return useContext(DistinctValuesContext);
};