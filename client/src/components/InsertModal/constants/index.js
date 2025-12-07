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

export const steps = [
  { label: 'ראשי', description: 'פרטים בסיסיים' },
  { label: 'נתוני יחידה', description: 'יחידה מוסרת ומקבלת' },
  { label: 'אחר', description: 'פרטים נוספים' },
];

export const tipulTypeOptions = ['שבר', 'שע"מ'];
export const michlalNeedOptions = ['מנועיה', 'ממסרת', 'מנועיה + ממסרת'];
export const performenceOptions = ['כן', 'לא'];

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