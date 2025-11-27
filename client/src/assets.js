export const SYSTEM = "OM_preprod"

export const clientPort = 3007;

export const serverPort = 5000;

export const civil = true

export const baseUrl = clientPort === serverPort ? "" : (civil? `http://localhost:${serverPort}`: `http://vm0099eged:${serverPort}`);