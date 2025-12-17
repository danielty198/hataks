import React from 'react';
import { Box, Alert, IconButton } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const ErrorState = ({ error, onRetry }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        gap: 2,
      }}
    >
      <Alert severity="error" sx={{ width: '100%' }}>
        {error}
      </Alert>
      <IconButton onClick={onRetry} color="primary">
        <RefreshIcon />
      </IconButton>
    </Box>
  );
};

export default ErrorState;
