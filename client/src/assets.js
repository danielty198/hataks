
import dayjs from "dayjs";

export const SYSTEM = "OM_preprod"

export const clientPort = 3007;

export const serverPort = 5000;

export const civil = true

export const baseUrl = clientPort === serverPort ? "" : (civil? `http://localhost:${serverPort}`: `http://vm0099eged:${serverPort}`);




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
