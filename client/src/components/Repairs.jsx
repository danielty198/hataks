import React, { useEffect, useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';

const statusOptions = ['ממתין', 'בטיפול', 'הושלם'];

export default function CarRepairTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    carModel: '',
    ownerName: '',
    repairDate: '',
    status: 'ממתין',
    notes: ''
  });

  // -------------------------
  // GET — fetch repairs
  // -------------------------
  const fetchRepairs = async () => {
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/repairs');
      const data = await res.json();

      setRows(
        data.map(r => ({
          id: r._id,
          ...r,
          repairDate: r.repairDate
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  // -------------------------
  // OPEN dialog new/edit
  // -------------------------
  const handleOpenNew = () => {
    setEditing(null);
    setForm({ carModel: '', ownerName: '', repairDate: '', status: 'ממתין', notes: '' });
    setOpenDialog(true);
  };

  const handleOpenEdit = row => {
    setEditing(row.id);
    setForm({
      carModel: row.carModel,
      ownerName: row.ownerName,
      repairDate: dayjs(row.repairDate).format('YYYY-MM-DD'),
      status: row.status,
      notes: row.notes || ''
    });
    setOpenDialog(true);
  };

  // -------------------------
  // DELETE
  // -------------------------
  const handleDelete = async id => {
    if (!window.confirm('למחוק את התיקון?')) return;

    await fetch(`http://localhost:5000/api/repairs/${id}`, {
      method: 'DELETE'
    });

    setRows(prev => prev.filter(r => r.id !== id));
  };

  // -------------------------
  // SAVE (POST or PUT)
  // -------------------------
  const handleSave = async () => {
    const payload = {
      carModel: form.carModel,
      ownerName: form.ownerName,
      repairDate: new Date(form.repairDate),
      status: form.status,
      notes: form.notes
    };

    if (editing) {
      // PUT
      const res = await fetch(`http://localhost:5000/api/repairs/${editing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const updated = await res.json();

      setRows(prev =>
        prev.map(r => (r.id === editing ? { id: updated._id, ...updated } : r))
      );
    } else {
      // POST
      const res = await fetch(`http://localhost:5000/api/repairs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const created = await res.json();

      setRows(prev => [{ id: created._id, ...created }, ...prev]);
    }

    setOpenDialog(false);
  };

  // -------------------------
  // COLUMNS
  // -------------------------
  const columns = [
    { field: 'carModel', headerName: 'דגם רכב', flex: 1 },
    { field: 'ownerName', headerName: 'שם בעלים', flex: 1 },
    {
      field: 'repairDate',
      headerName: 'תאריך',
      flex: 1,
      valueFormatter: params => dayjs(params.value).format('DD/MM/YYYY')
    },
    { field: 'status', headerName: 'סטטוס', flex: 1 },
    { field: 'notes', headerName: 'הערות', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      getActions: params => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="ערוך"
          onClick={() => handleOpenEdit(params.row)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="מחק"
          onClick={() => handleDelete(params.id)}
          showInMenu={false}
        />
      ]
    }
  ];

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<span>+</span>}
        onClick={handleOpenNew}
        sx={{ mb: 2 }}
      >
        הוספת תיקון
      </Button>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick />
      </div>

      {/* ----------------------
          Dialog
      ----------------------- */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{editing ? 'עריכת תיקון' : 'הוספת תיקון חדש'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="דגם רכב"
            value={form.carModel}
            onChange={e => setForm({ ...form, carModel: e.target.value })}
            fullWidth
          />

          <TextField
            label="שם בעלים"
            value={form.ownerName}
            onChange={e => setForm({ ...form, ownerName: e.target.value })}
            fullWidth
          />

          <TextField
            label="תאריך תיקון"
            type="date"
            value={form.repairDate}
            onChange={e => setForm({ ...form, repairDate: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="סטטוס"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            fullWidth
          >
            {statusOptions.map(s => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="הערות"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
          <Button onClick={handleSave} variant="contained">
            שמירה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
