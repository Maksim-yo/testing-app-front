import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { checkBackendAlive } from "../utils/checkBackendAlive";
import { BackupTableRounded } from "@mui/icons-material";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const navigate = useNavigate();
  const { signIn } = useSignIn();

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const backendAlive = await checkBackendAlive();
    if (!backendAlive) {
      setLoading(false);
      e.preventDefault();

      setSnackbar({
        open: true,
        message: "Сервер недоступен. Попробуйте позже.",
        severity: "error",
      });
      return;
    }

    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setSnackbar({
        open: true,
        message: "Письмо для сброса пароля отправлено. Проверьте почту.",
        severity: "success",
      });
      navigate("/reset-password-verification");
      setEmail("");
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message:
          err.errors?.[0]?.longMessage ||
          "Ошибка при отправке письма. Проверьте email и попробуйте снова.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Восстановление пароля
      </Typography>
      <Typography variant="body2" align="center" mb={3}>
        Введите свой email, и мы отправим код для сброса пароля.
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          margin="normal"
          autoComplete="email"
          disabled={loading}
        />

        <Box textAlign="center" mt={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !email}
            fullWidth
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : "Отправить код"}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResetPasswordPage;
