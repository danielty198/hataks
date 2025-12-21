import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Autocomplete,
    MenuItem,
    Button,
    Box,
    Chip
} from "@mui/material";
import { baseUrl, roles } from "../../assets";

export default function UserInsertModal({ open, onClose, onSubmit, editData }) {
    const [formData, setFormData] = useState({ pid: "", role: [] });
    const [pidOptions, setPidOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setFormData({
                pid: editData.pid || "",
                role: Array.isArray(editData.role) ? editData.role : [editData.role || "user"],
            });
        } else {
            setFormData({ pid: "", role: [] });
        }
    }, [editData, open]);

    // Fetch PID options for autocomplete
    useEffect(() => {
        const fetchPidOptions = async () => {
            try {
                const res = await fetch(`${baseUrl}/api/pids`);
                const data = await res.json();
                setPidOptions(data);
            } catch (err) {
                console.error("Failed to fetch PID options:", err);
            }
        };
        if (open) {
            fetchPidOptions();
        }
    }, [open]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRoleChange = (event) => {
        const selectedValue = event.target.value[0];
console.log(selectedValue)
        setFormData(prev => {
            const currentRoles = prev.role;

            // Check if the value already exists in the array
            if (currentRoles.includes(selectedValue)) {
                // Remove it if it exists
                return { ...prev, role: currentRoles.filter(role => role !== selectedValue) };
            } else {
                // Add it if it doesn't exist
                return { ...prev, role: [...currentRoles, selectedValue] };
            }
        });
    };

    const handleSubmit = async () => {
        if (!formData.pid || !formData.role.length) {
            return;
        }

        setLoading(true);
        await onSubmit(formData, !!editData);
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editData ? "עריכת משתמש" : "הוספת משתמש"}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                    <Autocomplete
                        options={pidOptions}
                        value={formData.pid}
                        onChange={(e, newValue) => handleChange("pid", newValue)}
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="שם משתמש"
                                required
                                fullWidth
                            />
                        )}
                    />

                    <TextField
                        select
                        label="תפקיד"
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e)}
                        required
                        fullWidth
                        SelectProps={{
                            multiple: true,
                            renderValue: (selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const roleLabel = roles?.find(r => r.name === value)?.label;
                                        return <Chip key={value} label={roleLabel} size="small" />;
                                    })}
                                </Box>
                            ),
                        }}
                    >
                        {roles?.map(el => {
                            return <MenuItem key={el.value} value={el.value}>{el.label}</MenuItem>
                        })}
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>ביטול</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !formData.pid || !formData.role.length}
                >
                    {editData ? "עדכן" : "הוסף"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}