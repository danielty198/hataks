import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { hatakTypeOptions } from '../../../assets';

const EditPieDialog = ({ open, currentType, onSave, onCancel }) => {
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedType(currentType);
    }
  }, [open, currentType]);

  const handleSave = () => {
    onSave(selectedType);
  };

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>בחר סוג חט"כ</DialogTitle>
      <DialogContent sx={{ minWidth: 300 }}>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>סוג חט"כ</InputLabel>
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            label="סוג חט״כ"
          >
            {hatakTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>ביטול</Button>
        <Button onClick={handleSave} variant="contained">
          שמור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPieDialog;
