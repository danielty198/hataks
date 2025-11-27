export const SYSTEM = "OM_preprod"

export const clientPort = 3007;

export const serverPort = 1987;

export const baseUrl = clientPort === serverPort ? "" : `http://vm0099eged:${serverPort}`;