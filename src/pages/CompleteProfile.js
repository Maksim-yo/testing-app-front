import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useSignUp } from "@clerk/clerk-react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import React, { useState, useEffect } from "react";

const CompleteSignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [searchParams] = useSearchParams();
  const ticket = searchParams.get("__clerk_ticket");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Пароли не совпадают",
      });
      return;
    }

    if (!isLoaded || !ticket) return;

    setIsLoading(true);
    try {
      const result = await signUp.create({
        strategy: "ticket", // Add this line
        ticket: ticket,
        password,
      });

      const email = result.emailAddress;
      const userId = result.id;
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      }
      setSnackbar({
        open: true,
        message: "Регистрация завершена!",
        severity: "success",
      });

      // редирект на форму профиля или dashboard
      navigate("/", {
        state: { email, userId },
      });
    } catch (err) {
      console.error(err);
      const message =
        err.errors?.[0]?.message || "Ошибка при завершении регистрации";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Показываем спиннер, если ticket отсутствует
  if (!ticket) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h6">Ссылка приглашения недействительна</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>
          Завершение регистрации
        </Typography>
        <Typography variant="body1" gutterBottom>
          Придумайте пароль для входа
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Пароль */}
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Пароль обязателен",
              minLength: { value: 8, message: "Минимум 8 символов" },
              pattern: {
                value: /[A-Z]/,
                message: "Хотя бы одна заглавная буква",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Пароль"
                type={showPassword ? "text" : "password"}
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Подтверждение */}
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Подтвердите пароль",
              validate: (value) =>
                value === watch("password") || "Пароли не совпадают",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Подтверждение пароля"
                type={showConfirmPassword ? "text" : "password"}
                margin="normal"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Завершить регистрацию"
            )}
          </Button>
        </form>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CompleteSignUpPage;
