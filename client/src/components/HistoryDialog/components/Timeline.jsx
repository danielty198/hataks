import React from 'react';
import { Typography, Box } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { TimelineContainer } from '../styled';
import { formatDate } from '../utils';
import TimelineChangeItem from './TimelineChangeItem';

const Timeline = ({ groupedHistory }) => {
  return (
    <TimelineContainer>
      {groupedHistory.map(([dateKey, items]) => (
        <Box key={dateKey} sx={{ mb: 3 }}>
          {/* Date Header */}
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pr: 5,
            }}
          >
            <CalendarIcon fontSize="small" />
            {formatDate(items[0].createdAt)}
          </Typography>

          {/* Timeline Items */}
          {items.map((historyItem, index) => (
            <TimelineChangeItem
              key={historyItem._id || index}
              historyItem={historyItem}
              index={index}
            />
          ))}
        </Box>
      ))}
    </TimelineContainer>
  );
};

export default Timeline;
