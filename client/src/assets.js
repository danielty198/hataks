
import dayjs from "dayjs";

export const SYSTEM = "OM_preprod"

export const clientPort = 3000;

export const serverPort = 5000;
export const USER_SERVICE_CLIENT_PORT = 3006
export const USER_SERVICE_SERVER_PORT = 3005
export const ASSETS_SERVICE_SERVER_PORT = 3011

export const civil = true

export const baseUrl = clientPort === serverPort ? "" : (civil ? `http://localhost:${serverPort}` : `http://vm0099eged:${serverPort}`);

export const getDefaultFormData = () => {
  return {
    manoiya: '',
    hatakType: '',
    zadik: null,
    engineSerial: '',
    minseretSerial: '',
    hatakStatus: '',
    tipulType: '',
    problem: '',
    reciveDate: null,
    sendingDivision: '',
    sendingBrigade: null,
    sendingBattalion: null,
    recivingDivision: '',
    recivingBrigade: null,
    recivingBattalion: null,
    waitingHHType: '',
    michlalNeed: '',
    startWorkingDate: null,
    forManoiya: '',
    performenceExpectation: '',
    intended: '',
  }
};



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




export const steps = [
  { label: 'ראשי', description: 'פרטים בסיסיים' },
  { label: 'נתוני יחידה', description: 'יחידה מוסרת ומקבלת' },
  { label: 'אחר', description: 'פרטים נוספים' },
];

export const tipulTypeOptions = ['שבר', 'שע"מ'];
export const michlalNeedOptions = ['מנוע', 'ממסרת', 'מנוע + ממסרת'];
export const performenceOptions = ['כן', 'לא'];

export const waitingHHTypeRequiredString = 'ממתין ח"ח'
export const zadikOptions = [1, 2, 3, 4, 5, 6, 6, 7, 8, 9, 9, 0]

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

export const waitingHHTypeOptions = [
  "בית צד ימין",
  "בית צד שמאל",
  "מכלול 25 מיקרון",
  "משאבת הזרקה",
  "יחידת ניתוק",
  "ראש היגוי",
  "אלטרנטור סימן 4",
  "ערכת בלמים ס'4",
  "מתנע",
  "אטם חזיה",
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


export const colors = {
  primary: '#13293D',
  primaryLight: '#3a5f7d',
  primaryDark: '#0d1e2b',
  white: '#ffffff',
  background: '#f5f7fa',
  cardBg: '#ffffff',
  border: '#e0e6ed',
  success: '#2e7d32',
  successLight: '#4caf50',
};



export const datagridcustomCellClassNames = {
  '& .hatak-kosher': {
    backgroundColor: '#d4edda',
    color: '#155724',
    fontWeight: '500',
  },

  // נופק - תורכיז פסטל
  '& .hatak-nofek': {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    fontWeight: '500',
  },

  // בלאי - צהוב פסטל
  '& .hatak-balai': {
    backgroundColor: '#fff3cd',
    color: '#856404',
    fontWeight: '500',
  },

  // דרג ג' + ממתין ח"ח - כתום פסטל
  '& .hatak-darag3': {
    backgroundColor: '#ffe5d0',
    color: '#8b4513',
    fontWeight: '500',
  },

  // מושבת - אדום פסטל
  '& .hatak-mushbat': {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    fontWeight: '500',
  },
}
