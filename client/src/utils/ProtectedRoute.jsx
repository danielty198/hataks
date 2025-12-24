import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import useUser from "../hooks/useUser";

function ProtectedRoute({ children, roleRequired }) {
  const [user] = useUser();
  const [redirect, setRedirect] = useState(false);
  const [countdown, setCountdown] = useState(3); // 3-second countdown
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowSnackbar(true);
      setRedirect(true);
      return;
    }

    if (roleRequired) {
      const requiredRoles = Array.isArray(roleRequired)
        ? roleRequired
        : [roleRequired];

      const hasPermission = requiredRoles.some(role =>
        user.roles?.includes(role)
      );

      if (!hasPermission) {
        setShowSnackbar(true);
        setRedirect(true);
      }
    }
  }, [user, roleRequired]);

  // Countdown logic
  useEffect(() => {
    if (!redirect) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirect]);

  if (redirect) {
    return (
      <>
        <Snackbar
          open={showSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="error" variant="filled">
            אין לך הרשאה לדף זה מעביר אותך בעוד {countdown}...
          </Alert>
        </Snackbar>

        {/* Navigate only when countdown reaches 0 */}
        {countdown <= 0 && <Navigate to="/" replace />}
      </>
    );
  }

  return children;
}

export default ProtectedRoute;
