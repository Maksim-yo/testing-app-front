import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  Avatar,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { WarningAmber, PhotoCamera, Cancel } from "@mui/icons-material";
import { useUser, useReverification } from "@clerk/clerk-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ruLocale from "date-fns/locale/ru";
import { useGetCurrentUserQuery, useUpdateProfileMutation } from "../app/api";
import ChangePasswordDialog from "./ChangePasswordDialog";
import EmailVerifyDialog from "../components/Inputs/EmailVerifyDialog";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import InputMask from "react-input-mask";
import dayjs from "dayjs";
import { useRef } from "react";
const ProfilePage = () => {
  // Состояния
  const [employee, setEmployee] = useState({
    hire_date: null,
    id: null,
    photo: null,
    first_name: "",
    photo_url: null,
    middle_name: null,
    is_admin: false,
    birth_date: null,
    created_by_id: null,
    phone: null,
    clerk_id: "",
    email: "",
    last_name: "",
    position_id: null,
  });
  const [preview, setPreview] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const createEmailAddress = useReverification((email) =>
    user?.createEmailAddress({ email })
  );
  const [emailVerification, setEmailVerification] = useState(null);
  const deleteEmail = useReverification((emailId) =>
    user.emailAddresses.find((email) => email.id === emailId)?.destroy()
  );
  const [initialEmployee, setInitialEmployee] = useState(null);

  // API и данные
  const { data: employeeData, isLoading: isEmployeeLoading } =
    useGetCurrentUserQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const { user } = useUser();
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || ""
  );
  // Проверки состояния
  const isEmailVerified =
    user?.primaryEmailAddress?.verification?.status === "verified" &&
    user?.primaryEmailAddress.emailAddress === email;
  console.log(user?.primaryEmailAddress);
  const isEmailChanged =
    email !== (user?.primaryEmailAddress?.emailAddress || "");
  const showEmailWarning = (isEmailChanged || !isEmailVerified) && !emailError;
  const disableSaveButton = isEmailChanged || !isEmailVerified;
  // Инициализация данных
  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData);
      setEmail(user?.primaryEmailAddress?.emailAddress || "");

      if (employeeData.photo) {
        setPreview(`data:image/jpeg;base64,${employeeData.photo}`);
      }
    }
  }, [employeeData, user]);

  // Обработчики изменений
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setEmployee((prev) => ({ ...prev, [name]: date }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setEmployee((prev) => ({ ...prev, photo: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeEmail = (e) => {
    const value = e.target.value;
    setEmail(value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(
      value && !emailRegex.test(value)
        ? "Введите корректный email (пример: example@gmail.com)"
        : ""
    );
  };

  // Отправка кода подтверждения
  const handleSendVerificationCode = useCallback(async () => {
    if (!email || emailError) return;

    try {
      const currentEmails = user?.emailAddresses || [];
      const primaryEmail = currentEmails[0];

      // Если уже есть такой email и он не подтверждён — открыть диалог подтверждения
      if (
        primaryEmail &&
        primaryEmail.emailAddress === email &&
        primaryEmail.verification.status !== "verified"
      ) {
        console.log("Email is set, but not verified");
        setEmailVerification(email);
        setShowVerifyDialog(true);
        return;
      }

      // Удаление всех неподтверждённых email-адресов
      const unverifiedEmails = currentEmails.filter(
        (e) => e.verification.status !== "verified"
      );

      if (unverifiedEmails.length > 0) {
        console.log("Deleting unverified emails...");
        await Promise.all(unverifiedEmails.map((e) => deleteEmail(e.id)));
        await user.reload();
      }

      // Добавление нового email
      console.log("Creating new email:", email);
      await createEmailAddress(email);
      await user.reload();

      setEmailVerification(email);
      setShowVerifyDialog(true);
    } catch (err) {
      console.error("Verification error:", err);

      let message = "Ошибка. Попробуйте ещё раз";
      if (err.errors?.[0]?.code === "authentication_required") {
        message = "Требуется повторная аутентификация";
      } else if (err.errors?.[0]?.code === "form_identifier_exists") {
        message = "Этот email уже используется";
      }

      setSnackbar({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [email, emailError, user]);

  const updateEmail = async () => {
    console.log("Сохранение почты: ", emailVerification);
    const formData = new FormData();

    // for (const [key, value] of Object.entries(employee)) {
    //   if (value !== null && value !== undefined && key !== "photo") {
    //     if (key === "birth_date" || key === "hire_date") {
    //       const date = new Date(value);
    //       const isoDate = date.toISOString().split("T")[0];
    //       formData.append(key, isoDate);
    //     } else formData.append(key, value);
    //   }
    // }
    // if (employeeData?.photo !== employee.photo) {
    //   formData.append("photo", employee.photo);
    // }
    formData.append("email", emailVerification);
    console.log(formData);
    await updateProfile(formData);
  };
  // Сохранение профиля
  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const phone = employee.phone?.trim() || "";

      // Проверка: либо пусто, либо строго соответствует маске
      const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
      const isPhoneValid = phone === "" || phoneRegex.test(phone);

      if (!isPhoneValid) {
        setSnackbar({
          open: true,
          message: "Телефон должен быть полностью заполнен или пустым",
          severity: "warning",
        });
        setIsProcessing(false);
        return;
      }
      const formData = new FormData();

      // Сравниваем и добавляем только изменённые поля
      for (const [key, value] of Object.entries(employee)) {
        const initialValue = initialEmployee?.[key];
        const isFile = value instanceof File;
        const isChanged = isFile || value !== initialValue;

        if (
          isChanged &&
          value !== null &&
          value !== undefined &&
          key !== "photo"
        ) {
          if (key === "birth_date" || key === "hire_date") {
            const date = new Date(value);
            const isoDate = date.toISOString().split("T")[0];
            formData.append(key, isoDate);
          } else {
            formData.append(key, value);
          }
        }
      }

      if (employeeData?.photo !== employee.photo) {
        formData.append("photo", employee.photo);
      }
      // Email — сравнение отдельно
      // if (email !== (user?.emailAddresses[0]?.emailAddress || "")) {
      formData.append("email", email);
      // }

      if ([...formData.keys()].length === 0) {
        setSnackbar({
          open: true,
          message: "Нет изменений для сохранения",
          severity: "info",
        });
        setIsProcessing(false);
        return;
      }

      await updateProfile(formData).unwrap();

      setSnackbar({
        open: true,
        message: "Профиль успешно обновлен",
        severity: "success",
      });

      // Обновляем initialEmployee после сохранения
      setInitialEmployee(employee);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Ошибка при обновлении профиля",
        severity: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Сброс изменений
  const handleCancel = useCallback(() => {
    setEmployee(employeeData);
    setEmail(user?.emailAddresses[0]?.emailAddress || "");
    setEmailError("");

    if (employeeData?.photo) {
      setPreview(`data:image/jpeg;base64,${employeeData.photo}`);
    } else {
      setPreview(null);
    }
  }, [employeeData, user]);

  if (isEmployeeLoading) {
    return (
      <Box
        sx={{
          height: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (!employeeData) {
    return (
      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Alert severity="error">
          Сотрудник не найден или произошла ошибка загрузки.
        </Alert>
      </Box>
    );
  }

  const handleNameChange = (e) => {
    const { name, value } = e.target;

    // Разрешены только буквы кириллицы и латиницы
    const onlyLetters = value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, "");

    setEmployee((prev) => ({
      ...prev,
      [name]: onlyLetters,
    }));
  };
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Шапка профиля */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">Профиль сотрудника</Typography>

          <Box>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              sx={{ mr: 2 }}
              disabled={isProcessing}
            >
              Сбросить
            </Button>

            <Tooltip
              title={
                disableSaveButton ? "Подтвердите email для сохранения" : ""
              }
            >
              <span>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={disableSaveButton || isProcessing}
                >
                  {isProcessing ? <CircularProgress size={24} /> : "Сохранить"}
                </Button>
              </span>
            </Tooltip>

            <Button
              variant="text"
              onClick={() => setOpenChangePassword(true)}
              sx={{ ml: 2 }}
            >
              Изменить пароль
            </Button>
          </Box>
        </Box>

        {/* Основное содержимое */}
        <Grid container spacing={3}>
          {/* Колонка с фото */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar src={preview} sx={{ width: 200, height: 200, mb: 2 }} />
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                disabled={isProcessing}
              >
                Изменить фото
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
          </Grid>

          {/* Колонка с данными */}
          <Grid item xs={12} md={8}>
            {/* Основная информация */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Основная информация
            </Typography>
            <Grid container spacing={2}>
              {["last_name", "first_name", "middle_name"].map((field) => (
                <Grid item xs={12} sm={4} key={field}>
                  <TextField
                    fullWidth
                    label={
                      field === "last_name"
                        ? "Фамилия"
                        : field === "first_name"
                        ? "Имя"
                        : "Отчество"
                    }
                    name={field}
                    value={employee[field] || ""}
                    onChange={handleNameChange}
                    disabled={isProcessing}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Дата рождения */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ruLocale}
                >
                  <DatePicker
                    label="Дата рождения"
                    value={employee.birth_date || null}
                    onChange={(date) => handleDateChange("birth_date", date)}
                    maxDate={dayjs()} // Ограничение: не позже сегодняшнего дня
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        disabled={isProcessing}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Контактная информация */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Контактная информация
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={email}
                  onChange={handleChangeEmail}
                  type="email"
                  error={!!emailError || showEmailWarning}
                  helperText={
                    emailError ||
                    (showEmailWarning ? "Пожалуйста, подтвердите email" : "")
                  }
                  disabled={isProcessing}
                  InputProps={{
                    endAdornment: showEmailWarning && !emailError && (
                      <Tooltip title="Email не подтверждён">
                        <InputAdornment position="end">
                          <WarningAmber color="warning" />
                        </InputAdornment>
                      </Tooltip>
                    ),
                  }}
                />

                {(isEmailChanged || !isEmailVerified) && !emailError && (
                  <Button
                    variant="outlined"
                    onClick={handleSendVerificationCode}
                    sx={{ mt: 2 }}
                    disabled={isProcessing || !email}
                  >
                    {isProcessing ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Подтвердить email"
                    )}
                  </Button>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Рабочая информация */}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ruLocale}
                >
                  <DatePicker
                    label="Дата приема"
                    value={employee.hire_date || null}
                    onChange={(date) => handleDateChange("hire_date", date)}
                    maxDate={dayjs()} // Ограничение: не позже сегодняшнего дня
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        disabled={isProcessing}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Диалоговые окна */}
      <ChangePasswordDialog
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
      />
      {showVerifyDialog && (
        <EmailVerifyDialog
          onSuccess={updateEmail}
          emailToVerify={emailVerification}
          open={showVerifyDialog}
          onClose={() => setShowVerifyDialog(false)}
          onVerificationSuccess={() => {
            setSnackbar({
              open: true,
              message: "Email успешно подтвержден!",
              severity: "success",
            });
          }}
        />
      )}
      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
