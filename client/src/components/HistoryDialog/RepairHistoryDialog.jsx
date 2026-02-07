import React, { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import useRepairHistory from './useRepairHistory';
import { useDistinctValues } from '../../contexts/DistinctValuesContext';
import {
  getAvailableFilterOptions,
  getInitialFilters,
  filterHistory,
  groupHistoryByDate,
} from './utils';

// Components
import DialogHeader from './components/DialogHeader';
import HistoryFilters from './components/HistoryFilters';
import Timeline from './components/Timeline';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

const RepairHistoryDialog = ({ open, onClose, repairId, currentEngineHistory, refreshTrigger }) => {
  const [filters, setFilters] = useState(getInitialFilters());
  const { historyData, loading, error, refetch } = useRepairHistory(repairId, open);
  
  // Get distinct values from context for dynamic filter options
  const { distinctValues } = useDistinctValues();

  // Refetch history when parent requests refresh (e.g. after saving repair from InsertModal)
  React.useEffect(() => {
    if (open && repairId && refreshTrigger != null && refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger]);

  // Reset filters when dialog closes
  React.useEffect(() => {
    if (!open) {
      setFilters(getInitialFilters());
    }
  }, [open]);

  // Handle filter change
  const handleFilterChange = useCallback((field, values) => {
    setFilters((prev) => ({
      ...prev,
      [field]: values,
    }));
  }, []);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setFilters(getInitialFilters());
  }, []);

  // Memoized computations
  const availableOptions = useMemo(
    () => getAvailableFilterOptions(historyData, distinctValues),
    [historyData, distinctValues]
  );

  const filteredHistory = useMemo(
    () => filterHistory(historyData, filters),
    [historyData, filters]
  );

  const groupedHistory = useMemo(
    () => groupHistoryByDate(filteredHistory),
    [filteredHistory]
  );

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} onRetry={refetch} />;
    }

    if (filteredHistory.length === 0) {
      return <EmptyState hasData={historyData.length > 0} />;
    }

    return <Timeline groupedHistory={groupedHistory} />;
  };

  const showFilters = !loading && !error && historyData.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogHeader
        currentEngineHistory={currentEngineHistory}
        loading={loading}
        onRefresh={refetch}
        onClose={onClose}
      />

      {showFilters && (
        <HistoryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAllFilters={handleClearAllFilters}
          availableOptions={availableOptions}
          totalCount={historyData.length}
          filteredCount={filteredHistory.length}
        />
      )}

      <DialogContent sx={{ pt: 3 }}>{renderContent()}</DialogContent>
    </Dialog>
  );
};

export default RepairHistoryDialog;
