import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { baseUrl } from "../../assets";
import { hatakTypeOptions } from "../../assets";

const API = "/api/switch-rules";
const containerSx = { width: "90%" };
const toolbarSx = {
  display: "flex",
  gap: 2,
  mb: 2,
  flexWrap: "wrap",
  alignItems: "center",
};

export default function SwitchRulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState({
    name: "",
    hatakTypes: [],
    forEngine: true,
    forMinseret: true,
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}${API}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "שגיאה בטעינת כללי החלפה", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleCloseSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  const openAdd = () => {
    setEditingRule(null);
    setForm({ name: "", hatakTypes: [], forEngine: true, forMinseret: true });
    setModalOpen(true);
  };

  const openEdit = (rule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name || "",
      hatakTypes: rule.hatakTypes || [],
      forEngine: rule.forEngine !== false,
      forMinseret: rule.forMinseret !== false,
    });
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.hatakTypes || form.hatakTypes.length === 0) {
      setSnackbar({ open: true, message: "יש לבחור לפחות סוג חט\"כ אחד", severity: "error" });
      return;
    }
    try {
      const url = editingRule ? `${baseUrl}${API}/${editingRule._id}` : `${baseUrl}${API}`;
      const method = editingRule ? "PATCH" : "POST";
      const body = JSON.stringify({
        name: form.name,
        hatakTypes: form.hatakTypes,
        forEngine: form.forEngine,
        forMinseret: form.forMinseret,
      });
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "שגיאה בשמירה");
      }
      setSnackbar({
        open: true,
        message: editingRule ? "הכלל עודכן בהצלחה" : "הכלל נוסף בהצלחה",
        severity: "success",
      });
      setModalOpen(false);
      fetchRules();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "שגיאה בשמירה", severity: "error" });
    }
  };

  const handleDelete = async (rule) => {
    if (!window.confirm("האם למחוק את כלל ההחלפה?")) return;
    try {
      const res = await fetch(`${baseUrl}${API}/${rule._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("מחיקה נכשלה");
      setSnackbar({ open: true, message: "הכלל נמחק בהצלחה", severity: "success" });
      fetchRules();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "שגיאה במחיקה", severity: "error" });
    }
  };

  return (
    <Box sx={containerSx}>
      <Typography variant="h1" gutterBottom>
        כללי החלפה (מנוע / ממסרת)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        הגדרת קבוצות סוגי חט&quot;כ שיכולים להחליף ביניהם. כל קבוצה יכולה לחול על החלפת מנוע, החלפת ממסרת, או שניהם.
      </Typography>

      <Box sx={toolbarSx}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          הוספת כלל
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>שם (אופציונלי)</TableCell>
              <TableCell>סוגי חט&quot;כ בקבוצה</TableCell>
              <TableCell align="center">החלפת מנוע</TableCell>
              <TableCell align="center">החלפת ממסרת</TableCell>
              <TableCell align="center">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>טוען...</TableCell>
              </TableRow>
            ) : rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>אין כללים. הוסף כלל כדי להגדיר אילו סוגי חט&quot;כ יכולים להחליף ביניהם.</TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule._id}>
                  <TableCell>{rule.name || "—"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(rule.hatakTypes || []).map((t) => (
                        <Chip key={t} label={t} size="small" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {rule.forEngine !== false ? "כן" : "לא"}
                  </TableCell>
                  <TableCell align="center">
                    {rule.forMinseret !== false ? "כן" : "לא"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(rule)} aria-label="ערוך">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(rule)} aria-label="מחק">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle>{editingRule ? "עריכת כלל החלפה" : "הוספת כלל החלפה"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="שם (אופציונלי)"
            value={form.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            fullWidth
          />
          <Autocomplete
            multiple
            options={hatakTypeOptions}
            value={Array.isArray(form.hatakTypes) ? form.hatakTypes : []}
            onChange={(_, newValue) => handleFormChange("hatakTypes", newValue || [])}
            renderInput={(params) => (
              <TextField
                {...params}
                label='סוגי חט"כ בקבוצה'
                placeholder={'בחר סוגי חט"כ'}
              />
            )}
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.forEngine}
                  onChange={(e) => handleFormChange("forEngine", e.target.checked)}
                />
              }
              label="חל על החלפת מנוע"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.forMinseret}
                  onChange={(e) => handleFormChange("forMinseret", e.target.checked)}
                />
              }
              label="חל על החלפת ממסרת"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleSave}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
