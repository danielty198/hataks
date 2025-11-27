import React from "react";
import DataGridCustom from "../../components/DatagridCustom";

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
            <TextField key="battalion" id="battalion" label="דגם רכב" variant="outlined" fullWidth />,
            <TextField key="brigade" id="brigade" label="שם בעלים" variant="outlined" fullWidth />,
            <TextField
                key="division"
                id="division"
                label="תאריך תיקון"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                fullWidth
            />,
            <TextField
                key="engineSerial"
                id="engineSerial"
                label="סטטוס"
                select
                defaultValue={STATUS_OPTIONS[0]}
                variant="outlined"
                fullWidth
            >
            </TextField>,
            <TextField key="notes" id="notes" label="הערות" variant="outlined" fullWidth multiline rows={3} />,
        ];
    }, []);



    return (
        <div style={{ padding: 20, direction: "rtl" }}>
            <DataGridCustom
                title="הטאקים"
                columnsConfig={columnsConfig}
                api='hataks'
            />
        </div>
    );
}