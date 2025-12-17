import { styled } from '@mui/material/styles';
import { Box, Paper, Chip } from '@mui/material';

export const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingRight: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    right: 11,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.palette.divider,
  },
}));

export const TimelineItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingBottom: theme.spacing(3),
  paddingRight: theme.spacing(4),
  '&:last-child': {
    paddingBottom: 0,
  },
}));

export const TimelineDot = styled(Box)(({ theme, color = 'primary' }) => ({
  position: 'absolute',
  right: -4,
  top: 4,
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: theme.palette[color]?.main || theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  boxShadow: `0 0 0 4px ${theme.palette.background.paper}`,
}));

export const ChangeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    boxShadow: theme.shadows[2],
  },
}));

export const ChangeRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.75, 0),
  '&:not(:last-child)': {
    borderBottom: `1px dashed ${theme.palette.divider}`,
  },
}));

export const ValueChip = styled(Chip)(({ theme, variant }) => ({
  fontFamily: 'monospace',
  fontSize: '0.8rem',
  height: 24,
  ...(variant === 'old' && {
    backgroundColor: theme.palette.error.light + '30',
    color: theme.palette.error.dark,
    textDecoration: 'line-through',
  }),
  ...(variant === 'new' && {
    backgroundColor: theme.palette.success.light + '30',
    color: theme.palette.success.dark,
  }),
}));
