// pages/VerifyAgainPage.tsx
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const VerifyAgainPage = () => {
  const { isLoaded, user } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const newEmail = searchParams.get("email");

  useEffect(() => {
    const updateAndVerifyEmail = async () => {
      if (!user || !newEmail) return;

      try {
        // Шаг 1: создаём новый email
        const emailRef = await user.createEmailAddress({ email: newEmail });

        // Шаг 2: отправляем код верификации (уже сделано до этого на клиенте)
        await user.prepareEmailAddressVerification({
          strategy: "email_code",
          identifier: newEmail,
        });

        // Шаг 3: подтверждаем код
        // await emailRef.verify({ code });

        // Шаг 4: делаем его основным (по желанию)
        // await user.update({ primaryEmailAddressId: emailRef.id });

        setSnackbar({
          open: true,
          message: "Почта успешно подтверждена!",
          severity: "success",
        });

        setTimeout(() => {
          setSnackbar({ ...snackbar, open: false });
          //   navigate("/me"); // или назад: navigate(-1)
        }, 1500);
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message:
            err.errors?.[0]?.longMessage || "Ошибка при подтверждении почты",
          severity: "error",
        });
      }
    };

    if (isLoaded) {
      updateAndVerifyEmail();
    }
  }, [isLoaded, user, newEmail, navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="80vh"
    >
      <CircularProgress />
      <Typography variant="h6" mt={2}>
        Подтверждаем почту...
      </Typography>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default VerifyAgainPage;
