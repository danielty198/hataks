// components/RepairHistory/components/TimelineChangeItem.jsx
import React, { useState } from 'react';
import {
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  Collapse,
} from '@mui/material';
import {
  Circle as CircleIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import {
  TimelineItem,
  TimelineDot,
  ChangeCard,
  ChangeRow,
  ValueChip,
} from '../styled';
import { fieldTranslations } from '../constants';
import { getChangeColor, formatValue, formatTime } from '../utils';

// Group fields by category
const fieldGroups = [
  {
    title: 'פרטי יחידה מוסרת',
    fields: ['sendingDivision', 'sendingBrigade', 'sendingBattalion'],
  },
  {
    title: 'פרטי יחידה מקבלת',
    fields: ['recivingDivision', 'recivingBrigade', 'recivingBattalion'],
  },
  {
    title: 'פרטי כלי',
    fields: ['zadik', 'hatakType', 'engineSerial', 'minseretSerial'],
  },
  {
    title: 'פרטי טיפול',
    fields: [
      'hatakStatus',
      'tipulType',
      'problem',
      'waitingHHType',
      'michlalNeed',
    ],
  },
  {
    title: 'מנועיה ותאריכים',
    fields: [
      'manoiya',
      'forManoiya',
      'reciveDate',
      'startWorkingDate',
      'performenceExpectation',
    ],
  },
  {
    title: 'יעד',
    fields: ['intended'],
  },
];

const TimelineChangeItem = ({ historyItem }) => {
  const [expanded, setExpanded] = useState(false);

  const mainChange = historyItem.changes[0];
  const dotColor = mainChange
    ? getChangeColor(mainChange.field, mainChange.newValue)
    : 'primary';

  // Create a map of changed fields for quick lookup
  const changesMap = new Map(
    historyItem.changes.map((c) => [
      c.field,
      { oldValue: c.oldValue, newValue: c.newValue },
    ])
  );

  // Check if we have full repair data
  const hasFullData = historyItem.oldRepair || historyItem.newRepair;
  const repairData = historyItem.newRepair || historyItem.oldRepair || {};


  const fullname = historyItem?.changedBy?.fullname;
  const pid = historyItem?.changedBy?.pid;

  const label =
    fullname && pid
      ? `${fullname} ${pid}`
      : fullname
        ? fullname
        : pid
          ? pid
          : "No data";

  return (
    <TimelineItem>
      <TimelineDot color={dotColor}>
        <CircleIcon sx={{ fontSize: 10, color: 'white' }} />
      </TimelineDot>

      <ChangeCard elevation={0}>
        {/* Time and User */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
          }}
        >
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {formatTime(historyItem.createdAt)}
          </Typography>
          <Chip
            icon={<PersonIcon sx={{ fontSize: 16 }} />}
            label={label}
            size="small"
            variant="outlined"
            sx={{ height: 26 }}
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Changes Summary */}
        <Box>
          {historyItem.changes.map((change, changeIndex) => (
            <ChangeRow key={changeIndex}>
              <Typography variant="body2" fontWeight={500} sx={{ minWidth: 80 }}>
                {fieldTranslations[change.field] || change.field}:
              </Typography>
              <ValueChip
                variant="old"
                label={formatValue(change.oldValue, change.field)}
                size="small"
              />
              <ArrowBackIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <ValueChip
                variant="new"
                label={formatValue(change.newValue, change.field)}
                size="small"
              />
            </ChangeRow>
          ))}
        </Box>

        {/* Expand Button */}
        {hasFullData && (
          <>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                mt: 1.5,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {expanded ? 'הסתר פרטים מלאים' : 'הצג פרטים מלאים'}
            </Button>

            {/* Full Details - Grouped Single Column */}
            <Collapse in={expanded}>
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                {fieldGroups.map((group) => {
                  // Check if any field in this group has data
                  const hasGroupData = group.fields.some((field) => {
                    const value = repairData[field];
                    const hasChange = changesMap.has(field);
                    return (
                      hasChange ||
                      (value !== undefined && value !== null && value !== '')
                    );
                  });

                  if (!hasGroupData) return null;

                  return (
                    <Box key={group.title} sx={{ mb: 2.5 }}>
                      {/* Group Title */}
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="primary.main"
                        sx={{
                          display: 'block',
                          mb: 1,
                          pb: 0.5,
                          borderBottom: 2,
                          borderColor: 'primary.main',
                        }}
                      >
                        {group.title}
                      </Typography>

                      {/* Group Fields */}
                      {group.fields.map((field) => {
                        const value = repairData[field];
                        const change = changesMap.get(field);

                        // Skip empty fields that weren't changed
                        if (
                          !change &&
                          (value === undefined || value === null || value === '')
                        ) {
                          return null;
                        }

                        return (
                          <DetailRow
                            key={field}
                            field={field}
                            value={value}
                            change={change}
                          />
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            </Collapse>
          </>
        )}
      </ChangeCard>
    </TimelineItem>
  );
};

// Sub-component for detail rows
const DetailRow = ({ field, value, change }) => {
  const isChanged = !!change;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        px: 1,
        borderRadius: 1,
        backgroundColor: isChanged ? 'rgba(255, 152, 0, 0.08)' : 'transparent',
        '&:hover': {
          backgroundColor: isChanged ? 'rgba(255, 152, 0, 0.15)' : 'action.hover',
        },
      }}
    >
      {/* Changed indicator */}
      {isChanged && (
        <DotIcon
          sx={{
            fontSize: 8,
            color: 'warning.main',
          }}
        />
      )}

      {/* Field name */}
      <Typography
        variant="body2"
        fontWeight={500}
        color="text.secondary"
        sx={{
          minWidth: 120,
          flexShrink: 0,
        }}
      >
        {fieldTranslations[field] || field}:
      </Typography>

      {/* Value - either changed or normal */}
      {isChanged ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'error.main',
              textDecoration: 'line-through',
            }}
          >
            {formatValue(change.oldValue, field)}
          </Typography>
          <ArrowBackIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography
            variant="body2"
            sx={{
              color: 'success.main',
              fontWeight: 600,
            }}
          >
            {formatValue(change.newValue, field)}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.primary">
          {formatValue(value, field)}
        </Typography>
      )}
    </Box>
  );
};

export default TimelineChangeItem;