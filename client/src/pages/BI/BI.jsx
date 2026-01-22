import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import ViewToggle from './components/ViewToggle';
import ManoiyaFilter from './components/ManoiyaFilter';
import SharedLegend from './components/SharedLegend';
import PieChartsGrid from './components/PieChartsGrid';
import ComplexTable from './components/ComplexTable';
import EditPieDialog from './components/EditPieDialog';
import { baseUrl } from '../../assets';


const DEFAULT_HATAK_TYPES = [
  "סימן 4",
  "סימן 3",
  "נמר",
  "נמר MTU",
  "נמר אחזקה",
];

const BIPage = () => {
  const [viewMode, setViewMode] = useState('table');
  const [selectedManoiya, setSelectedManoiya] = useState([]);
  const [pieTypes, setPieTypes] = useState(DEFAULT_HATAK_TYPES);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPieIndex, setEditingPieIndex] = useState(null);

  // Data states
  const [pieData, setPieData] = useState({});
  const [tableData, setTableData] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch pie data from backend
  const fetchPieData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      pieTypes.forEach((type) => params.append('hatakTypes', type));
      selectedManoiya.forEach((m) => params.append('manoiya', m));

      const response = await fetch(`${baseUrl}/api/bi/pie-data?${params}`);
      if (response.ok) {
        const result = await response.json();
        setPieData(result.pieData || {});
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching pie data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch table data from backend
  const fetchTableData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/bi/table-data`);
      if (response.ok) {
        const result = await response.json();
        setTableData(result.tableData || {});
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when view mode or filters change
  useEffect(() => {
    if (viewMode === 'pies') {
      fetchPieData();
    } else {
      fetchTableData();
    }
  }, [viewMode, selectedManoiya, pieTypes]);

  // Edit handlers
  const handleEditClick = (index) => {
    setEditingPieIndex(index);
    setEditDialogOpen(true);
  };

  const handleEditSave = (newType) => {
    if (newType && editingPieIndex !== null) {
      const newPieTypes = [...pieTypes];
      newPieTypes[editingPieIndex] = newType;
      setPieTypes(newPieTypes);
    }
    setEditDialogOpen(false);
    setEditingPieIndex(null);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingPieIndex(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        דוח BI - סטטוס חט"כ לפי סוג
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ViewToggle value={viewMode} onChange={setViewMode} />
        {viewMode === 'pies' && <>
          <ManoiyaFilter value={selectedManoiya} onChange={setSelectedManoiya} />
          <Typography variant="body2" color="text.secondary">
            סה"כ: {totalCount} רשומות
          </Typography>
        </>}
      </Paper>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Pie Charts View */}
      {!loading && viewMode === 'pies' && (
        <Box>
          <SharedLegend />
          <PieChartsGrid
            pieTypes={pieTypes}
            pieData={pieData}
            onEdit={handleEditClick}
          />
        </Box>
      )}

      {/* Table View */}
      {!loading && viewMode === 'table' && (
        <ComplexTable tableData={tableData} />
      )}

      {/* Edit Dialog */}
      <EditPieDialog
        open={editDialogOpen}
        currentType={editingPieIndex !== null ? pieTypes[editingPieIndex] : ''}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
      />
    </Box>
  );
};

export default BIPage;
