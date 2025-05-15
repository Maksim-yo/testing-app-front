import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Snackbar, Alert } from "@mui/material";

export const RoleProtectedRoute = ({ children, role }) => {
  const { user } = useUser();
  const isAdmin = user?.unsafeMetadata?.isAdmin;
  const userRole = isAdmin ? "admin" : "employee";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (userRole && userRole !== role) {
      setOpen(true);
    }
  }, [userRole, role]);

  const handleClose = () => setOpen(false);

  if (userRole !== role) {
    return (
      <>
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
      </>
    );
  }

  return children;
};
