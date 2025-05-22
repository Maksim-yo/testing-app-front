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
  Link,
} from "@mui/material";
import { useSignIn } from "@clerk/clerk-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const ResetPasswordVerification = () => {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, setActive } = useSignIn();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setSnackbar({
        open: true,
        message: "Пароли не совпадают",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setSnackbar({
          open: true,
          message: "Пароль успешно изменен!",
          severity: "success",
        });
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message:
          err.errors?.[0]?.longMessage ||
          "Ошибка при сбросе пароля. Попробуйте снова.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = password === passwordConfirm;

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Сброс пароля
      </Typography>
      <Typography variant="body2" align="center" mb={3}>
        Введите код подтверждения из письма и новый пароль
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Код подтверждения"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          fullWidth
          required
          margin="normal"
          disabled={loading}
        />

        <TextField
          label="Новый пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
          disabled={loading}
          autoComplete="new-password"
        />

        <TextField
          label="Повторите пароль"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          fullWidth
          required
          margin="normal"
          disabled={loading}
          error={passwordConfirm !== "" && !passwordsMatch}
          helperText={
            passwordConfirm !== "" && !passwordsMatch
              ? "Пароли не совпадают"
              : ""
          }
          autoComplete="new-password"
        />

        <Box textAlign="center" mt={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={
              loading ||
              !code ||
              !password ||
              !passwordConfirm ||
              !passwordsMatch
            }
            fullWidth
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : "Сбросить пароль"}
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
      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          <Link component={RouterLink} to="/reset-password">
            Отправить код заново
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default ResetPasswordVerification;
