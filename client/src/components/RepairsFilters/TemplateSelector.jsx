import { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { baseUrl } from "../../assets";

export default function TemplateSelector({
  templates = [],
  selectedTemplate,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  currentFilters,
  currentVisibleColumns,
}) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newTemplateName.trim()) return;

    setSaving(true);
    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      filters: currentFilters,
      visibleColumns: currentVisibleColumns,
    };

    try {
      // Save to MongoDB via API
      await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: newTemplate }),
      });

      onSaveTemplate?.(newTemplate);
      setNewTemplateName("");
      setSaveDialogOpen(false);
    } catch (err) {
      console.error("Failed to save template:", err);
    } finally {
      setSaving(false);
    }
  };
  console.log('TemplateSelector')
  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await fetch(`${baseUrl}/api/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: templateToDelete }),
      });

      onDeleteTemplate?.(templateToDelete);
      setTemplateToDelete(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>תבנית שמורה</InputLabel>
        <Select
          value={selectedTemplate}
          onChange={(e) => onSelectTemplate?.(e.target.value)}
          label="תבנית שמורה"
          startAdornment={
            <InputAdornment position="start">
              <BookmarkIcon sx={{ color: "#13293D", fontSize: 18 }} />
            </InputAdornment>
          }
          sx={{
            borderRadius: 2,
            bgcolor: "rgba(19, 41, 61, 0.04)",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(19, 41, 61, 0.2)",
            },
          }}
        >
          <MenuItem value="">
            <em>בחר תבנית...</em>
          </MenuItem>
          {templates.map((template) => (
            <MenuItem key={template.id} value={template.id}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                {template.name}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTemplateToDelete(template.id);
                    setDeleteDialogOpen(true);
                  }}
                  sx={{ ml: 1, color: "#ff6b35" }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip title="שמור תבנית חדשה">
        <IconButton
          onClick={() => setSaveDialogOpen(true)}
          sx={{
            bgcolor: "#13293D",
            color: "#fff",
            "&:hover": { bgcolor: "#3a5f7d" },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 320 } }}>
        <DialogTitle sx={{ bgcolor: "#13293D", color: "#fff" }}>שמור תבנית חדשה</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="שם התבנית"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="לדוגמה: סטטוסים הכי טובים"
            sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSaveDialogOpen(false)} sx={{ borderRadius: 2, color: "#13293D" }}>ביטול</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!newTemplateName.trim() || saving}
            sx={{ borderRadius: 2, bgcolor: "#13293D", "&:hover": { bgcolor: "#3a5f7d" } }}
          >
            {saving ? "שומר..." : "שמור"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>מחיקת תבנית</DialogTitle>
        <DialogContent>האם אתה בטוח שברצונך למחוק את התבנית?</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: 2, color: "#13293D" }}>ביטול</Button>
          <Button variant="contained" onClick={handleDelete} sx={{ borderRadius: 2, bgcolor: "#ff6b35", "&:hover": { bgcolor: "#e55a2b" } }}>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}