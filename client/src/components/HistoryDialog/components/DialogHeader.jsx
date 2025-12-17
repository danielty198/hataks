import React from 'react';
import { DialogTitle, IconButton, Typography, Box } from '@mui/material';
import {
  Close as CloseIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const DialogHeader = ({ repairId, loading, onRefresh, onClose }) => {
  return (
    <DialogTitle
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <HistoryIcon color="primary" />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            היסטוריית שינויים
          </Typography>
          {repairId && (
            <Typography variant="caption" color="text.secondary">
              תיקון #{repairId.slice(-6).toUpperCase()}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <IconButton
          onClick={onRefresh}
          size="small"
          disabled={loading}
          title="רענן"
        >
          <RefreshIcon />
        </IconButton>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
  );
};

export default DialogHeader;
