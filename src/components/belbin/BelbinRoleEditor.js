import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  useGetBelbinRolesQuery,
  useDeleteBelbinRoleMutation,
  useUpdateBelbinRoleMutation,
  useCreateBelbinRoleMutation,
} from "../../app/api";
import { useDispatch, useSelector } from "react-redux";

const BelbinRoleEditor = ({ initialRole, onSave, onCancel }) => {
  const [name, setName] = useState(initialRole?.name || "");
  const [description, setDescription] = useState(
    initialRole?.description || ""
  );
  const isFormValid = name.trim() !== "";
  const [updateBelbinRole, { isLoading: isUpdating }] =
    useUpdateBelbinRoleMutation();
  const [createBelbinRole, { isLoading: isCreating }] =
    useCreateBelbinRoleMutation();
  const isLoading = isCreating || isUpdating;
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSave({ id: initialRole.id, name, description });
  };
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'error' | 'success' | 'info' | 'warning'
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSave = async (updatedRole) => {
    console.log("role");
    try {
      let res;
      if (updatedRole.id === "new") {
        res = await createBelbinRole(updatedRole).unwrap();
      } else {
        res = await updateBelbinRole(updatedRole).unwrap();
      }

      setSnackbar({
        open: true,
        message: "Роль успешно сохранена",
        severity: "success",
      });

      setTimeout(() => {
        onSave();
      }, 1000); // 1 секунда — достаточно, чтобы Snackbar успел отобразиться
    } catch (error) {
      console.error("Ошибка при сохранении роли:", error);

      // Попытка извлечь сообщение
      const detail =
        error?.data?.detail ||
        (Array.isArray(error?.data) && error.data[0]?.msg) || // если список ошибок от Pydantic
        "Не удалось сохранить роль";

      const isDuplicate =
        detail.includes("уже существует") || detail.includes("already exists");

      setSnackbar({
        open: true,
        message: isDuplicate ? "Роль с таким именем уже существует" : detail,
        severity: "error",
      });
    }
  };
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, mx: "auto" }}
    >
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {initialRole?.id === "new" ? "Добавление роли" : "Редактирование роли"}
      </Typography>

      <TextField
        label="Название роли"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={!isFormValid || isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </Box>
    </Box>
  );
};

export default BelbinRoleEditor;
