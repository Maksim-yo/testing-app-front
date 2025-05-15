import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Grid,
  Avatar,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ruLocale from "date-fns/locale/ru";
import { PhotoCamera, Save, Cancel } from "@mui/icons-material";
import { useGetCurrentUserQuery, useUpdateProfileMutation } from "../app/api";

const ProfilePage = ({ positions, onSave }) => {
  const [editMode] = useState(true); // Всегда включён, т.к. это стартовая настройка
  const [preview, setPreview] = useState(null);
  const { data: employeeData } = useGetCurrentUserQuery();
  const [employee, setEmployee] = useState(employeeData);
  const [updateProfile] = useUpdateProfileMutation();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    if (employeeData?.photo) {
      setPreview(
        typeof employeeData.photo === "string"
          ? employeeData.photo
          : URL.createObjectURL(employeeData.photo)
      );
    }
    setEmployee(employeeData);
  }, [employeeData]);

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

  const handleSave = async () => {
    await updateProfile(employee);
    if (onSave) onSave(employee);
  };

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 900, width: "100%" }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Добро пожаловать!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Пожалуйста, завершите заполнение своего профиля, чтобы мы могли
            персонализировать ваш опыт.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <Avatar
              src={preview || ""}
              sx={{ width: 160, height: 160, mx: "auto", mb: 2 }}
            />
            <Button
              variant="outlined"
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

        <Grid container spacing={2} justifyContent="center">
          {/* ФИО */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Фамилия"
              name="last_name"
              value={employee?.last_name || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Имя"
              name="first_name"
              value={employee?.first_name || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Отчество"
              name="middle_name"
              value={employee?.middle_name || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ruLocale}
            >
              <DatePicker
                label="Дата рождения"
                value={employee?.birth_date || null}
                onChange={(date) => handleDateChange("birth_date", date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          {/* Контакты */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Телефон"
              name="phone"
              value={employee?.phone || ""}
              onChange={handleChange}
              placeholder="+7 (___) ___-__-__"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={employee?.email || ""}
              onChange={handleChange}
              type="email"
            />
          </Grid>

          {/* Рабочее */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ruLocale}
            >
              <DatePicker
                label="Дата приёма"
                value={employee?.hire_date || null}
                onChange={(date) => handleDateChange("hire_date", date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Должность"
              name="position_id"
              value={employee?.position_id || ""}
              onChange={handleChange}
            >
              {positions?.map((position) => (
                <MenuItem key={position.id} value={position.id}>
                  {position.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button variant="contained" onClick={handleSave} size="large">
            Сохранить профиль
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Button color="error" onClick={() => setOpenDeleteDialog(true)}>
            Удалить аккаунт
          </Button>
        </Box>
      </Paper>

      {/* Диалог удаления */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Удаление аккаунта</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить аккаунт? Это действие необратимо.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Отмена</Button>
          <Button
            color="error"
            onClick={() => console.log("Удаление аккаунта")}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
