import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport, GridToolbarQuickFilter } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Typography, Tooltip, Avatar, ThemeProvider, Box, CircularProgress, Backdrop, Fab, IconButton, } from "@mui/material";
// import { theme } from "../../theme";
import {
    useState, useEffect, useContext, useMemo, useCallback,
} from "react";
import InsertModal from "./InsertModal";
import { useNavigate } from "react-router-dom";   // ✅ UPDATED
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { baseUrl } from "../../assets";
import { tableTheme } from "../../theme";
// import { useCookie } from "DanielsWonderlandOfMagic/CacheOfKingSean";

// ============================================================
// Helper functions
// ============================================================

const formatDate = (value) => {
    if (!value) return "";
    const d = dayjs(value);
    return d.year() === 1970 ? "" : d.format("DD/MM/YYYY");
};

const formatDateTime = (value) => {
    if (!value) return "";
    const d = dayjs(value);
    return d.year() === 1970 ? "" : d.format("HH:mm,DD/MM/YYYY");
};

const buildUrl = (users, api, extra = "") =>
    `${users ? "http://vm0099eged:3005" : baseUrl}/api/${api}/${extra}`;

// ============================================================
// COMPONENT
// ============================================================

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
    filter,
    cellDoubleClickFunc,
    exportFields,
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
    isVehiclesNameMeaged_alExist,
}) {
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState([]);
    const [editedRows, setEditedRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const navigate = useNavigate();   // ✅ UPDATED

    const [openSignature, setOpenSignature] = useState(false);
    const [openOrderNumbers, setOpenOrderNumbers] = useState(false);

    // ============================================================
    // Fetch Data
    // ============================================================

    const getData = useCallback(() => {
        if (setFetching) setFetching(true);
        setLoading(true);

        fetch(buildUrl(users, api, frontFetch || ""))
            .then((res) => {
                if (!res.ok) throw new Error("קרתה שגיאה, יש לנסות שוב מאוחר יותר");
                return res.json();
            })
            .then((data) => {
                setRows(data);
            })
            .catch((err) => alert(err.message))
            .finally(() => {
                setLoading(false);
                if (setFetching) setFetching(false);
            });
    }, [users, api, frontFetch, setFetching]);

    useEffect(() => {
        if (rowsData) setRows(rowsData);
        else if (frontFetch !== "none") getData();
    }, [rowsData, frontFetch, getData]);

    // ============================================================
    // Update / Delete
    // ============================================================

    const sendChanges = useCallback(
        ({ editedRow }) => {
            fetch(buildUrl(users, api, editFetch || "edit"), {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    content: editedRow ? editedRow : editedRows,
                }),
            })
                .then((res) => {
                    if (!res.ok)
                        throw new Error("קרתה שגיאה, יש לנסות שוב מאוחר יותר");
                    return res.json();
                })
                .then(() => {
                    if (!editedRow) setEditedRows([]);
                    getData();
                })
                .catch((err) => alert(err.message));
        },
        [editedRows, users, api, editFetch, getData]
    );

    const deleteOne = useCallback(
        (row) => {
            if (!window.confirm("האם אתה בטוח שברצונך למחוק?")) return;

            fetch(buildUrl(users, api, deleteFetch || "delete"), {
                method: "DELETE",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ content: [row] }),
            })
                .then((res) => res.json())
                .then(() => {
                    getData();
                    getPids && getPids();
                });
        },
        [users, api, deleteFetch, getData, getPids]
    );

    // ============================================================
    // Cell Renderer
    // ============================================================

    const renderCell = useCallback(
        (params) => {
            const special = specialCells?.find((el) => el.field === params.field);
            if (special) return special.render(params);

            const { field, row, value } = params;

            if (field === "delete")
                return (
                    <GridActionsCellItem
                        icon={
                            <Avatar sx={{ bgcolor: "#ce5a67" }}>
                                <DeleteIcon />
                            </Avatar>
                        }
                        label="מחק"
                        onClick={() => deleteOne(row)}
                    />
                );

            if (field === "signature")
                return (
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                        {row.role >= 2 && (
                            <>
                                <Box sx={{ width: "70%", height: "95%" }}>
                                    <img
                                        src={row.signature}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                </Box>
                                <IconButton onClick={() => setOpenSignature(row)}>
                                    <EditIcon />
                                </IconButton>
                            </>
                        )}
                    </Box>
                );

            if (field === "orderNumbers")
                return (
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <Tooltip title={value?.toString() || ""}>
                            <Typography noWrap>{value?.toString()}</Typography>
                        </Tooltip>
                        <IconButton onClick={() => setOpenOrderNumbers(row)}>
                            <EditIcon />
                        </IconButton>
                    </Box>
                );

            let formatted = value;

            if (field.includes("Date") && !field.includes("Time"))
                formatted = formatDate(value);
            if (field.includes("DateTime")) formatted = formatDateTime(value);

            return (
                <Tooltip title={formatted || ""}>
                    <Typography
                        sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {formatted}
                    </Typography>
                </Tooltip>
            );
        },
        [specialCells, deleteOne]
    );

    // ============================================================
    // Columns
    // ============================================================

    const columns = useMemo(() => {
        return columnsConfig.map((col) => {
            const special = specialCells?.find((el) => el.field === col.field);

            return {
                field: col.field,
                headerName: col.headerName,
                flex: col.flex || 0.8,
                editable: col.isEdit,
                type: col.type || "string",
                valueOptions: col.valueOptions,
                align: col.type === "actions" ? "center" : "left",
                headerAlign: "left",
                renderHeader: () => <strong>{col.headerName}</strong>,
                renderCell: special
                    ? (params) => special.renderCell(params)
                    : renderCell,
                renderEditCell: special ? special.renderEditCell : undefined,
            };
        });
    }, [columnsConfig, specialCells, renderCell]);

    // ============================================================
    // Toolbar
    // ============================================================

    const CustomToolbar = useCallback(() => {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarExport
                    csvOptions={{
                        fileName: fileName || title,
                        utf8WithBom: true,
                    }}
                />
                <GridToolbarQuickFilter />
            </GridToolbarContainer>
        );
    }, [fileName, title]);

    // ============================================================
    // DataGrid Memo
    // ============================================================

    const grid = useMemo(() => {
        return (
            <DataGrid
                editMode="cell"
                getRowId={(row) => row._id}
                checkboxSelection={!noSelection}
                rows={rows}
                columns={columns}
                isCellEditable={editFunc || (() => true)}
                autoPageSize
                slots={{ toolbar: CustomToolbar }}
                experimentalFeatures={{ newEditingApi: true }}
                processRowUpdate={(newRow, oldRow) => {
                    const updated = [...editedRows];
                    const idx = updated.findIndex((el) => el._id === newRow._id);
                    if (idx !== -1) updated.splice(idx, 1);

                    setEditedRows([...updated, newRow]);
                    return newRow;
                }}
                onRowDoubleClick={doubleClickFunc}
                onRowClick={clickFunc}
                onCellDoubleClick={cellDoubleClickFunc}
            />
        );
    }, [
        rows,
        columns,
        CustomToolbar,
        editedRows,
        editFunc,
        doubleClickFunc,
        clickFunc,
        cellDoubleClickFunc,
    ]);

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "92vh" }}>
            <Backdrop open={exportLoading}>
                <CircularProgress size="20em" />
            </Backdrop>

            <Box
                sx={{
                    width: "94%",
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                {title && (
                    <Typography fontFamily="Assistant" fontSize="5vmin">
                        {title}
                    </Typography>
                )}

                {extras}

                {!noButtons && (
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Fab
                            color="success"
                            disabled={!modalContent?.length}
                            onClick={() => {
                                addPage ? navigate(addPage) : setOpen(true);   // ✅ UPDATED
                            }}
                        >
                            <AddIcon />
                        </Fab>

                        <Fab
                            color="primary"
                            disabled={!editedRows.length}
                            onClick={sendChanges}
                        >
                            <SaveIcon />
                        </Fab>
                    </Box>
                )}
            </Box>

            <Box
                sx={{
                    flex: 1,
                    width: "90%",
                    margin: "1% auto 0",
                    backgroundColor: "#fff",
                    padding: "2%",
                    overflow: "auto",
                    ...specialSx,
                }}
            >
                {loading ? (
                    <CircularProgress size="20vh" sx={{ margin: "auto", display: "block" }} />
                ) : (
                    <ThemeProvider theme={tableTheme}>{grid}</ThemeProvider>
                )}
            </Box>

            {/* Modals */}
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
