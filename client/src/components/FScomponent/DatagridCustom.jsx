import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
    GridActionsCellItem,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import * as dayjs from "dayjs";
import {
    Typography,
    Tooltip,
    Avatar,
    ThemeProvider,
    Box,
    CircularProgress,
    Backdrop,
    Fab,
    IconButton,
} from "@mui/material";
import { tableTheme } from "../../theme";
import {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import InsertModal from "./InsertModal";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { baseUrl } from "../../assets";

/* Props:
columnsConfig, api, rowsData, title, inputs, setInputs, modalContent, resetObject, modalHeight,
frontFetch, specialCells, isAllRequired, width, editFunc, getPids, addPage, clickFunc,
doubleClickFunc, cellDoubleClickFunc, fileName, extras, height, noSelection, users, setFetching,
vehicles, formatFileName, createPort, createApi, specialSx, noButtons, isVehiclesNameMeaged_alExist
*/

export default function DatagridCustom({
    rowsData,
    api,
    frontFetch,
    editFetch,
    createFetch,
    deleteFetch,
    specialCells,
    columnsConfig,
    title,
    width,
    editFunc,
    modalContent,
    getPids,
    restartForm,
    inputs,
    setInputs,
    modalHeight,
    isAllRequired,
    fileName,
    extras,
    doubleClickFunc,
    cellDoubleClickFunc,
    addPage,
    clickFunc,
    height,
    noSelection,
    users,
    setFetching,
    vehicles,
    formatFileName,
    createPort,
    createApi,
    specialSx,
    noButtons,
    isVehiclesNameMeaged_alExist
}) {
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState([]);
    const [editedRows, setEditedRows] = useState([]);
    const [forceLoading, setForceLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    const navigate = useNavigate();

    // Fetch Data
    const getData = useCallback(() => {
        if (setFetching) setFetching(true);
        setForceLoading(true);

        fetch(`${users ? "http://vm0099eged:3005" : baseUrl}/api/${api}/${frontFetch || ""}`)
            .then(res => {
                if (!res.ok) throw new Error("קרתה שגיאה, יש לנסות שוב מאוחר יותר");
                return res.json();
            })
            .then(data => {
                setRows(data);
            })
            .catch(err => alert(err.message))
            .finally(() => {
                setForceLoading(false);
                if (setFetching) setFetching(false);
            });
    }, [users, api, frontFetch, setFetching]);

    useEffect(() => {
        if (rowsData) setRows(rowsData);
        else if (frontFetch !== "none") getData();
    }, [rowsData, frontFetch, getData]);

    const sendChanges = useCallback(({ editedRow }) => {
        fetch(`${users ? "http://vm0099eged:3005" : baseUrl}/api/${api}/${editFetch || "edit"}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ content: editedRow ? editedRow : editedRows }),
        })
            .then(res => {
                if (!res.ok) throw new Error("קרתה שגיאה, יש לנסות שוב מאוחר יותר");
                return res.json();
            })
            .then(() => {
                if (!editedRow) setEditedRows([]);
                getData();
            })
            .catch(err => alert(err.message));
    }, [editedRows, users, api, editFetch, getData]);

    const deleteOne = useCallback((row) => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק?")) return;
        fetch(`${users ? "http://vm0099eged:3005" : baseUrl}/api/${api}/${deleteFetch || "delete"}`, {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ content: [row] }),
        })
            .then(() => {
                getData();
                getPids && getPids();
            });
    }, [users, api, deleteFetch, getData, getPids]);

    // Cell render
    const renderCell = useCallback((params) => {
        const special = specialCells?.find(el => el.field === params.field);
        if (special) return special.render(params);

        const { field, value, row } = params;

        if (field === "delete") return (
            <GridActionsCellItem
                icon={<Avatar sx={{ bgcolor: "#ce5a67" }}><DeleteIcon /></Avatar>}
                label="מחק"
                onClick={() => deleteOne(row)}
            />
        );

        let formatted = value;

        if (field.includes("Date") && !field.includes("Time")) formatted = value ? dayjs(value).format("DD/MM/YYYY") : "";
        if (field.includes("DateTime")) formatted = value ? dayjs(value).format("HH:mm,DD/MM/YYYY") : "";

        return (
            <Tooltip title={formatted || ""}>
                <Typography sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {formatted}
                </Typography>
            </Tooltip>
        );
    }, [specialCells, deleteOne]);

    // Columns
    const columns = useMemo(() => {
        return columnsConfig.map(col => {
            const special = specialCells?.find(el => el.field === col.field);
            let colDef = {
                field: col.field,
                headerName: col.headerName,
                flex: col.flex || 0.8,
                editable: col.isEdit,
                type: col.type || "string",
                valueOptions: col.valueOptions,
                align: "center",
                headerAlign: 'center',
                renderHeader: () => <strong>{col.headerName}</strong>,
                renderCell: special ? (params) => special.renderCell(params) : renderCell,
                renderEditCell: special ? special.renderEditCell : undefined,
            };

            if (col.type === "date" || col.type === "dateTime") {
                colDef.valueGetter = params => params.value ? new Date(params.value) : null;
            }

            return colDef;
        });
    }, [columnsConfig, specialCells, renderCell]);

    const CustomToolbar = useCallback(() => (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarExport csvOptions={{ fileName: fileName || title, utf8WithBom: true }} />
            <GridToolbarQuickFilter />
        </GridToolbarContainer>
    ), [fileName, title]);

    const grid = useMemo(() => (
        <DataGrid
            editMode="cell"
            sx={{
                '& .MuiDataGrid-cell': {
                    display: 'flex',
                    alignItems: 'center',
                }
            }}
            getRowId={row => row._id}
            checkboxSelection={!noSelection}
            rows={rows}
            columns={columns}
            autoPageSize
            slots={{ toolbar: CustomToolbar }}
            experimentalFeatures={{ newEditingApi: true }}
            processRowUpdate={(newRow) => {
                const updated = [...editedRows];
                const idx = updated.findIndex(el => el._id === newRow._id);
                if (idx !== -1) updated.splice(idx, 1);
                setEditedRows([...updated, newRow]);
                return newRow;
            }}
            onRowDoubleClick={doubleClickFunc}
            onRowClick={clickFunc}
            onCellDoubleClick={cellDoubleClickFunc}
        />
    ), [rows, columns, CustomToolbar, editedRows, doubleClickFunc, clickFunc, cellDoubleClickFunc]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "92vh", width: "100%" }}>
            <Backdrop open={exportLoading} sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }}>
                <CircularProgress size="20em" thickness={2} color="inherit" />
            </Backdrop>

            <Box sx={{ display: "flex", width: "94%", margin: "0 auto", justifyContent: "space-between", alignItems: "center" }}>
                {title && <Typography fontFamily="Assistant" fontSize="5vmin">{title}</Typography>}
                {extras}
                {!noButtons && (
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Fab color="success" onClick={() => addPage ? navigate(addPage) : setOpen(true)}
                            disabled={!modalContent?.length}><AddIcon /></Fab>
                        <Fab color="primary" onClick={sendChanges} disabled={!editedRows.length}><SaveIcon /></Fab>
                    </Box>
                )}
            </Box>

            <Box sx={{ flex: 1, width: width || "90%", margin: "1% auto 0", backgroundColor: "#fff", padding: "2%", overflow: "auto", ...specialSx }}>
                {forceLoading ? <CircularProgress size="25vh" sx={{ margin: "auto", display: "block" }} /> :
                    <ThemeProvider theme={tableTheme}>{grid}</ThemeProvider>}
            </Box>

            <InsertModal
                open={open}
                setOpen={setOpen}
                route={api}
                inputs={inputs}
                setInputs={setInputs}
                content={modalContent}
                reload={getData}
                getPids={getPids}
                modalHeight={modalHeight}
                isAllRequired={isAllRequired}
                createFetch={createFetch}
                users={users}
                createPort={createPort}
                createApi={createApi}
                vehicles={vehicles}
                formatFileName={formatFileName}
                editFetch={editFetch}
                restartForm={restartForm}
                isVehiclesNameMeaged_alExist={isVehiclesNameMeaged_alExist}
            />
        </Box>
    );
}
