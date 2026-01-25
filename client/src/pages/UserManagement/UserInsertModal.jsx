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
import { baseUrl, roles, SYSTEM, userServiceUrl } from "../../assets";

export default function UserInsertModal({ open, onClose, onSubmit, editData, ROUTE, rows }) {
    const [formData, setFormData] = useState({ pid: "", role: [] });
    const [pidOptions, setPidOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        setFormData({ pid: "", role: [] });

    }, [open]);

    // Fetch PID options for autocomplete
    const fetchPidOptions = async () => {
        try {
            const response = await fetch(
                `${userServiceUrl}/api/${ROUTE}/getPids?system=${SYSTEM}`
            );

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const pidOptions = await response.json();
            setPidOptions(pidOptions);
        } catch (error) {
            console.error("Error fetching PID options:", error);
        }
    };

    useEffect(() => {
        fetchPidOptions();
    }, [rows])
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                                onChange={(e,) => handleChange("pid", e.target.value)}
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
                        onChange={(e) => handleChange('role', e.target.value)}
                        required
                        fullWidth
                        SelectProps={{
                            multiple: true,
                            renderValue: (selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const roleLabel = roles?.find(r => r.value === value)?.label;
                                        return <Chip key={value} value={value} label={roleLabel} size="small" />;
                                    })}
                                </Box>
                            ),
                        }}
                    >
                        {roles?.map(el => {
                            return <MenuItem key={el.value} name={el.value} value={el.value}>{el.label}</MenuItem>
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
                    הוסף
                </Button>
            </DialogActions>
        </Dialog>
    );
}