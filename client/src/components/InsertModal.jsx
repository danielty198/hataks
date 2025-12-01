import React, { useState, cloneElement } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
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
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const onClose = () => {
    setOpen(false);
    setError(null);
    setFormData({});
    setValidationErrors({});
  }

  const handleInputChange = (e) => {
    const { id, name, value } = e.target;
    const fieldName = id || name;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear validation error when user types
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleAutocompleteChange = (fieldName) => (event, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear validation error when user selects
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleDateChange = (fieldName) => (value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value || null }));
    // Clear validation error when user selects date
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    modalContent.forEach((field) => {
      const fieldProps = field.props || {};
      const fieldId = fieldProps.id || fieldProps.name;
      const isRequired = fieldProps.required;
      
      if (isRequired) {
        // For DatePicker, check the slotProps.textField.id
        if (field.type?.displayName === 'DatePicker' || fieldProps.label?.includes('תאריך') || field.key?.toLowerCase().includes('date')) {
          const existingSlotProps = fieldProps.slotProps || {};
          const textFieldProps = existingSlotProps.textField || {};
          const textFieldId = textFieldProps.id || fieldId;
          
          if (!formData[textFieldId]) {
            errors[textFieldId] = true;
          }
        } else {
          // For all other fields
          if (!formData[fieldId] || formData[fieldId] === '') {
            errors[fieldId] = true;
          }
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form first
    if (!validateForm()) {
      setError('נא למלא את כל השדות הנדרשים');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
      
      setFormData({});
      setValidationErrors({});
      
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const enhancedModalContent = modalContent.map((field) => {
    const fieldProps = field.props || {};
    const fieldId = fieldProps.id || fieldProps.name;
    const hasError = validationErrors[fieldId];
    
    // Clone the element and add necessary props
    if (field.type?.name === 'Autocomplete' || field.type?.displayName === 'Autocomplete') {
      return cloneElement(field, {
        value: formData[fieldId] || null,
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
    } else if (field.type?.displayName === 'DatePicker' || fieldProps.label?.includes('תאריך') || field.key?.toLowerCase().includes('date')) {
      const existingSlotProps = fieldProps.slotProps || {};
      const textFieldProps = existingSlotProps.textField || {};
      const textFieldId = textFieldProps.id || fieldId;
      const dateHasError = validationErrors[textFieldId];
      
      const dateValue = formData[textFieldId];
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
    } else {
      return cloneElement(field, {
        value: formData[fieldId] || '',
        onChange: handleInputChange,
        fullWidth: true,
        error: hasError,
        helperText: hasError ? 'שדה חובה' : undefined,
        key: field.key,
        sx: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#f8f9fa',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: hasError ? '0 0 0 2px rgba(211, 47, 47, 0.2)' : '0 0 0 2px rgba(19, 41, 61, 0.1)',
            }
          },
          '& .MuiInputLabel-root': {
            fontSize: '1rem',
            fontWeight: 500,
          }
        }
      });
    }
  });

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
          sx: {
            borderRadius: '16px',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: '#13293D',
            color: 'white',
            py: 3,
            px: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={{
              color: 'white',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ py: 5, px: 5, bgcolor: '#fafbfc' }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: '12px',
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: '16px',
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Grid container spacing={4}>
              {enhancedModalContent.map((field, index) => (
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
              ))}
            </Grid>
          </Paper>
        </DialogContent>
        
        <Divider />
        
        <DialogActions 
          sx={{ 
            px: 5, 
            py: 3,
            bgcolor: '#ffffff',
            gap: 2,
            justifyContent: 'flex-start'
          }}
        >
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
            size="large"
            sx={{
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
            }}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
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
            }}
          >
            {loading ? 'שומר...' : 'שמור'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}