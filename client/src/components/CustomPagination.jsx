// CustomPagination.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Pagination, Box, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

const CustomPagination = ({ 
  rowsCount,
  onFetchData,
  initialPageSize = 15,
  showPageSize = true,
  pageSizeOptions = [10, 15, 25, 50, 100],
  debounceDelay = 300,
  resetToPage1 = false, // NEW PROP
  onResetComplete, // NEW PROP - callback after reset
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const urlPage = parseInt(searchParams.get('page')) || 1;
  const urlPageSize = parseInt(searchParams.get('pageSize')) || initialPageSize;
  
  const [paginationModel, setPaginationModel] = useState({
    page: urlPage - 1,
    pageSize: urlPageSize,
  });

  const debounceTimerRef = useRef(null);
  const totalPages = Math.ceil(rowsCount / paginationModel.pageSize);

  // Watch for URL changes (browser back/forward)
  useEffect(() => {
    const currentUrlPage = parseInt(searchParams.get('page')) || 1;
    const currentUrlPageSize = parseInt(searchParams.get('pageSize')) || initialPageSize;
    
    if (currentUrlPage - 1 !== paginationModel.page || currentUrlPageSize !== paginationModel.pageSize) {
      setPaginationModel({
        page: currentUrlPage - 1,
        pageSize: currentUrlPageSize
      });
    }
  }, [searchParams, initialPageSize]);

  // Reset pagination when resetToPage1 changes
  useEffect(() => {
    if (resetToPage1 && paginationModel.page !== 0) {
      setPaginationModel(prev => ({
        ...prev,
        page: 0
      }));
      onResetComplete?.(); // Notify parent that reset is complete
    }
  }, [resetToPage1, onResetComplete]);

  // Debounced fetch
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      await onFetchData(paginationModel.page, paginationModel.pageSize);
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [paginationModel.page, paginationModel.pageSize, debounceDelay, onFetchData]);

  // Update URL immediately (no debounce)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('page', paginationModel.page + 1);
    params.set('pageSize', paginationModel.pageSize);
    setSearchParams(params, { replace: true });
  }, [paginationModel.page, paginationModel.pageSize]);

  const handlePageChange = (event, value) => {
    setPaginationModel(prev => ({
      ...prev,
      page: value - 1
    }));
  };

  const handlePageSizeChange = (event) => {
    setPaginationModel({
      page: 0,
      pageSize: event.target.value
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        position: 'relative',
        flexWrap: 'wrap',
      }}
    >
      {showPageSize && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>שורות בעמוד</InputLabel>
          <Select
            value={paginationModel.pageSize}
            label="שורות בעמוד"
            onChange={handlePageSizeChange}
          >
            {pageSizeOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        {rowsCount === 0 
          ? 'אין שורות' 
          : `${paginationModel.page * paginationModel.pageSize + 1}-${Math.min((paginationModel.page + 1) * paginationModel.pageSize, rowsCount)} מתוך ${rowsCount}`
        }
      </Typography>

      <Pagination
        count={totalPages}
        page={paginationModel.page + 1}
        onChange={handlePageChange}
        color="primary"
        showFirstButton
        showLastButton
        disabled={rowsCount === 0}
        size="small"
      />
    </Box>
  );
};

export default CustomPagination;