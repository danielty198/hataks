
import dayjs from "dayjs";

export const SYSTEM = "OM_preprod"

export const clientPort = 3007;

export const serverPort = 5000;

export const civil = true

export const baseUrl = clientPort === serverPort ? "" : (civil ? `http://localhost:${serverPort}` : `http://vm0099eged:${serverPort}`);




function generateRandomValueByType(type) {
  switch (type) {
    case "string":
      return Math.random().toString(36).substring(2, 10);

    case "number":
      return Math.floor(Math.random() * 1000);

    case "boolean":
      return Math.random() > 0.5;

    case "date":
      return dayjs().subtract(Math.floor(Math.random() * 30), "day").format("YYYY-MM-DD");

    default:
      return null;
  }
}

export function generateData(columns, count = 10) {
  const rows = [];

  for (let i = 0; i < count; i++) {
    const row = { _id: i + 1 };

    columns.forEach(col => {
      row[col.field] = generateRandomValueByType(col.type);
    });

    rows.push(row);
  }

  return rows;
}


export const intendedOptions = [
  "פצ\"ן",
  "פד\"ם",
  "סבב אגד",
  "סבב פיקודי",
  "אימונים והכשרות",
  "אחר"
];



export const hatakTypeOptions = [
  "סימן 4",
  "סימן 3",
  "נמר",
  "נמר MTU",
  "אכזרית",
  "אכזרית אינטגרלית",
  "אופק",
  "נמר אחזקה",
  "איתן",
  "פומה רגיל",
  "פומה+",
  "פומה++",
  "טג\"ש",
  "נקפדן",
  "נגמחון",
  "טחל\"ץ",
  "מנת\"ץ",
  "דוהר",
  "דוהר משופר",
  "רוכב ב'",
  "רכב ב' משופר",
  "דורס",
  "דורס משופר",
  "נגמש A1",
  "נגמ\"ש A2",
  "נגמ\"ש A2 קשת",
  "נגמש A3 קשת",
  "נגמ\"ש מגן",
  "אלפא",
  "פיטר",
  "רמ\"מ מבזק",
  "אחר"
];




export const manoiyaOptions = [
  "653",
  "651",
  "703",
  "674",
  "652",
  "אחר"
];



export const ogdotOptions = [
  "252",
  "162",
  "143",
  "98",
  "99",
  "36",
  "210",
  "146",
  "91",
  "460",
  "831",
  "704",
  "בהל\"צ",
  "ביסל\"ח",
  "ג'וליס",
  "עמיעד",
  "אחר"
];







export const hatakStatusOptions = [
  "כשיר סבב",
  "כשיר פיקודי",
  "כשיר חוב",
  "ממתין ח\"ח",
  "בלאי",
  "נופק",
  "מושבת מנוע",
  "מושבת ממסרת",
  "מושבת מנוע + ממסרת",
  "דרג ג' ממתין לחוליה",
  "דרג ג' נשלח למש\"א"
];
