import { styled, alpha, StepConnector, stepConnectorClasses, Dialog, Box, Paper, Button, IconButton } from '@mui/material';
import { colors } from '../../../assets';

export const ColorlibConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 24,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 4,
    border: 0,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
}));

export const ColorlibStepIconRoot = styled('div')(({ ownerState }) => ({
  backgroundColor: colors.border,
  zIndex: 1,
  color: '#999',
  width: 52,
  height: 52,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  border: `3px solid ${colors.border}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(ownerState.active && {
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    color: colors.white,
    border: `3px solid ${colors.primary}`,
    boxShadow: `0 6px 20px ${alpha(colors.primary, 0.4)}`,
    transform: 'scale(1.1)',
  }),
  ...(ownerState.completed && {
    background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.successLight} 100%)`,
    color: colors.white,
    border: `3px solid ${colors.success}`,
  }),
}));

export const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '92vh',
  },
}));

export const StyledDialogTitle = styled(Box)(() => ({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  color: colors.white,
  padding: '28px 32px',
  position: 'relative',
}));

export const SectionTitle = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 28,
  paddingBottom: 16,
  borderBottom: `2px solid ${alpha(colors.primary, 0.15)}`,
}));

export const SectionIcon = styled(Box)(() => ({
  width: 42,
  height: 42,
  borderRadius: 12,
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.white,
}));

export const FormCardStyled = styled(Paper)(() => ({
  padding: 28,
  borderRadius: 16,
  backgroundColor: colors.cardBg,
  border: `1px solid ${colors.border}`,
  marginBottom: 24,
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
}));

export const ActionButtonStyled = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '12px 28px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  minWidth: 130,
  '&.Mui-disabled': {
    opacity: 0.6,
    background: 'linear-gradient(135deg, #bdbdbd 0%, #e0e0e0 100%)',
    color: '#757575',
    boxShadow: 'none',
  },
}));

export const CloseButton = styled(IconButton)(() => ({
  position: 'absolute',
  left: 24,
  top: '50%',
  transform: 'translateY(-50%)',
  color: colors.white,
  backgroundColor: alpha(colors.white, 0.15),
  width: 44,
  height: 44,
  '&:hover': {
    backgroundColor: alpha(colors.white, 0.25),
  },
}));

export const FieldWrapper = styled(Box)(() => ({
  width: '100%',
  minWidth: 0,
}));

export const FieldsRow = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 24,
  marginBottom: 24,
  '&:last-child': {
    marginBottom: 0,
  },
}));

export const FieldsRowTwo = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 24,
  marginBottom: 24,
  '&:last-child': {
    marginBottom: 0,
  },
}));

export const FullWidthField = styled(Box)(() => ({
  width: '100%',
}));