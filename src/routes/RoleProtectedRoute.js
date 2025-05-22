import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const RoleProtectedRoute = ({ children, role = "all" }) => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      navigate("/sign-in", { replace: true }); // Редирект если неавторизован
    }
  }, [isLoaded, user, navigate]);

  const isAdmin = user?.unsafeMetadata?.isAdmin;
  const userRole = isAdmin ? "admin" : "employee";

  useEffect(() => {
    if (!isLoaded || !user) return;

    // если роль задана И НЕ "all", проверяем соответствие
    if (role !== "all" && userRole !== role) {
      setOpen(true);
      const timer = setTimeout(() => {
        navigate("/", { replace: true }); // Редирект если нет доступа
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [userRole, role, isLoaded, user, navigate]);

  const handleClose = () => setOpen(false);

  if (!isLoaded) return null;

  if (!user) {
    return (
      <Snackbar
        open={true}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={handleClose}>
          Вы не авторизованы.
        </Alert>
      </Snackbar>
    );
  }

  if (role !== "all" && userRole !== role) {
    return (
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={handleClose}>
          У вас нет доступа к этой странице.
        </Alert>
      </Snackbar>
    );
  }

  return children;
};
