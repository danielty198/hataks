import React, { useState, useMemo } from "react";
import DatagridCustom from "./FScomponent/DatagridCustom"; // הנתיב בהתאם למבנה שלך
import { TextField, MenuItem, Box } from "@mui/material";

// שדות סטטוס בעברית
const STATUS_OPTIONS = ["ממתין", "בטיפול", "הושלם"];

export default function RepairsPage() {
  // inputs ישלחו ל־InsertModal (הם נוצרים פה כהתחלה)
  const [inputs, setInputs] = useState({
    carModel: "",
    ownerName: "",
    repairDate: "",
    status: STATUS_OPTIONS[0],
    notes: "",
  });

  // הגדרת עמודת הטבלה (columnsConfig) בקונפיגורציה שמתאימה ל־DatagridCustom
  const columnsConfig = useMemo(() => {
    return [
      { field: "carModel", headerName: "דגם רכב", flex: 1, isEdit: true },
      { field: "ownerName", headerName: "שם בעלים", flex: 1, isEdit: true },
      { field: "repairDate", headerName: "תאריך תיקון", flex: 0.8, isEdit: true, type: "date" },
      { field: "status", headerName: "סטטוס", flex: 0.8, isEdit: true, valueOptions: STATUS_OPTIONS },
      { field: "notes", headerName: "הערות", flex: 1, isEdit: true },
      // אופציונלי: שדה מחיקה/פעולות מופיע כ־columnConfig אם תרצה
      { field: "delete", headerName: "מחק", flex: 0.6, type: "actions" },
    ];
  }, []);

  // תכנים שיועברו ל־InsertModal — חשוב: כל פריט חייב להכיל props.id (InsertModal בודק את זה)
  // InsertModal ייצור TextField חדש מתוך inp.props (הוא עושה {...inp.props})
  const modalContent = useMemo(() => {
    return [
      <TextField key="carModel" id="carModel" label="דגם רכב" variant="outlined" fullWidth />,
      <TextField key="ownerName" id="ownerName" label="שם בעלים" variant="outlined" fullWidth />,
      <TextField
        key="repairDate"
        id="repairDate"
        label="תאריך תיקון"
        type="date"
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        fullWidth
      />,
      <TextField
        key="status"
        id="status"
        label="סטטוס"
        select
        defaultValue={STATUS_OPTIONS[0]}
        variant="outlined"
        fullWidth
      >
        {STATUS_OPTIONS.map((s) => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </TextField>,
      <TextField key="notes" id="notes" label="הערות" variant="outlined" fullWidth multiline rows={3} />,
    ];
  }, []);

  // props עיקריים ל־DatagridCustom
  // api: שם ה־route (DatagridCustom יבקשת GET ל /api/{api}/)
  // frontFetch: ריק כדי לטעון את ה־GET הבסיסי (או תשים ''/ או ערך אחר אם צריך)
  return (
    <Box sx={{ direction: "rtl", p: 2 }}>
      <DatagridCustom
        api="repairs"
        frontFetch=""            // GET /api/repairs/
        editFetch="edit"        // PUT /api/repairs/edit  (DatagridCustom משתמש ב־editFetch כברירת מחדל)
        createFetch=""          // InsertModal ישלח PATCH ל /api/repairs/ (התאמה לשרת שלך)
        deleteFetch="delete"    // DELETE /api/repairs/delete
        columnsConfig={columnsConfig}
        modalContent={modalContent}
        title="תיקוני רכב"
        inputs={inputs}
        setInputs={setInputs}
        modalHeight="52vh"
        isAllRequired={false}
        fileName="תיקוני_רכב"
      />
    </Box>
  );
}
