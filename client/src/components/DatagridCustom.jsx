import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";



export default function DatagridCustom({ rows, columns }) {



    const processedColumns = React.useMemo(() => {
        return columns.map((col) => {
            const newCol = { ...col };

            // Preserve isEdit
            if (newCol.isEdit) {
                newCol.editable = true; // MUI DataGrid uses 'editable' prop
            }

            // Add valueGetter automatically for date columns
            if (newCol.type === "date") {
                newCol.valueGetter = (params) =>
                    params.value ? new Date(params.value) : null;
            }

            // Add flex + minWidth if not set
            if (!newCol.flex) newCol.flex = 1;
            if (!newCol.minWidth) newCol.minWidth = 100;

            return newCol;
        });
    }, [columns]);



    return (
        <Box sx={{ width: "100%" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                autoHeight
                disableSelectionOnClick
                getRowId={(row) => row._id}
            />
        </Box>
    );
}