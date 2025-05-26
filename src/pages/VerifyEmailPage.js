import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Link,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useSignUp, useClerk } from "@clerk/clerk-react"; // Добавим useClerk для доступа к clerk API
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import VerificationInput from "react-verification-input";
import { ConstructionOutlined } from "@mui/icons-material";
import { useCreateUserMutation } from "../app/api";
import { useLocation } from "react-router-dom";
import { useDeleteClerkUserMutation } from "../app/api";
const VerifyEmailPage = () => {
  const { signUp, isLoaded } = useSignUp();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteClerkUser] = useDeleteClerkUserMutation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [codeExpired, setCodeExpired] = useState(false); // Для отслеживания ошибки истечения времени
  const { clerk } = useClerk(); // Используем clerk API для отправки кода
  const [cooldown, setCooldown] = useState(0);
  const [createUser] = useCreateUserMutation();
  const { state } = useLocation();
  const { setActive } = useClerk(); // Добавляем useClerk

  const { pendingUser } = state || {};
  const { email } = state || {};
  const onSubmit = async ({ code }) => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      console.log(result.createdUserId);
      if (pendingUser) {
        // Пытаемся создать пользователя в базе
        try {
          await createUser({
            clerk_id: result.createdUserId,
            email: pendingUser.email,
            is_admin: pendingUser.isAdmin,
          }).unwrap(); // важно: unwrap, чтобы выбросить ошибку при неуспехе
        } catch (err) {
          await deleteClerkUser(result.createdUserId).unwrap();
          throw err;
        }
      }
      // Если создание в БД успешно — активируем сессию
      await setActive({ session: result.createdSessionId });

      setSnackbar({
        open: true,
        message: "Почта успешно подтверждена!",
        severity: "success",
      });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.log("Full error:", err);

      // Слишком много попыток
      if (err.message?.includes("Too many failed attempts")) {
        setSnackbar({
          open: true,
          message: "Слишком много попыток. Запросите новый код.",
          severity: "error",
        });
        setCodeExpired(true);
        return;
      }

      if (
        err.message?.includes(
          "Sign up unsuccessful due to failed security validations"
        )
      ) {
        setSnackbar({
          open: true,
          message:
            "Не удалось завершить регистрацию из-за ошибок безопасности. Обновите страницу и попробуйте снова.",
          severity: "error",
        });
        return;
      }
      // Неверный код
      if (err.message?.includes("Incorrect code")) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Неверный код. Попробуйте ещё раз.",
        });
        return;
      }

      // Ошибка при создании пользователя в БД
      if (err.status === 400 || err.status === 500) {
        const detailMessage = err?.data?.detail || "";

        if (detailMessage.includes("email уже существует")) {
          setSnackbar({
            open: true,
            message: "Пользователь с таким email уже существует.",
            severity: "error",
          });
          return;
        }

        setSnackbar({
          open: true,
          message: "Ошибка при создании пользователя. Попробуйте позже.",
          severity: "error",
        });
        return;
      }
      if (err.status === "FETCH_ERROR") {
        setSnackbar({
          open: true,
          message:
            "Не удалось соединиться с сервером. Проверьте подключение к интернету.",
          severity: "error",
        });
        return;
      }
      // Ошибки Clerk
      const clerkError = err.errors?.[0];
      if (clerkError?.code === "session_exists") {
        setSnackbar({
          open: true,
          message: "Вы уже вошли в систему.",
          severity: "info",
        });
        setTimeout(() => navigate("/"), 1500);
        return;
      }
      if (clerkError?.code === "verification_expired") {
        setCodeExpired(true);
        setSnackbar({
          open: true,
          message: "Код истёк. Пожалуйста, запросите новый.",
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message:
            clerkError?.longMessage ||
            "Ошибка подтверждения. Попробуйте ещё раз.",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    setLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setSnackbar({
        open: true,
        message: "Новый код отправлен на вашу почту.",
        severity: "success",
      });
      setCodeExpired(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.errors?.[0]?.message || "Ошибка при отправке кода",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          Подтверждение почты
        </Typography>
        <Typography variant="body2" gutterBottom align="center">
          Введите код, который был отправлен на вашу почту.
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box display="flex" justifyContent="center" mb={2}>
            <Controller
              name="code"
              control={control}
              rules={{ required: "Код обязателен" }}
              render={({ field }) => (
                <VerificationInput
                  {...field}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  validChars="0-9"
                  length={6} // Длина кода
                  onChange={(code) => field.onChange(code)} // Обновление значения
                  autoFocus
                  placeholder="-" // Placeholder для пустых полей
                />
              )}
            />
          </Box>

          {errors.code && (
            <Typography color="error" variant="body2" mb={2} align="center">
              {errors.code.message}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Подтвердить"}
          </Button>

          <Box mt={2} textAlign="center">
            <Button
              variant="outlined"
              onClick={resendCode}
              disabled={loading || cooldown > 0}
            >
              {cooldown > 0
                ? `Новый код через ${cooldown} сек`
                : "Отправить новый код"}
            </Button>
            <Typography sx={{ mt: 1 }}>
              Или попробуйте{" "}
              <Link component={RouterLink} to="/sign-up">
                зарегистрироваться заново
              </Link>{" "}
            </Typography>
          </Box>
        </form>
      </Paper>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default VerifyEmailPage;
