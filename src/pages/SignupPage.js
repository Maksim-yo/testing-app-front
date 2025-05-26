import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Paper,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSignUp } from "@clerk/clerk-react";
import { useForm, Controller } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { checkBackendAlive } from "../utils/checkBackendAlive";

// внутри компонента

const SignUpPage = () => {
  const { isLoaded, signUp } = useSignUp();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      isAdmin: true,
    },
  });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [pendingUser, setPendingUser] = useState(null);
  const [searchParams] = useSearchParams();

  const onSubmit = async ({ email, password, confirmPassword, isAdmin }) => {
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
    if (password !== confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Пароли не совпадают",
      });
      return;
    }

    if (!isLoaded) return;

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: { isAdmin },
      });

      // Отправка информации о пользователе на бэкенд

      // Отправка кода подтверждения на email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingUser({
        id: result.id,
        email,
        is_admin: isAdmin,
      });
      // Показываем snackbar
      setSnackbar({
        open: true,
        message: "Код подтверждения отправлен на вашу почту.",
        severity: "success",
      });

      // Переход на страницу подтверждения
      navigate("/verify-email", { state: { pendingUser: { email, isAdmin } } });
    } catch (err) {
      const clerkError = err?.errors?.[0];
      const code = clerkError?.code;
      const message = clerkError?.message || "Ошибка регистрации";

      if (code === "form_identifier_exists") {
        setError("email", {
          type: "manual",
          message: "Этот email уже зарегистрирован.",
        });
      } else {
        setError("email", { type: "manual", message });
      }

      setSnackbar({ open: true, message, severity: "error" });
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, mb: 2, px: 3, color: "#ec407a" }} // это примерно pink[400]
        >
          При регистрации будет создана учетная запись администратора.
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            {...register("email", {
              required: "Email обязательное поле",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Неверный формат email",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          {/* Password */}
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Пароль обязателен",
              minLength: {
                value: 8,
                message: "Пароль должен быть не менее 8 символов",
              },
              pattern: {
                value: /^(?=.*[A-Z])[A-Za-z0-9_!?.]+$/,
                message: "Пароль должен содержать хотя бы одну заглавную букву",
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

          {/* Confirm Password */}
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
              "Зарегистрироваться"
            )}
          </Button>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Уже есть аккаунт?{" "}
            <Link component={RouterLink} to="/sign-in">
              Войти
            </Link>
          </Typography>
        </Box>
      </Paper>

      {/* Snackbar */}
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

export default SignUpPage;
