import {
    Box,
    TextField,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    Divider,
    DialogContent,
    DialogActions
} from "@mui/material";
import { useState, useRef } from "react";
import SendAlert from "./SendAlert";
import CloseIcon from '@mui/icons-material/Close';
import { baseUrl, SYSTEM  } from "../../assets";

export default function InsertModal({
    open,
    setOpen,
    route,
    inputs,
    content,
    reload,
    modalHeight,
    isAllRequired,
    createFetch,
    users,
    getPids,
    restartForm,
    isVehiclesNameMeaged_alExist
}) {

    const [openAlert, setOpenAlert] = useState(false);
    const [severity, setSeverity] = useState();
    const [alertText, setAlertText] = useState("");

    const inputRef = useRef([]);

    // -----------------------------------------------------
    //   Validate form fields
    // -----------------------------------------------------
    const validateFields = (obj) => {
        if (isAllRequired) return true;

        for (const key in obj) {
            if (key === "company" && inputs.role >= 2) continue;

            if (key === "zone" && !isVehiclesNameMeaged_alExist?.(obj.fields, obj.role)) {
                continue;
            }

            if (obj[key] === "") {
                window.alert("אחד הנתונים חסר");
                return false;
            }
        }
        return true;
    };

    // -----------------------------------------------------
    //   Extract fields from refs
    // -----------------------------------------------------
    const collectFields = () => {
        const result = { ...inputs };

        inputRef.current.forEach((el) => {
            if (!el) return;

            const id = el.node?.name || el.id;
            result[id] = el.value;
        });

        return result;
    };

    // -----------------------------------------------------
    //   API Request
    // -----------------------------------------------------
    const sendToServer = async (obj) => {
        let url = baseUrl;

        let body = obj;
        if (users || route === "users") {
            const pid = obj.pid;
            delete obj.pid;

            url = route === "users" ? baseUrl : "http://vm0099eged:3005";
            body = { pid, system: SYSTEM, systemSettings: obj };
        }

        const response = await fetch(`${url}/api/${route}/${createFetch || ""}`, {
            method: "PATCH",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        return response;
    };

    // -----------------------------------------------------
    //   Handle submit
    // -----------------------------------------------------
    const sendChange = async () => {
        const obj = collectFields();

        if (!validateFields(obj)) return;

        const response = await sendToServer(obj);

        if (response.status === 200) {
            setSeverity("success");
            setAlertText("ההוספה עברה בהצלחה");
        } else {
            setSeverity("error");

            if (users) {
                setAlertText("משתמש זה כבר קיים במערכת");
            } else {
                const payload = await response.json();
                setAlertText(payload);
            }
        }

        setOpenAlert(true);
        getPids?.();
        restartForm?.();
        reload?.();
    };

    // -----------------------------------------------------
    //   Modal close
    // -----------------------------------------------------
    const handleClose = () => {
        setOpenAlert(false);
        setOpen(false);
        restartForm?.();
    };

    // -----------------------------------------------------
    //   Render Input Fields
    // -----------------------------------------------------
    const renderFields = () =>
        content?.map((inp, index) => {
            if (!inp.props.id) return inp;

            return (
                <TextField
                    key={index}
                    {...inp.props}
                    inputRef={(ref) => (inputRef.current[index] = ref)}
                    SelectProps={{
                        ...(inp.props.SelectProps || {}),
                        inputProps: {
                            ref: inputRef.current[index]
                        }
                    }}
                />
            );
        });

    return (
        <Dialog keepMounted open={open} onClose={handleClose}>
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                הוסף חדש
                <IconButton onClick={handleClose}>
                    <CloseIcon sx={{ fill: "black" }} />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent
                sx={{
                    width: "25vw",
                    height: modalHeight || "60vh",
                    borderRadius: "10px",
                    padding: "1% 0px 5% 0px"
                }}
            >
                <SendAlert
                    open={openAlert}
                    text={alertText}
                    severity={severity}
                    setOpen={setOpenAlert}
                />

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "100%",
                        width: "80%",
                        position: "relative",
                        left: "50%",
                        transform: "translateX(-50%)"
                    }}
                >
                    {renderFields()}
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions>
                <Button onClick={sendChange}>אישור</Button>
                <Button onClick={handleClose}>ביטול</Button>
            </DialogActions>
        </Dialog>
    );
}
