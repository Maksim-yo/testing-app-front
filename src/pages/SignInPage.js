import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSignIn } from "@clerk/clerk-react";
import { useForm } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { checkBackendAlive } from "../utils/checkBackendAlive";

const SignInPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const onSubmit = async ({ email, password }) => {
    if (!isLoaded) return;

    setIsLoading(true);
    const backendAlive = await checkBackendAlive();
    if (!backendAlive) {
      setIsLoading(false);
      setSnackbar({
        open: true,
        message: "Сервер недоступен. Попробуйте позже.",
        severity: "error",
      });
      return;
    }
    setErrorMessage(""); // Сброс ошибки перед отправкой запроса

    try {
      const result = await signIn.create({ identifier: email, password });
      await setActive({ session: result.createdSessionId });
      navigate("/tests"); // Перенаправление на страницу после успешного входа
    } catch (err) {
      console.error("Ошибка при входе:", err); // Добавим вывод ошибки для отладки

      // Перехватываем ошибку, если не найден аккаунт
      if (err.errors?.[0]?.message.includes("Couldn't find your account")) {
        setErrorMessage(
          "Аккаунт с таким email не найден. Пожалуйста, зарегистрируйтесь."
        );
      } else {
        setErrorMessage("Неверный логин или пароль");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          Система тестирования персонала
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          gutterBottom
        >
          Оценка потенциала. Повышение эффективности.
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <TextField
            fullWidth
            label="Электронная почта\логин"
            margin="normal"
            {...register("email", {
              required: "Это поле обязательна",
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            required
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Пароль"
            type={showPassword ? "text" : "password"}
            margin="normal"
            {...register("password", { required: "Пароль обязателен" })}
            error={!!errors.password}
            helperText={errors.password?.message}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Submit Button */}
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
              "Войти"
            )}
          </Button>

          {/* Error Message */}
          {errorMessage && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 2, textAlign: "center" }}
            >
              {errorMessage}
            </Typography>
          )}
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Нет аккаунта?{" "}
            <Link component={RouterLink} to="/sign-up">
              Зарегистрироваться
            </Link>
          </Typography>
        </Box>
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Забыли пароль?{" "}
            <Link component={RouterLink} to="/reset-password">
              Восстановить
            </Link>
          </Typography>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

export default SignInPage;
