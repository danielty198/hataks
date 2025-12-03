import React, { useState, cloneElement, useCallback, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Slide,
  IconButton,
  Typography,
  Divider,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { baseUrl } from '../assets.js';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Memoize static styles
const dialogPaperSx = {
  borderRadius: '16px',
  maxHeight: '90vh',
};

const dialogTitleSx = {
  background: '#13293D',
  color: 'white',
  py: 3,
  px: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const closeButtonSx = {
  color: 'white',
  '&:hover': {
    background: 'rgba(255,255,255,0.1)',
    transform: 'rotate(90deg)',
  },
  transition: 'all 0.3s ease'
};

const dialogContentSx = { py: 5, px: 5, bgcolor: '#fafbfc' };

const alertSx = {
  mb: 4,
  borderRadius: '12px',
};

const paperSx = {
  p: 4,
  borderRadius: '16px',
  bgcolor: 'white',
  border: '1px solid',
  borderColor: 'divider'
};

const dialogActionsSx = {
  px: 5,
  py: 3,
  bgcolor: '#ffffff',
  gap: 2,
  justifyContent: 'flex-start'
};

const cancelButtonSx = {
  borderRadius: '16px',
  px: 5,
  py: 1.5,
  fontSize: '1rem',
  fontWeight: 600,
  borderWidth: 2,
  borderColor: '#13293D',
  color: '#13293D',
  '&:hover': {
    borderWidth: 2,
    borderColor: '#0d1e2b',
    backgroundColor: 'rgba(19, 41, 61, 0.04)',
    transform: 'translateY(-1px)',
  },
  transition: 'all 0.2s ease'
};

const saveButtonSx = {
  borderRadius: '16px',
  px: 5,
  py: 1.5,
  fontSize: '1rem',
  fontWeight: 600,
  backgroundColor: '#13293D',
  '&:hover': {
    backgroundColor: '#0d1e2b',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(19, 41, 61, 0.3)'
  },
  '&:disabled': {
    backgroundColor: '#cccccc',
  },
  transition: 'all 0.2s ease'
};

const textFieldBaseSx = {
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.3s ease',
    backgroundColor: '#ffffff',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 2px rgba(19, 41, 61, 0.1)',
    }
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
    fontWeight: 500,
  }
};

const textFieldErrorSx = {
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.3s ease',
    backgroundColor: '#ffffff',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 2px rgba(211, 47, 47, 0.2)',
    }
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
    fontWeight: 500,
  }
};

