import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import VerificationInput from "react-verification-input";
import { useForm, Controller } from "react-hook-form";
import { useUser, useReverification } from "@clerk/clerk-react";

const EmailVerifyDialog = ({ open, onClose, emailToVerify, onSuccess }) => {
  const { user } = useUser();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  // Состояния
  const [isSend, setIsSend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeReady, setCodeReady] = useState(false);
  const deleteEmail = useReverification((emailId) =>
    user.emailAddresses.find((email) => email.id === emailId)?.destroy()
  );
  const hasRequested = useRef(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [cooldown, setCooldown] = useState(0);
  const [codeExpired, setCodeExpired] = useState(false);

  // Мемоизированные значения

  // Мемоизированные обработчики
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const resendCode = async () => {
    if (loading) return; // Защита от повторного вызова
    console.log("resendCode called", {
      time: new Date().toISOString(),
      emailToVerify,
      loading,
      cooldown,
    });
    console.log(user, emailToVerify);
    const currentEmail = user?.emailAddresses?.find(
      (a) => a.emailAddress === emailToVerify
    );
    setLoading(true);
    setCooldown(60);

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    try {
      const res = await currentEmail.prepareVerification({
        strategy: "email_code",
      });

      if (!res) {
        setSnackbar({
          open: true,
          message: "Ошибка при отправке кода",
          severity: "error",
        });
        return;
      }

      setSnackbar({
        open: true,
        message: "Код отправлен на вашу почту.",
        severity: "success",
      });
      setCodeExpired(false);
      setCodeReady(true); // ✅ теперь можно отправлять код
    } catch (err) {
      console.error("Resend code error:", err);
      setSnackbar({
        open: true,
        message: err.errors?.[0]?.message || "Ошибка при отправке кода",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => clearInterval(timer), 60000);
    }
  };
  const onSubmit = async ({ code }) => {
    console.log("Подвтерил", code);
    console.log(user);
    const currentEmail = user?.emailAddresses?.find(
      (a) => a.emailAddress === emailToVerify
    );
    console.log(currentEmail);
    if (!currentEmail) {
      setSnackbar({
        open: true,
        message: "Сначала запросите код подтверждения",
        severity: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const emailVerifyAttempt = await currentEmail.attemptVerification({
        code,
      });

      if (!emailVerifyAttempt) {
        setSnackbar({
          open: true,
          message: "Ошибка при подтверждении почты",
          severity: "error",
        });
        return;
      }
      await user.reload();

      const otherVerifiedEmails = user.emailAddresses.filter(
        (email) =>
          email.id !== currentEmail.id &&
          email.verification?.status === "verified"
      );

      await Promise.all(
        otherVerifiedEmails.map((email) => deleteEmail(email.id))
      );
      await onSuccess();

      setSnackbar({
        open: true,
        message: "Почта успешно подтверждена!",
        severity: "success",
      });
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error("Verification error:", err);

      const error = err.errors?.[0];
      if (error?.code === "authentication_required") {
        setSnackbar({
          open: true,
          message: "Требуется повторная аутентификация",
          severity: "warning",
        });
        return;
      }

      if (err.message?.includes("Too many failed attempts")) {
        setSnackbar({
          open: true,
          message: "Слишком много попыток. Запросите новый код.",
          severity: "error",
        });
        setCodeExpired(true);
        return;
      }

      if (error?.code === "verification_expired") {
        setCodeExpired(true);
        setSnackbar({
          open: true,
          message: "Код истёк. Пожалуйста, запросите новый.",
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: error?.longMessage || "Неверный код. Попробуйте ещё раз",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Эффекты
  useEffect(() => {
    let isMounted = true;

    const loadAndVerify = async () => {
      if (open && user && !hasRequested.current && isMounted) {
        await user.reload();
        const emailAddress = user.emailAddresses?.find(
          (a) => a.emailAddress === emailToVerify
        );

        if (emailAddress && isMounted) {
          reset();
          setCodeExpired(false);
          setCooldown(0);
          hasRequested.current = true;
          await resendCode();
        }
      }
    };

    if (open) {
      loadAndVerify();
    }

    return () => {
      isMounted = false;
    };
  }, [open, user, emailToVerify]);
  useEffect(() => {
    if (!open) {
      hasRequested.current = false; // сбрасываем флаг при закрытии диалога
      setIsSend(false);
    }
  }, [open]);
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Подтверждение почты</DialogTitle>
        <DialogContent>
          <Typography variant="body2" align="center" mb={2}>
            Введите код, отправленный на {emailToVerify}
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box display="flex" justifyContent="center" mb={2}>
              <Controller
                name="code"
                control={control}
                rules={{ required: "Код обязателен" }}
                render={({ field }) => (
                  <VerificationInput
                    {...field}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    validChars="0-9"
                    length={6}
                    onChange={field.onChange}
                    autoFocus
                    placeholder="-"
                  />
                )}
              />
            </Box>

            {errors.code && (
              <Typography color="error" variant="body2" mb={2} align="center">
                {errors.code.message}
              </Typography>
            )}

            <DialogActions>
              <Button onClick={onClose} disabled={loading}>
                Отмена
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : "Подтвердить"}
              </Button>
            </DialogActions>
          </form>

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
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EmailVerifyDialog;
