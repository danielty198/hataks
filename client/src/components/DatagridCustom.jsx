import { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { baseUrl } from "../assets";

export default function DatagridCustom({ data, columns,route }) {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState({
        getRows: false,
        delete: false,
    });



    const setLoadingFlag = useCallback((key, value) => {
        setLoading((prev) => ({ ...prev, [key]: value }));
    }, []);




    // === Load rows (from props OR fetch) ===
    useEffect(() => {
        // If data provided → just use it
        if (Array.isArray(data)) {
            setRows(data);
            return;
        }

        // Otherwise, fetch from localhost
        const fetchData = async () => {
            setLoadingFlag("getRows", true);
            setError(null);

            try {
                console.log(`${baseUrl}/api/${route}`)
                const res = await fetch(`${baseUrl}/api/${route}`);

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
        };

        fetchData();
    }, [data]);

    // === Process columns ===
    const processedColumns = useMemo(() => {
        return columns.map((col) => {
            const newCol = { ...col };

            // Editable
            if (newCol.isEdit) newCol.editable = true;

            // Auto date handling
            if (newCol.type === "date") {
                newCol.valueGetter = (params) =>
                    params.value ? new Date(params.value) : null;
            }

            // Delete column
            if (newCol.headerName === "delete") {
                newCol.field = newCol.field || "delete";
                newCol.type = "actions";

                newCol.getActions = (params) => [
                    <GridActionsCellItem
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
    }, [columns]);

    return (
        <Box sx={{ position: 'relative', width: "100%", height: '100%' }}>
            {error && (
                <Box sx={{ color: "red", mb: 1, fontWeight: 600 }}>
                    Error: {error}
                </Box>
            )}

            <DataGrid

                rows={rows}
                columns={processedColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                autoHeight
                disableSelectionOnClick
                loading={loading.getRows}
                getRowId={(row) => row._id}
                sx={{
                    minHeight: '60%' ,
                    minWidth: '100%', // ensure it fits parent
                    '& .MuiDataGrid-virtualScroller': {
                        overflowX: 'auto', // enable horizontal scroll for inner columns
                    },
                }}
            />
        </Box>
    );
}
