import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PhotoCamera } from "@mui/icons-material";
import ruLocale from "date-fns/locale/ru";
import { isValid } from "date-fns";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../../app/api";
import InputMask from "react-input-mask";
import dayjs from "dayjs";

const isEqual = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};
const EmployeeForm = ({
  open,
  onClose,
  positions,
  initialData,
  settings,
  showSnackbar,
}) => {
  const defaultFormState = {
    last_name: "",
    first_name: "",
    middle_name: "",
    birth_date: null,
    phone: null,
    email: "",
    position_id: "",
    hire_date: null,
    photo: null,
    is_admin: false,
  };
  const [
    createEmployee,
    { isLoading: isCreating, isError: isCreatingError, error: createError },
  ] = useCreateEmployeeMutation();

  const [
    updateEmployee,
    { isLoading: isUpdating, isError: isUpdatingError, error: updateError },
  ] = useUpdateEmployeeMutation();
  const isLoading = isUpdating || isCreating;
  const [employee, setEmployee] = useState(defaultFormState);
  const [preview, setPreview] = useState(null);
  const isModified = !isEqual(employee, initialData || defaultFormState);
  const isManual = settings.mode === "manual";
  const isInvite = settings.mode === "invite";

  const handleSave = async (employeeData) => {
    const formData = new FormData();
    const phone = employee.phone?.trim() || "";

    // Проверка: либо пусто, либо строго соответствует маске
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    const isPhoneValid = phone === "" || phoneRegex.test(phone);

    if (!isPhoneValid) {
      showSnackbar("Телефон должен быть полностью заполнен или пустым");
      return;
    }
    for (const [key, value] of Object.entries(employeeData)) {
      if (value !== null && value !== undefined && key !== "photo") {
        if (key === "birth_date" || key === "hire_date") {
          const date = new Date(value);
          const isoDate = date.toISOString().split("T")[0];
          formData.append(key, isoDate);
        } else {
          formData.append(key, value);
        }
      }
    }

    if (employeeData?.photo && employeeData?.photo !== initialData?.photo) {
      formData.append("photo", employeeData.photo);
    }

    try {
      const result = initialData
        ? await updateEmployee({
            employee: formData,
            employeeId: employeeData.id,
          })
        : await createEmployee(formData);

      // Проверяем, есть ли ошибка в ответе
      if (result.error) {
        // Варианты где может лежать сообщение об ошибке
        const errorDetail = result.error.data?.detail;
        let errorMessage = "Неизвестная ошибка";

        if (typeof errorDetail === "string") {
          errorMessage = errorDetail;
        } else if (errorDetail?.message) {
          errorMessage = errorDetail.message;
        } else if (errorDetail?.error_message) {
          errorMessage = errorDetail.error_message;
        }

        throw new Error(`Ошибка сервера: ${errorMessage}`);
      }

      handleClose();
    } catch (error) {
      console.error("Ошибка при сохранении данных сотрудника:", error);
      showSnackbar(error.message || "Ошибка при сохранении данных сотрудника");
    }
  };

  // console.log(initialData);
  // Сброс формы при открытии/закрытии или изменении initialData
  useEffect(() => {
    if (open) {
      if (initialData) {
        setEmployee(initialData);
        // Обработка фото для предпросмотра
        if (initialData.photo) {
          if (typeof initialData.photo === "string") {
            // Если фото - это URL строки
            setPreview(initialData.photo);
          } else if (initialData.photo instanceof File) {
            // Если фото - это File объект
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result);
            reader.readAsDataURL(initialData.photo);
          }
        } else {
          setPreview(null);
        }
      } else {
        resetForm();
      }
    }
  }, [open, initialData]);
  const resetForm = () => {
    setEmployee(defaultFormState);
    setPreview(null);
  };

  const handleChange = (e) => {
    // console.log(e.target.name);
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
        const base64 = reader.result.split(",")[1]; // убрать data:image/jpeg;base64,
        setEmployee((prev) => ({ ...prev, photo: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    await handleSave(employee);
  };
  const isFormValid = () => {
    return (
      (isManual &&
        employee.last_name &&
        employee.first_name &&
        employee.position_id &&
        employee.is_admin !== undefined &&
        isModified) ||
      (isInvite &&
        employee.email &&
        employee.is_admin !== undefined &&
        employee.position_id)
    );
  };
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Новый сотрудник</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Фамилия"
                name="last_name"
                value={employee.last_name}
                onChange={handleChange}
                required={isManual}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Имя"
                name="first_name"
                value={employee.first_name}
                onChange={handleChange}
                required={isManual}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Отчество"
                name="middle_name"
                value={employee.middle_name}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ruLocale}
              >
                <DatePicker
                  label="Дата рождения"
                  value={employee.birth_date || null}
                  maxDate={dayjs()} // Ограничение: не позже сегодняшнего дня
                  onChange={(date) => handleDateChange("birth_date", date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Контактная информация
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InputMask
                mask="+7 (999) 999-99-99"
                value={employee.phone || ""}
                onChange={(e) =>
                  setEmployee((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                // disabled={isProcessing}
              >
                {(inputProps) => (
                  <TextField
                    {...inputProps}
                    fullWidth
                    label="Телефон"
                    name="phone"
                    placeholder="+7 (___) ___-__-__"
                  />
                )}
              </InputMask>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={employee.email}
                onChange={handleChange}
                type="email"
                required={isInvite}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Должность"
                name="position_id"
                value={employee.position_id}
                onChange={handleChange}
                required
              >
                {positions.map((position) => (
                  <MenuItem key={position.id} value={position.id}>
                    {position.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ruLocale}
              >
                <DatePicker
                  label="Дата приема"
                  value={employee.hire_date || null}
                  maxDate={dayjs()} // Ограничение: не позже сегодняшнего дня
                  onChange={(date) => handleDateChange("hire_date", date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Права доступа"
                name="is_admin"
                value={employee.is_admin ?? false}
                onChange={handleChange}
                required
              >
                <MenuItem value={true}>Администратор</MenuItem>
                <MenuItem value={false}>Пользователь</MenuItem>
              </TextField>
              <Grid />
            </Grid> */}
          </Grid>
          <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
            <Avatar
              src={
                preview
                  ? preview.startsWith("data:image")
                    ? preview
                    : `data:image/jpeg;base64,${preview}`
                  : ""
              }
              sx={{ width: 100, height: 100, mr: 2 }}
            />
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
            >
              Загрузить фото
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отменить</Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!isFormValid() || isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeForm;
