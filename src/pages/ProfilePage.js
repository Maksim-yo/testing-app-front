import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
  Avatar,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PhotoCamera, Edit, Save, Cancel } from "@mui/icons-material";
import ruLocale from "date-fns/locale/ru";
import { useGetCurrentUserQuery, useUpdateProfileMutation } from "../app/api";
const ProfilePage = ({ positions, onSave }) => {
  const [editMode, setEditMode] = useState(true);
  const [preview, setPreview] = useState(null);
  const { data: employeeData } = useGetCurrentUserQuery();
  const [employee, setEmployee] = useState(employeeData);
  console.log(employee);
  const [updateProfile] = useUpdateProfileMutation();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDeleteAccount = () => {
    // TODO: здесь вызывается API для удаления аккаунта
    console.log("Аккаунт удалён (заглушка)");
    setOpenDeleteDialog(false);
  };
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
    // onSave(employee);
    await updateProfile(employee);
  };

  const handleCancel = () => {
    setEmployee(employeeData);
    // setEditMode(false);
    if (employeeData.photo) {
      setPreview(
        typeof employeeData.photo === "string"
          ? employeeData.photo
          : URL.createObjectURL(employeeData.photo)
      );
    } else {
      setPreview(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">Профиль сотрудника</Typography>
          {!editMode ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
            >
              Редактировать
            </Button>
          ) : (
            <Box>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                sx={{ mr: 2 }}
              >
                Сбросить
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSave}
              >
                Сохранить
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Фото и основная информация */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src={preview || ""}
                sx={{ width: 200, height: 200, mb: 2 }}
              />
              {editMode && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                >
                  Изменить фото
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              )}
            </Box>
          </Grid>

          {/* Основные данные */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Основная информация
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="last_name"
                  value={employee?.last_name || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="first_name"
                  value={employee?.first_name || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Отчество"
                  name="middle_name"
                  value={employee?.middle_name || ""}
                  onChange={handleChange}
                  disabled={!editMode}
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
                    value={employee?.birth_date || null}
                    onChange={(date) => handleDateChange("birth_date", date)}
                    disabled={!editMode}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth disabled={!editMode} />
                    )}
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
                  disabled={!editMode}
                >
                  {/* {positions.map((position) => (
                    <MenuItem key={position.id} value={position.id}>
                      {position.title}
                    </MenuItem>
                  ))} */}
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Контактная информация
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={employee?.phone || ""}
                  onChange={handleChange}
                  placeholder="+7 (___) ___-__-__"
                  disabled={!editMode}
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
                  disabled={!editMode}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Рабочая информация
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ruLocale}
                >
                  <DatePicker
                    label="Дата приема"
                    value={employee?.hire_date || null}
                    onChange={(date) => handleDateChange("hire_date", date)}
                    disabled={!editMode}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth disabled={!editMode} />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setOpenDeleteDialog(true)}
        >
          Удалить аккаунт
        </Button>
      </Box>
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
          <Button color="error" onClick={handleDeleteAccount}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
