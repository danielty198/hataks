import React, { useState, useMemo } from "react";
import DatagridCustom from "../components/FScomponent/DatagridCustom"; // הנתיב בהתאם למבנה שלך
import { TextField, MenuItem, Box, Autocomplete } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers'
// שדות סטטוס בעברית
const STATUS_OPTIONS = ["ממתין", "בטיפול", "הושלם"];

export default function RepairsPage() {
  // inputs ישלחו ל־InsertModal (הם נוצרים פה כהתחלה)
  const [inputs, setInputs] = useState({

  });

  // הגדרת עמודת הטבלה (columnsConfig) בקונפיגורציה שמתאימה ל־DatagridCustom
  const columnsConfig = useMemo(() => {
    return [
      { field: "manoiya", headerName: "מנועיה", flex: 1, isEdit: true },
      { field: "hatakType", headerName: "סוג חט\"כ", flex: 1, isEdit: true },
      { field: "sendingDivision", headerName: "אוגדה מוסרת", flex: 1, isEdit: true },
      { field: "sendingBrigade", headerName: "חטיבה מוסרת", flex: 1, isEdit: true },
      { field: "sendingBattalion", headerName: "חטיבה מוסרת", flex: 1, isEdit: true },
      { field: "zadik", headerName: "צ' של כלי", flex: 1, isEdit: true },

      { field: "reciveDate", headerName: "תאריך קבלה", flex: 1, isEdit: true, type: "date" },

      { field: "engineSerial", headerName: "מספר מנוע", flex: 1, isEdit: true },
      { field: "minseretSerial", headerName: "מספר ממסרת", flex: 1, isEdit: true },

      { field: "hatakStatus", headerName: "סטטוס חט\"כ", flex: 1, isEdit: true },
      { field: "problem", headerName: "פירוט תקלה", flex: 1, isEdit: true },
      { field: "waitingHHType", headerName: "סוג ח\"ח ממתין", flex: 1, isEdit: true },
      { field: "michlalNeed", headerName: "צריכת מכלל", flex: 1, isEdit: true },

      { field: "recivingDivision", headerName: "אוגדה מקבלת", flex: 1, isEdit: true },
      { field: "recivingBrigade", headerName: "חטיבה מקבלת", flex: 1, isEdit: true },
      { field: "recivingBattalion", headerName: "גדוד מקבל", flex: 1, isEdit: true },

      { field: "startWorkingDate", headerName: "תאריך לפקודה", flex: 1, isEdit: true, type: "date" },
      { field: "forManoiya", headerName: "מנועיה לפקודה", flex: 1, isEdit: true },

      { field: "performenceExpectation", headerName: "צפי ביצוע", flex: 1, isEdit: true },
      { field: "intended", headerName: "מיועד ל?", flex: 1, isEdit: true },

      // אופציונלי — עמודת פעולות
      { field: "delete", headerName: "מחק", flex: 0.6, type: "actions" },
    ];
  }, []);


  // תכנים שיועברו ל־InsertModal — חשוב: כל פריט חייב להכיל props.id (InsertModal בודק את זה)
  // InsertModal ייצור TextField חדש מתוך inp.props (הוא עושה {...inp.props})




  const selectOptions = {
    manoiya: [],
    hatakType: [],
    hatakStatus: [],
    waitingHHType: []
  };

  const modalContent = useMemo(() => {
    return [
      // SELECT: manoiya
      <TextField
        key="manoiya"
        select
        name="manoiya"
        id="manoiya"
        label="מנועיה"
        variant="outlined"
        SelectProps={{ native: true }}
      >
        <option value=""></option>
        {selectOptions.manoiya.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </TextField>,
      // SELECT: hatakType
      <TextField
        key="hatakType"
        select
        name="hatakType"
        id="hatakType"
        label='סוג חט"כ'
        variant="outlined"
        SelectProps={{ native: true }}
      >
        <option value=""></option>
        {selectOptions.hatakType.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </TextField>,
      // AUTOCOMPLETE FIELDS
      <Autocomplete
        key="sendingDivision"
        options={[]}
        renderInput={(params) => (
          <TextField {...params} label="אוגדה מוסרת" id="sendingDivision" />
        )}
      />,
      <Autocomplete
        key="sendingBrigade"
        options={[]}
        renderInput={(params) => (
          <TextField {...params} label="חטיבה מוסרת" id="sendingBrigade" />
        )}
      />,
      <Autocomplete
        key="sendingBattalion"
        options={[]}
        renderInput={(params) => (
          <TextField {...params} label="גדוד מוסר" id="sendingBattalion" />
        )}
      />,
      <Autocomplete
        key="zadik"
        options={[]}
        renderInput={(params) => (
          <TextField {...params} label="צ' של כלי" id="zadik" />
        )}
      />,
      // DATE PICKER
      <DatePicker
        key="reciveDate"
        label="תאריך קבלה"
        slotProps={{ textField: { id: "reciveDate", variant: "outlined" } }}
      />,
      <Autocomplete
        key="engineSerial"
        options={[]}
        renderInput={(params) => (
          <TextField {...params} label="מספר מנוע" id="engineSerial" />
        )}
      />,
      <Autocomplete
        key="minseretSerial"
        options={[]}
        renderInput={(params) => (
          <TextField {...params} label="מספר ממסרת" id="minseretSerial" />
        )}
      />,
      // SELECT: hatakStatus
      <TextField
        key="hatakStatus"
        select
        id="hatakStatus"
        label='סטטוס חט"כ'
        variant="outlined"
        SelectProps={{ native: true }}
      >
        <option value=""></option>
        {selectOptions.hatakStatus.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </TextField>,
      // TEXT FIELD
      <TextField key="problem" id="problem" label="פירוט תקלה" variant="outlined" />,
      // SELECT: waitingHHType
      <TextField
        key="waitingHHType"
        select
        id="waitingHHType"
        label='סוג ח"ח ממתין'
        variant="outlined"
        SelectProps={{ native: true }}
      >
        <option value=""></option>
        {selectOptions.waitingHHType.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </TextField>,
      <TextField key="michlalNeed" id="michlalNeed" label="צריכת מכלל" variant="outlined" />,
      <Autocomplete
        key="recivingDivision"
        options={[]}
        renderInput={(params) => (
          <TextField {...params} label="אוגדה מקבלת" id="recivingDivision" />
        )}
      />,
      <Autocomplete
        key="recivingBrigade"
        options={[]}
        renderInput={(params) => (
          <TextField {...params} label="חטיבה מקבלת" id="recivingBrigade" />
        )}
      />,
      <Autocomplete
        key="recivingBattalion"
        options={[]}
        renderInput={(params) => (
          <TextField {...params} label="גדוד מקבל" id="recivingBattalion" />
        )}
      />,
      <DatePicker
        key="startWorkingDate"
        label="תאריך לפקודה"
        slotProps={{ textField: { id: "startWorkingDate", variant: "outlined" } }}
      />,
      <TextField key="forManoiya" id="forManoiya" label="מנועיה לפקודה" variant="outlined" />,
      <TextField key="performenceExpectation" id="performenceExpectation" label="צפי ביצוע" variant="outlined" />,
      <TextField key="intended" id="intended" label="מיועד ל?" variant="outlined" />,
    ];
  }, [selectOptions]);


  // props עיקריים ל־DatagridCustom
  // api: שם ה־route (DatagridCustom יבקשת GET ל /api/{api}/)
  // frontFetch: ריק כדי לטעון את ה־GET הבסיסי (או תשים ''/ או ערך אחר אם צריך)
  return (
    <Box sx={{ p: 2 }}>
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
