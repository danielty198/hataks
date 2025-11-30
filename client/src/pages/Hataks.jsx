import React, { useMemo } from "react";
import { TextField } from "@mui/material";
import DatagridCustom from "../components/FScomponent/DatagridCustom";

export default function Hataks() {
    const columnsConfig = [
        { headerName: "גדוד", field: "battalion" },
        { headerName: "חטיבה", field: "brigade" },
        { headerName: "אוגדה", field: "division" },
        { headerName: "מספר מנוע", field: "engineSerial" },
        { headerName: "מנסרת", field: "minseret" },
    ];



    const modalContent = useMemo(() => {
        return [
            <TextField key="battalion" id="battalion" label="דגם רכב" variant="outlined" />,
            <TextField key="brigade" id="brigade" label="שם בעלים" variant="outlined" />,
            <TextField key="division" id="division" label="תאריך תיקון" type="date" variant="outlined" />,
            <TextField key="engineSerial" id="engineSerial" label="סטטוס" variant="outlined" />,
            <TextField key="notes" id="notes" label="הערות" variant="outlined" />,
        ];
    }, []);



    return (
        <div style={{ padding: 20, direction: "rtl" }}>
            <DatagridCustom
                title="חטכים"
                columnsConfig={columnsConfig}
                api='hataks'
                modalContent={modalContent}
            />
        </div>
    );
}