export default function DynamicFormDialog(props) {
  const { 
    open, 
    setOpen, 
    onSuccess, 
    modalContent = [],
    title,
    route
  } = props;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Store refs for text fields
  const fieldRefsRef = useRef({});
  
  // Only store state for non-text fields (autocomplete, date, select)
  const [controlledFields, setControlledFields] = useState({});

  const onClose = useCallback(() => {
    setOpen(false);
    setError(null);
    fieldRefsRef.current = {};
    setControlledFields({});
    setValidationErrors({});
  }, [setOpen]);

  const handleControlledFieldChange = useCallback((fieldName, value) => {
    setControlledFields(prev => ({ ...prev, [fieldName]: value }));
    setValidationErrors(prev => {
      if (prev[fieldName]) {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleAutocompleteChange = useCallback((fieldName) => (event, value) => {
    handleControlledFieldChange(fieldName, value);
  }, [handleControlledFieldChange]);

  const handleDateChange = useCallback((fieldName) => (value) => {
    handleControlledFieldChange(fieldName, value || null);
  }, [handleControlledFieldChange]);

  const clearTextFieldError = useCallback((fieldName) => {
    setValidationErrors(prev => {
      if (prev[fieldName]) {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const getFormData = useCallback(() => {
    const data = { ...controlledFields };
    
    // Get values from text field refs
    Object.entries(fieldRefsRef.current).forEach(([fieldName, ref]) => {
      if (ref && ref.value !== undefined) {
        data[fieldName] = ref.value;
      }
    });
    
    return data;
  }, [controlledFields]);

  const validateForm = useCallback(() => {
    const errors = {};
    const formData = getFormData();
    
    modalContent.forEach((field) => {
      const fieldProps = field.props || {};
      const fieldId = fieldProps.id || fieldProps.name;
      const isRequired = fieldProps.required;
      
      if (isRequired) {
        if (field.type?.displayName === 'DatePicker' || fieldProps.label?.includes('תאריך') || field.key?.toLowerCase().includes('date')) {
          const existingSlotProps = fieldProps.slotProps || {};
          const textFieldProps = existingSlotProps.textField || {};
          const textFieldId = textFieldProps.id || fieldId;
          
          if (!formData[textFieldId]) {
            errors[textFieldId] = true;
          }
        } else {
          if (!formData[fieldId] || formData[fieldId] === '') {
            errors[fieldId] = true;
          }
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [modalContent, getFormData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      setError('נא למלא את כל השדות הנדרשים');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = getFormData();
      
      const response = await fetch(`${baseUrl}/api/${route}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create record');
      }

      const data = await response.json();
      
      fieldRefsRef.current = {};
      setControlledFields({});
      setValidationErrors({});
      
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [validateForm, route, getFormData, onSuccess, onClose]);

  const handleErrorClose = useCallback(() => setError(null), []);

  // Determine field type and create appropriate element
  const enhancedModalContent = useMemo(() => {
    return modalContent.map((field) => {
      const fieldProps = field.props || {};
      const fieldId = fieldProps.id || fieldProps.name;
      const hasError = validationErrors[fieldId];
      const isSelect = fieldProps.select || field.type?.name === 'Select';
      const isAutocomplete = field.type?.name === 'Autocomplete' || field.type?.displayName === 'Autocomplete';
      const isDatePicker = field.type?.displayName === 'DatePicker' || fieldProps.label?.includes('תאריך') || field.key?.toLowerCase().includes('date');
      
      // Use controlled state for select, autocomplete, and date fields
      if (isAutocomplete) {
        return cloneElement(field, {
          value: controlledFields[fieldId] || null,
          onChange: handleAutocompleteChange(fieldId),
          key: field.key,
          sx: { 
            '& .MuiOutlinedInput-root': {
              transition: 'all 0.3s ease',
              backgroundColor: '#ffffff',
              borderColor: hasError ? '#d32f2f' : undefined,
              '&:hover': {
                backgroundColor: '#f8f9fa',
              },
              '&.Mui-focused': {
                backgroundColor: '#ffffff',
                boxShadow: hasError ? '0 0 0 2px rgba(211, 47, 47, 0.2)' : '0 0 0 2px rgba(19, 41, 61, 0.1)',
              }
            }
          }
        });
      } else if (isDatePicker) {
        const existingSlotProps = fieldProps.slotProps || {};
        const textFieldProps = existingSlotProps.textField || {};
        const textFieldId = textFieldProps.id || fieldId;
        const dateHasError = validationErrors[textFieldId];
        
        const dateValue = controlledFields[textFieldId];
        const safeValue = (dateValue === undefined || dateValue === '' || dateValue === null) ? null : dateValue;
        
        return cloneElement(field, {
          value: safeValue,
          onChange: handleDateChange(textFieldId),
          slotProps: {
            ...existingSlotProps,
            textField: {
              ...textFieldProps,
              fullWidth: true,
              error: dateHasError,
              helperText: dateHasError ? 'שדה חובה' : undefined,
              sx: {
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    boxShadow: dateHasError ? '0 0 0 2px rgba(211, 47, 47, 0.2)' : '0 0 0 2px rgba(19, 41, 61, 0.1)',
                  }
                }
              }
            }
          },
          key: field.key
        });
      } else if (isSelect) {
        // Select fields need controlled state for native selects
        return cloneElement(field, {
          value: controlledFields[fieldId] || '',
          onChange: (e) => handleControlledFieldChange(fieldId, e.target.value),
          fullWidth: true,
          error: hasError,
          helperText: hasError ? 'שדה חובה' : undefined,
          key: field.key,
          sx: hasError ? textFieldErrorSx : textFieldBaseSx
        });
      } else {
        // Regular text fields - use uncontrolled with refs
        return cloneElement(field, {
          inputRef: (ref) => {
            if (ref) {
              fieldRefsRef.current[fieldId] = ref;
            }
          },
          defaultValue: '',
          onChange: () => clearTextFieldError(fieldId),
          fullWidth: true,
          error: hasError,
          helperText: hasError ? 'שדה חובה' : undefined,
          key: field.key,
          sx: hasError ? textFieldErrorSx : textFieldBaseSx
        });
      }
    });
  }, [modalContent, validationErrors, controlledFields, handleAutocompleteChange, handleDateChange, handleControlledFieldChange, clearTextFieldError]);

  // Memoize grid items with animation
  const gridItems = useMemo(() => {
    return enhancedModalContent.map((field, index) => (
      <Grid 
        item 
        xs={12} 
        sm={6}
        md={4}
        lg={3}
        key={field.key || index}
        sx={{
          minWidth: '15%',
          animation: `fadeIn 0.4s ease-out ${index * 0.03}s both`,
          '@keyframes fadeIn': {
            from: {
              opacity: 0,
              transform: 'translateY(10px)'
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        {field}
      </Grid>
    ));
  }, [enhancedModalContent]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="xl"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          elevation: 8,
          sx: dialogPaperSx
        }}
      >
        <DialogTitle sx={dialogTitleSx}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={closeButtonSx}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={dialogContentSx}>
          {error && (
            <Alert 
              severity="error" 
              sx={alertSx}
              onClose={handleErrorClose}
            >
              {error}
            </Alert>
          )}
          
          <Paper elevation={0} sx={paperSx}>
            <Grid container spacing={4}>
              {gridItems}
            </Grid>
          </Paper>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={dialogActionsSx}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
            size="large"
            sx={cancelButtonSx}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={saveButtonSx}
          >
            {loading ? 'שומר...' : 'שמור'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}