import { CircularProgress, Box, Typography, Fade } from "@mui/material";
import useUser from "../contexts/UserContext";


export default function ProtectedUser({ children }) {
  const [user, setUser] = useUser();
  if (user === null) {
    return (
      <Fade in timeout={500}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            gap: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
          }}
        >
          <CircularProgress size={200} thickness={4} />
          <Typography
            variant="h3"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              letterSpacing: 0.5,
            }}
          >
            מתחבר למערכת...
          </Typography>
        </Box>
      </Fade>
    );
  }

  return children;
}