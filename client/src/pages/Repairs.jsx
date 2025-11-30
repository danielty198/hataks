import React, { useState, useMemo } from "react";

import { TextField, MenuItem, Box, Autocomplete } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers'
import { generateData } from "../assets";
import DatagridCustom from "../components/DatagridCustom";

export default function RepairsPage() {
  // inputs ישלחו ל־InsertModal (הם נוצרים פה כהתחלה)
  const [inputs, setInputs] = useState({

  });

  const selectOptions = {
    manoiya: [],
    hatakType: [],
    hatakStatus: [],
    waitingHHType: []
  };

  // הגדרת עמודת הטבלה (columnsConfig) בקונפיגורציה שמתאימה ל־DatagridCustom
  const columnsConfig = useMemo(() => {
    return [
      // SELECT
      { field: "manoiya", headerName: "מנועיה", isEdit: true, type: "singleSelect", valueOptions: selectOptions.manoiya },

      // SELECT
      { field: "hatakType", headerName: 'סוג חט"כ', isEdit: true, type: "singleSelect", valueOptions: selectOptions.hatakType },

      // AUTOCOMPLETE → string
      { field: "sendingDivision", headerName: "אוגדה מוסרת", isEdit: true, type: "string" },
      { field: "sendingBrigade", headerName: "חטיבה מוסרת", isEdit: true, type: "string" },
      { field: "sendingBattalion", headerName: "גדוד מוסר", isEdit: true, type: "string" },
      { field: "zadik", headerName: "צ' של כלי", isEdit: true, type: "string" },

      // DATE
      { field: "reciveDate", headerName: "תאריך קבלה", isEdit: true, type: "date" },

      // AUTOCOMPLETE
      { field: "engineSerial", headerName: "מספר מנוע", isEdit: true, type: "string" },
      { field: "minseretSerial", headerName: "מספר ממסרת", isEdit: true, type: "string" },

      // SELECT
      { field: "hatakStatus", headerName: 'סטטוס חט"כ', isEdit: true, type: "singleSelect", valueOptions: selectOptions.hatakStatus },

      // TEXT
      { field: "problem", headerName: "פירוט תקלה", isEdit: true, type: "string" },

      // SELECT
      { field: "waitingHHType", headerName: 'סוג ח"ח ממתין', isEdit: true, type: "singleSelect", valueOptions: selectOptions.waitingHHType },

      // TEXT
      { field: "michlalNeed", headerName: "צריכת מכלל", isEdit: true, type: "string" },

      // AUTOCOMPLETE
      { field: "recivingDivision", headerName: "אוגדה מקבלת", isEdit: true, type: "string" },
      { field: "recivingBrigade", headerName: "חטיבה מקבלת", isEdit: true, type: "string" },
      { field: "recivingBattalion", headerName: "גדוד מקבל", isEdit: true, type: "string" },

      // DATE
      { field: "startWorkingDate", headerName: "תאריך לפקודה", isEdit: true, type: "date" },

      // TEXT
      { field: "forManoiya", headerName: "מנועיה לפקודה", isEdit: true, type: "string" },

      { field: "performenceExpectation", headerName: "צפי ביצוע", isEdit: true, type: "string" },
      { field: "intended", headerName: "מיועד ל?", isEdit: true, type: "string" },

      // ACTIONS
      { field: "delete", headerName: "מחק", type: "actions" },
    ];
  }, [selectOptions]);

  const rows = useMemo(() => {
    return generateData(columnsConfig)
  }, [])

  // תכנים שיועברו ל־InsertModal — חשוב: כל פריט חייב להכיל props.id (InsertModal בודק את זה)
  // InsertModal ייצור TextField חדש מתוך inp.props (הוא עושה {...inp.props})






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

    <Box sx={{ width:'100vw'}}>
      <DatagridCustom
        rows={rows}
        columns={columnsConfig}
      />
    </Box>

  );




}

