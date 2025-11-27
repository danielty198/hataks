import { Collapse, Box, Alert, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function SendAlert({
    severity = "error",
    open = false,
    setOpen,
    text = "הייתה בעיה, יש לרענן ולנסות שוב"
}) {
    return (
        <Collapse in={open} unmountOnExit>
            <Box
                sx={{
                    width: "70%",
                    mx: "auto",
                    mt: 2
                }}
            >
                <Alert
                    severity={severity}
                    color={severity}
                    action={
                        setOpen && (
                            <IconButton
                                onClick={() => setOpen(false)}
                                size="small"
                            >
                                <CloseIcon sx={{ fill: "black" }} fontSize="inherit" />
                            </IconButton>
                        )
                    }
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        py: 1.5
                    }}
                >
                    <Typography>
                        {text}
                    </Typography>
                </Alert>
            </Box>
        </Collapse>
    );
}
