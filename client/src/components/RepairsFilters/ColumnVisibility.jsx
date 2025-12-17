import { useState, memo, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// Stable sx objects
const searchSx = { mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } };
const buttonContainerSx = { display: "flex", gap: 1, mb: 1.5 };
const buttonSx = { flex: 1, borderRadius: 2, borderColor: "#13293D", color: "#13293D" };
const listContainerSx = { maxHeight: 200, overflow: "auto", border: "1px solid rgba(19, 41, 61, 0.15)", borderRadius: 2, p: 1 };
const checkboxSx = { color: "#13293D", "&.Mui-checked": { color: "#13293D" } };
const itemSx = { display: "flex", width: "100%", m: 0, py: 0.5, px: 1, borderRadius: 1, "&:hover": { bgcolor: "rgba(19, 41, 61, 0.04)" } };

const ColumnCheckbox = memo(function ColumnCheckbox({ field, headerName, checked, onToggle }) {
  const handleChange = useCallback(() => {
    onToggle(field);
  }, [onToggle, field]);

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={handleChange} sx={checkboxSx} />}
      label={headerName}
      sx={itemSx}
    />
  );
});
function ColumnVisibility({ columns = [], visibleColumns = [], onVisibleColumnsChange }) {
  const [search, setSearch] = useState("");

  const filterableColumns = useMemo(() => 
    columns.filter((col) => col.type !== "actions" && col.headerName !== "מחק"),
    [columns]
  );

  const filteredColumns = useMemo(() => 
    filterableColumns.filter((col) => col.headerName?.toLowerCase().includes(search.toLowerCase())),
    [filterableColumns, search]
  );

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const handleToggle = useCallback((field) => {
    const updated = visibleColumns.includes(field)
      ? visibleColumns.filter((f) => f !== field)
      : [...visibleColumns, field];
    onVisibleColumnsChange?.(updated);
  }, [visibleColumns, onVisibleColumnsChange]);

  const handleSelectAll = useCallback(() => {
    onVisibleColumnsChange?.(filterableColumns.map((c) => c.field));
  }, [filterableColumns, onVisibleColumnsChange]);

  const handleDeselectAll = useCallback(() => {
    onVisibleColumnsChange?.([]);
  }, [onVisibleColumnsChange]);

  const searchAdornment = useMemo(() => (
    <InputAdornment position="start">
      <SearchIcon sx={{ color: "#13293D" }} />
    </InputAdornment>
  ), []);

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} color="#13293D" sx={{ mb: 1.5 }}>
        תצוגת עמודות
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="חפש עמודה..."
        value={search}
        onChange={handleSearchChange}
        InputProps={{ startAdornment: searchAdornment }}
        sx={searchSx}
      />

      <Box sx={buttonContainerSx}>
        <Button size="small" variant="outlined" onClick={handleSelectAll} startIcon={<VisibilityIcon />} sx={buttonSx}>
          הצג הכל
        </Button>
        <Button size="small" variant="outlined" onClick={handleDeselectAll} startIcon={<VisibilityOffIcon />} sx={buttonSx}>
          הסתר הכל
        </Button>
      </Box>

      <Box sx={listContainerSx}>
        {filteredColumns.map((column) => (
          <ColumnCheckbox
            key={column.field}
            field={column.field}
            headerName={column.headerName}
            checked={visibleColumns.includes(column.field)}
            onToggle={handleToggle}
          />
        ))}
      </Box>
    </Box>
  );
}

export default memo(ColumnVisibility);