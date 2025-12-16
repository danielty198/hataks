import { colors } from '../../../assets';

export const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: colors.white,
    height: '56px',
    '& fieldset': {
      borderColor: colors.border,
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: colors.primaryLight,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary,
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: '#666',
    '&.Mui-focused': {
      color: colors.primary,
    },
  },
  '& .MuiSelect-select': {
    padding: '16px 14px',
  },
};

export const multilineInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: colors.white,
    height: 'auto',
    minHeight: '120px',
    alignItems: 'flex-start',
    '& fieldset': {
      borderColor: colors.border,
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: colors.primaryLight,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary,
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: '#666',
    '&.Mui-focused': {
      color: colors.primary,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '16px 14px',
  },
};