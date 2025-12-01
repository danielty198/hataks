import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { baseUrl } from "../assets";

export default function InsertModal({ open, onClose, title, modalContent }) {
  const [formValues, setFormValues] = useState({});

  // Handle changes for TextFields
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/hataks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const data = await response.json();
      console.log("Submitted successfully:", data);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  // Clone the modalContent to attach handleChange for TextField and Autocomplete
  const renderedContent = modalContent?.map((child) => {
    if (child.type?.muiName === "TextField") {
      return React.cloneElement(child, { onChange: handleChange, fullWidth: true, margin: "normal" });
    }

    // For DatePicker
    if (child.type?.name === "DatePicker") {
      return React.cloneElement(child, {
        onChange: (date) => {
          setFormValues((prev) => ({ ...prev, [child.key]: date }));    
        },
        fullWidth: true,
        margin: "normal",
      });
    }

    // For Autocomplete
    if (child.type?.muiName === "Autocomplete") {
      return React.cloneElement(child, {
        onChange: (_, value) => {
          setFormValues((prev) => ({ ...prev, [child.key]: value }));
        },
        fullWidth: true,
        margin: "normal",
      });
    }

    return child;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box component="form">{renderedContent}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button onClick={handleSubmit} variant="contained">
          שמור
        </Button>
      </DialogActions>
    </Dialog>
  );
}
