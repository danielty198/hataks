import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import useRepairHistory from './useRepairHistory';
import {
  getAvailableDates,
  filterHistoryByDate,
  groupHistoryByDate,
} from './utils';

// Components
import DialogHeader from './components/DialogHeader';
import DateFilter from './components/DateFilter';
import Timeline from './components/Timeline';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

const RepairHistoryDialog = ({ open, onClose, repairId }) => {
  const [selectedDate, setSelectedDate] = useState('all');
  const { historyData, loading, error, refetch } = useRepairHistory(repairId, open);

  // Reset date filter when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedDate('all');
    }
  }, [open]);

  // Memoized computations
  const availableDates = useMemo(
    () => getAvailableDates(historyData),
    [historyData]
  );

  const filteredHistory = useMemo(
    () => filterHistoryByDate(historyData, selectedDate),
    [historyData, selectedDate]
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

  const showDateFilter = !loading && !error && historyData.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '85vh',
        },
      }}
    >
      <DialogHeader
        repairId={repairId}
        loading={loading}
        onRefresh={refetch}
        onClose={onClose}
      />

      {showDateFilter && (
        <DateFilter
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          availableDates={availableDates}
          totalCount={historyData.length}
        />
      )}

      <DialogContent sx={{ pt: 3 }}>{renderContent()}</DialogContent>
    </Dialog>
  );
};

export default RepairHistoryDialog;
