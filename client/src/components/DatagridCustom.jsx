import { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { baseUrl } from "../assets";
import DatagridFilterPanel from "./RepairsFilters/DatagridFilterPanel";

/**
 * Enhanced DataGrid component with filtering and column visibility
 * 
 * Props:
 * @param {Array} data - Optional data array (if not provided, fetches from API)
 * @param {Array} columns - Column configuration
 * @param {string} route - API route for fetching data
 * @param {string} templateGroup - Group name for filter templates (default: route value)
 * @param {boolean} showFilterPanel - Whether to show the filter panel (default: true)
 */
export default function DatagridCustom({ 
    data, 
    columns, 
    route, 
    templateGroup,
    showFilterPanel = true 
}) {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState({
        getRows: false,
        delete: false,
    });

    // Filter state
    const [filters, setFilters] = useState({});
    const [visibleColumns, setVisibleColumns] = useState(
        columns.filter(c => c.type !== "actions" && c.headerName !== "delete" && c.headerName !== "מחק").map(c => c.field)
    );

    const setLoadingFlag = useCallback((key, value) => {
        setLoading((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Build query string from filters
    const buildQueryString = useCallback((filterObj) => {
        const params = new URLSearchParams();
        
        Object.entries(filterObj).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                params.append(key, value);
            }
        });

        return params.toString();
    }, []);

    // Fetch data with filters
    const fetchData = useCallback(async (filterObj = {}) => {
        setLoadingFlag("getRows", true);
        setError(null);

        try {
            const queryString = buildQueryString(filterObj);
            const url = queryString 
                ? `${baseUrl}/api/${route}?${queryString}`
                : `${baseUrl}/api/${route}`;
            
            console.log("Fetching:", url);
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
            }

            const json = await res.json();

            if (!Array.isArray(json)) {
                throw new Error("API returned non-array response");
            }

            setRows(json);
        } catch (err) {
            console.error("❌ Data load error:", err);
            setError(err.message);
        } finally {
            setLoadingFlag("getRows", false);
        }
    }, [route, setLoadingFlag, buildQueryString]);

    // === Load rows (from props OR fetch) ===
    useEffect(() => {
        // If data provided → just use it
        if (Array.isArray(data)) {
            setRows(data);
            return;
        }

        // Otherwise, fetch from localhost
        fetchData();
    }, [data, fetchData]);

    // Handle apply filters from panel
    const handleApplyFilters = useCallback((newFilters, newVisibleColumns) => {
        setFilters(newFilters);
        setVisibleColumns(newVisibleColumns);
        
        // Only fetch if not using provided data
        if (!Array.isArray(data)) {
            fetchData(newFilters);
        }
    }, [data, fetchData]);

    // Client-side filtering when data is provided as prop
    const filteredRows = useMemo(() => {
        if (!Array.isArray(data)) {
            return rows; // Server-side filtering
        }

        // Client-side filtering
        return rows.filter(row => {
            return Object.entries(filters).every(([key, value]) => {
                if (value === "" || value === null || value === undefined) {
                    return true;
                }

                // Handle date range filters
                if (key.endsWith("_from")) {
                    const field = key.replace("_from", "");
                    const rowDate = row[field] ? new Date(row[field]) : null;
                    const filterDate = new Date(value);
                    return rowDate && rowDate >= filterDate;
                }

                if (key.endsWith("_to")) {
                    const field = key.replace("_to", "");
                    const rowDate = row[field] ? new Date(row[field]) : null;
                    const filterDate = new Date(value);
                    return rowDate && rowDate <= filterDate;
                }

                // Handle string contains
                const rowValue = row[key];
                if (typeof rowValue === "string" && typeof value === "string") {
                    return rowValue.toLowerCase().includes(value.toLowerCase());
                }

                // Exact match
                return rowValue === value;
            });
        });
    }, [rows, filters, data]);

    // === Process columns with visibility ===
    const processedColumns = useMemo(() => {
        return columns
            .filter(col => {
                // Always show actions columns
                if (col.type === "actions" || col.headerName === "delete" || col.headerName === "מחק") {
                    return true;
                }
                return visibleColumns.includes(col.field);
            })
            .map((col) => {
                const newCol = { ...col };

                // Editable
                if (newCol.isEdit) newCol.editable = true;

                // Auto date handling
                if (newCol.type === "date") {
                    newCol.valueGetter = (params) =>
                        params.value ? new Date(params.value) : null;
                }

                // Delete column
                if (newCol.headerName === "delete" || newCol.headerName === "מחק") {
                    newCol.field = newCol.field || "delete";
                    newCol.type = "actions";

                    newCol.getActions = (params) => [
                        <GridActionsCellItem
                            key="delete"
                            label="Delete"
                            icon={<DeleteIcon />}
                            onClick={async () => {
                                try {
                                    const res = await fetch(
                                        `${baseUrl}/api/delete/${params.id}`,
                                        { method: "DELETE" }
                                    );

                                    if (!res.ok) {
                                        throw new Error(
                                            `Delete failed: ${res.status} ${res.statusText}`
                                        );
                                    }

                                    setRows((prev) => prev.filter((r) => r._id !== params.id));
                                } catch (err) {
                                    console.error("❌ Delete error:", err);
                                }
                            }}
                            showInMenu
                        />,
                    ];
                }

                // Actions fallback
                if (newCol.type === "actions") {
                    if (typeof newCol.actions === "function") {
                        newCol.getActions = (params) => newCol.actions(params);
                    } else if (!newCol.getActions) {
                        newCol.getActions = () => [];
                    }
                }

                // Sane defaults
                if (!newCol.flex) newCol.flex = 1;
                if (!newCol.minWidth) newCol.minWidth = 100;

                return newCol;
            });
    }, [columns, visibleColumns]);

    return (
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Filter Panel */}
         

            {/* Error Display */}
            {error && (
                <Box sx={{ color: "red", mb: 1, fontWeight: 600 }}>
                    Error: {error}
                </Box>
            )}

            {/* DataGrid */}
            <DataGrid
                rows={filteredRows}
                columns={processedColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                autoHeight
                disableSelectionOnClick
                loading={loading.getRows}
                getRowId={(row) => row._id}
                sx={{
                    minHeight: "60%",
                    minWidth: "100%",
                    "& .MuiDataGrid-virtualScroller": {
                        overflowX: "auto",
                    },
                }}
            />
        </Box>
    );
}