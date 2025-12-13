import React from 'react';
import { Box, alpha } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import { ActionButtonStyled } from '../styles/styledComponents';
import { colors, steps } from '../../../assets';

const ActionButtons = ({ activeStep, onClose, onBack, onNext, onSubmit, isEditMode, rashiNextButtonDisable }) => (
  <>
    <ActionButtonStyled
      onClick={onClose}
      variant="outlined"
      sx={{
        color: colors.primary,
        borderColor: colors.border,
        borderWidth: 2,
        '&:hover': {
          borderColor: colors.primary,
          borderWidth: 2,
          backgroundColor: alpha(colors.primary, 0.04),
        },
      }}
    >
      ביטול
    </ActionButtonStyled>
    {console.log('actionButtons')}
    <Box sx={{ display: 'flex', gap: 2 }}>
      {activeStep > 0 && (
        <ActionButtonStyled
          onClick={onBack}
          variant="outlined"
          startIcon={<ArrowForwardIcon />}
          sx={{
            color: colors.primary,
            borderColor: colors.primaryLight,
            borderWidth: 2,
            '&:hover': {
              borderColor: colors.primary,
              borderWidth: 2,
              backgroundColor: alpha(colors.primary, 0.04),
            },
          }}
        >
          הקודם
        </ActionButtonStyled>
      )}

      {activeStep < steps.length - 1 ? (
        <ActionButtonStyled
          variant="contained"
          onClick={onNext}
          disabled={activeStep=== 0 && rashiNextButtonDisable}
          endIcon={<ArrowBackIcon />}
          sx={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            boxShadow: `0 4px 14px ${alpha(colors.primary, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
              boxShadow: `0 6px 20px ${alpha(colors.primary, 0.5)}`,
            },
          }}
        >
          הבא
        </ActionButtonStyled>
      ) : (
        <ActionButtonStyled
          variant="contained"
          onClick={onSubmit}
          startIcon={<SaveIcon />}
          sx={{
            background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.successLight} 100%)`,
            boxShadow: `0 4px 14px ${alpha(colors.success, 0.4)}`,
            minWidth: 150,
            '&:hover': {
              background: `linear-gradient(135deg, #1b5e20 0%, ${colors.success} 100%)`,
              boxShadow: `0 6px 20px ${alpha(colors.success, 0.5)}`,
            },
          }}
        >
          {isEditMode ? 'עדכון' : 'שמירה'}
        </ActionButtonStyled>
      )}
    </Box>
  </>
);

export default ActionButtons;