import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DialogContent, DialogActions, Divider, Box, Typography, alpha } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';

import StepperHeader from './components/StepperHeader';
import ActionButtons from './components/ActionButtons';
import StepRashi from './components/steps/StepRashi';
import StepYechida from './components/steps/StepYechida';
import StepAcher from './components/steps/StepAcher';

import { StyledDialog, StyledDialogTitle } from './styles/styledComponents';
import { colors, steps, getDefaultFormData, waitingHHTypeRequiredString, baseUrl } from '../../assets';



const InsertModal = ({
  open,
  onClose,
  onSubmit,
  setEditData,
  editData = null,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(getDefaultFormData());
  const [errors, setErrors] = useState({});
  const [rashiNextButtonDisable, setRashiNextButtonDisable] = useState(false)


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
    if (field === 'engineSerial' && (value === 0 || value) && value.length > 0) {
      const lastChar = value[value.length - 1];
      if (!/[0-9]/.test(lastChar)) {
        return;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (prev[field]?.error) {
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
      if (!formData.manoiya) newErrors.manoiya = { error: true, msg: 'שדה חובה' };
      if (!formData.hatakType) newErrors.hatakType = { error: true, msg: 'שדה חובה' };
      if (!formData.engineSerial) newErrors.engineSerial = { error: true, msg: 'שדה חובה' };
      if (!formData.hatakStatus) newErrors.hatakStatus = { error: true, msg: 'שדה חובה' };
      if (!formData.tipulType) newErrors.tipulType = { error: true, msg: 'שדה חובה' };
      if (!formData.problem) newErrors.problem = { error: true, msg: 'שדה חובה' };
      if (!formData.reciveDate) newErrors.reciveDate = { error: true, msg: 'שדה חובה' };
    }

    // Validate step 2 (StepAcher) - check if waitingHHType is required

    if (step === 2) {
      if (formData.hatakStatus === waitingHHTypeRequiredString) {
        if (!formData.waitingHHType || formData.waitingHHType.length === 0) {
          newErrors.waitingHHType = { error: true, msg: 'שדה חובה - נא לבחור סיבת המתנה' };
        }
      }
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




  const handleEngineBlur = useCallback((field, value) => {
    if (field !== "engineSerial") return;
    if (!value) return;

    // IMPORTANT: don't rely on loaded distinct options (they're paginated).
    // Always check the DB by attempting to fetch the engine row.
    fetch(`${baseUrl}/api/repairs/getByEngine/${value}`)
      .then(async (res) => {
        if (res.status === 404) return null; // engine does not exist
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return await res.json();
      })
      .then((data) => {
        if (!data) {
          setRashiNextButtonDisable(false);
          return;
        }

        const stay = window.confirm("מנוע זה כבר קיים במערכת האם לטעון נתונים על המנוע הזה?");
        if (!stay) {
          setRashiNextButtonDisable(true);
          setErrors((prev) => ({ ...prev, engineSerial: { error: true, msg: "לא ניתן להוסיף מספר מנוע קיים" } }));
          return;
        }

        setEditData(data);
        setRashiNextButtonDisable(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, [setEditData]);


  const dialogTitle = useMemo(() => isEditMode ? 'עריכת רשומה' : 'הוספת רשומה חדשה', [isEditMode]);

  const stepDescription = useMemo(
    () => `${steps[activeStep].description} • שלב ${activeStep + 1} מתוך ${steps.length}`,
    [activeStep]
  );

  const renderStepContent = useMemo(() => {
    switch (activeStep) {
      case 0:
        return (
          <StepRashi
            handleEngineBlur={handleEngineBlur}
            formData={formData}
            editData={editData}
            errors={errors}
            onChange={handleChange}
          />
        );
      case 1:
        return (
          <StepYechida
            formData={formData}
            onChange={handleChange}
          />
        );
      case 2:
        return (
          <StepAcher
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />
        );
      default:
        return null;
    }
  }, [activeStep, formData, errors, handleChange]);

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
          rashiNextButtonDisable={rashiNextButtonDisable}
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
