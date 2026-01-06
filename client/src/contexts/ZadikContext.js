import React, { createContext, useContext, useState, useCallback } from 'react';

const ZadikContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/zadiks';

export const ZadikProvider = ({ children }) => {
  const [zadiks, setZadiks] = useState([]);
  const [selectedZadik, setSelectedZadik] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Autocomplete search
  const searchZadiks = useCallback(async (query, limit = 100) => {
    if (!query || query.trim().length === 0) {
      setZadiks([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search zadiks');
      }

      const result = await response.json();
      setZadiks(result.data || []);
      return result.data || [];
    } catch (err) {
      setError(err.message);
      setZadiks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get zadik by ID
  const getZadikById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (!response.ok) {
        throw new Error('Zadik not found');
      }

      const result = await response.json();
      setSelectedZadik(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all zadiks with pagination
  const getAllZadiks = useCallback(async (page = 1, pageSize = 100) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}?page=${page}&pageSize=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch zadiks');
      }

      const result = await response.json();
      setZadiks(result.data || []);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear results
  const clearZadiks = useCallback(() => {
    setZadiks([]);
    setSelectedZadik(null);
    setError(null);
  }, []);

  const value = {
    zadiks,
    selectedZadik,
    loading,
    error,
    searchZadiks,
    getZadikById,
    getAllZadiks,
    clearZadiks,
    setSelectedZadik
  };

  return (
    <ZadikContext.Provider value={value}>
      {children}
    </ZadikContext.Provider>
  );
};

export const useZadik = () => {
  const context = useContext(ZadikContext);
  if (!context) {
    throw new Error('useZadik must be used within a ZadikProvider');
  }
  return context;
};
