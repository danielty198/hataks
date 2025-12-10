import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DialogContent, DialogActions, Divider, Box, Typography, alpha } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';

import StepperHeader from './components/StepperHeader';
import ActionButtons from './components/ActionButtons';
import StepRashi from './components/steps/StepRashi';
import StepYechida from './components/steps/StepYechida';
import StepAcher from './components/steps/StepAcher';

import { StyledDialog, StyledDialogTitle } from './styles/styledComponents';
import { colors, steps, getDefaultFormData } from './constants';
import { hatakStatusOptions, hatakTypeOptions, intendedOptions, manoiyaOptions, ogdotOptions } from '../../assets';

const InsertModal = ({
  open,
  onClose,
  onSubmit,
  editData = null,
  waitingHHTypeOptions = [],
  zadikOptions = [],
  brigadeOptions = [],
  battalionOptions = [],
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(getDefaultFormData());
  const [errors, setErrors] = useState({});

  const isEditMode = useMemo(() => editData !== null, [editData]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          ...getDefaultFormData(),
          ...editData,
          reciveDate: editData.reciveDate ? dayjs(editData.reciveDate) : dayjs(),
          startWorkingDate: editData.startWorkingDate ? dayjs(editData.startWorkingDate) : null,
        });
      } else {
        setFormData({ ...getDefaultFormData(), reciveDate: dayjs() });
      }
      setActiveStep(0);
      setErrors({});
    }
  }, [open, editData]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateStep = useCallback((step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.manoiya) newErrors.manoiya = true;
      if (!formData.hatakType) newErrors.hatakType = true;
      if (!formData.engineSerial) newErrors.engineSerial = true;
      if (!formData.hatakStatus) newErrors.hatakStatus = true;
      if (!formData.tipulType) newErrors.tipulType = true;
      if (!formData.problem) newErrors.problem = true;
      if (!formData.reciveDate) newErrors.reciveDate = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  }, [activeStep, validateStep]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const handleSubmit = useCallback(() => {
    console.log(handleSubmit)
    if (validateStep(activeStep)) {
      const submitData = {
        ...formData,
        reciveDate: formData.reciveDate?.toISOString(),
        startWorkingDate: formData.startWorkingDate?.toISOString(),
      };
      onSubmit(submitData, isEditMode);
      onClose();
    }
  }, [activeStep, formData, isEditMode, onClose, onSubmit, validateStep]);

  const dialogTitle = useMemo(() => isEditMode ? 'עריכת רשומה' : 'הוספת רשומה חדשה', [isEditMode]);

  const stepDescription = useMemo(
    () => `${steps[activeStep].description} • שלב ${activeStep + 1} מתוך ${steps.length}`,
    [activeStep]
  );

  const memoizedOptions = useMemo(() => ({
    manoiyaOptions,
    hatakTypeOptions,
    hatakStatusOptions,
    intendedOptions,
    ogdotOptions,
    zadikOptions,
    brigadeOptions,
    battalionOptions,
    waitingHHTypeOptions
  }), [zadikOptions, brigadeOptions, battalionOptions, waitingHHTypeOptions]);

  const renderStepContent = useMemo(() => {
    switch (activeStep) {
      case 0:
        return (
          <StepRashi
            formData={formData}
            errors={errors}
            onChange={handleChange}
            manoiyaOptions={memoizedOptions.manoiyaOptions}
            hatakTypeOptions={memoizedOptions.hatakTypeOptions}
            hatakStatusOptions={memoizedOptions.hatakStatusOptions}
            zadikOptions={memoizedOptions.zadikOptions}
          />
        );
      case 1:
        return (
          <StepYechida
            formData={formData}
            onChange={handleChange}
            ogdotOptions={memoizedOptions.ogdotOptions}
            brigadeOptions={memoizedOptions.brigadeOptions}
            battalionOptions={memoizedOptions.battalionOptions}
          />
        );
      case 2:
        return (
          <StepAcher
            formData={formData}
            onChange={handleChange}
            waitingHHTypeOptions={memoizedOptions.waitingHHTypeOptions}
            manoiyaOptions={memoizedOptions.manoiyaOptions}
            intendedOptions={memoizedOptions.intendedOptions}
          />
        );
      default:
        return null;
    }
  }, [activeStep, formData, errors, handleChange, memoizedOptions]);

  return (
      <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth dir="rtl">
        <StyledDialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                backgroundColor: alpha(colors.white, 0.2),
                borderRadius: 3,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isEditMode ? <EditIcon sx={{ fontSize: 32 }} /> : <AddIcon sx={{ fontSize: 32 }} />}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {dialogTitle}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {stepDescription}
              </Typography>
            </Box>
          </Box>
        </StyledDialogTitle>

        <DialogContent sx={{ p: 4, backgroundColor: colors.background }}>
          <StepperHeader activeStep={activeStep} />
          <Box sx={{ minHeight: 420 }}>{renderStepContent}</Box>
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            px: 4,
            py: 2.5,
            backgroundColor: colors.white,
            gap: 2,
            justifyContent: 'space-between',
          }}
        >
          <ActionButtons
            activeStep={activeStep}
            onClose={onClose}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isEditMode={isEditMode}
          />
        </DialogActions>
      </StyledDialog>
  );
};

export default React.memo(InsertModal);




