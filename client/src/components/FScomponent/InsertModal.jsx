import { Box, TextField, Button, IconButton, Dialog, DialogTitle, Divider, DialogContent, DialogActions, Typography } from "@mui/material";
import { useState, useRef } from "react";
import SendAlert from "./SendAlert";
import CloseIcon from '@mui/icons-material/Close'
import { SYSTEM, zone, baseUrl, serverPort } from "../../assets"


/* 
props:

open      -------->  boolean that decieds if modal is opend or not
setOpen   -------->  sets the state of open
inputs    -------->  inputs object for the modal - which will be updated via setInputs
setInputs -------->  sets the input object
route     -------->  the route name in server/routes
reset     -------->  resets the form to default 
reload    -------->  sets the rows with the new row that has been added and rerenders the page so we can see it
content   -------->  content of the modal 
isAllRequired --------> if exists, not al fields are required
modalHeight  --------> sets the modalHeight
*/



export default function InsertModal({ open, setOpen, route, inputs, content, reload, modalHeight, isAllRequired, createFetch, users,
    getPids, restartForm, isVehiclesNameMeaged_alExist }) {
    const [openAlert, setOpenAlert] = useState(false)
    const [severity, setSeverity] = useState()
    const [alertText, setAlertText] = useState('')

    const inputRef = useRef([])

    const sendChange = async () => {
        const obj = { ...inputs }
        inputRef.current.forEach(el => {
            if (el.node)
                obj[el.node.name] = el.value
            else
                obj[el.id] = el.value

        })
        if (!isAllRequired) {
            for (const key in obj) {
                if (!(key === 'company' && inputs.role >= 2)) {
                    if (key === 'zone' && !isVehiclesNameMeaged_alExist(obj.fields, obj.role)) {
                        continue
                    }

                    if (obj[key] === '') {
                        console.log(obj)
                        console.log(obj[key])
                        window.alert('אחד הנתונים חסר')
                        return
                    }
                }
            }
        }

        let response
        if (users || route === 'users') {
            const pid = obj.pid
            delete obj.pid
            const url = route === 'users' ? baseUrl : 'http://vm0099eged:3005'
            response = await fetch(`${url}/api/${route}/${createFetch || ''}`, {
                method: "PATCH",
                headers: {
                    Accept: "application/json",
                    "content-type": "application/json"
                },
                body: JSON.stringify({ pid: pid, system: SYSTEM, systemSettings: obj })
            })
        }
        else {
            response = await fetch(`${baseUrl}/api/${route}/${createFetch || ''}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "content-type": "application/json"
                },
                body: JSON.stringify(obj)
            })
        }
        if (response.status === 200) {
            setSeverity('success')
            setAlertText("ההוספה עברה בהצלחה")
        }
        else {
            setSeverity('error')
            if (users) {
                setAlertText("משתמש זה כבר קיים במערכת")
            }
            else {
                const payload = await response.json()
                setAlertText(payload)

            }
        }


        setOpenAlert(true)
        getPids && getPids()
        if (restartForm)
            restartForm()
        reload()

    }

    const handleClose = () => {
        setOpenAlert(false)
        setOpen(false)
        if (restartForm)
            restartForm()

    }



    return (
        <Dialog keepMounted open={open} onClose={handleClose}>
            <DialogTitle sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>הוסף חדש
                <IconButton onClick={() => setOpen(false)} >
                    <CloseIcon sx={{ fill: 'black' }} />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ width: '25vw', height: modalHeight || '60vh', borderRadius: '10px', padding: '1% 0px 5% 0px' }}>
                <SendAlert open={openAlert} text={alertText} severity={severity} setOpen={setOpenAlert} />
                <Box sx={{
                    display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'space-between',
                    width: '80%', position: 'relative', left: '50%', transform: 'translateX(-50%)'
                }}>
                    {content && content.map((inp, index) => {
                        if (!inp.props.id) {
                            return inp
                        }
                        if (inp.props.select) {
                            return <TextField
                                key={index}
                                inputRef={ref => { inputRef.current[index] = ref }}
                                {...inp.props}

                                SelectProps={{
                                    inputProps: {
                                        ref: inputRef.current[index]
                                    },
                                    ...(inp.props.SelectProps || {})
                                }}
                            />
                        }
                        return <TextField
                            key={index}
                            inputRef={ref => { inputRef.current[index] = ref }}
                            {...inp.props}
                        />
                    })}

                </Box>
            </DialogContent>
            <Divider />
            <DialogActions>
                <Button onClick={sendChange} >אישור</Button>
                <Button onClick={handleClose} >ביטול</Button>
            </DialogActions>
        </Dialog>
    )
}