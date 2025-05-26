import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  useCreateBelbinRoleMutation,
  useUpdateBelbinRoleMutation,
} from "../../app/api";

const initialFormState = {
  name: "",
  description: "",
};

const BelbinRoleForm = ({ open, onClose, initialData, handleCloseForm }) => {
  const [role, setRole] = useState(initialFormState);

  const [
    createRole,
    { isLoading: isCreating, isError: isCreateError, error: createError },
  ] = useCreateBelbinRoleMutation();
  const [
    updateRole,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdateBelbinRoleMutation();
  console.log(initialData);
  const isLoading = isCreating || isUpdating;
  const isFormValid = role.name.trim() !== "";
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'error' | 'success' | 'info' | 'warning'
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (open) {
      setRole(initialData || initialFormState);
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRole((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const trimmedData = {
      name: (role.name || "").trim(),
      description: (role.description || "").trim(),
    };
    try {
      if (initialData?.id) {
        await updateRole({ id: initialData.id, ...trimmedData }).unwrap();
      } else {
        await createRole(trimmedData).unwrap();
      }

      setTimeout(() => {}, 1000); // 1 секунда — достаточно, чтобы Snackbar успел отобразиться

      handleCloseForm?.();
      onClose();
      setRole(initialFormState);
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

  const handleCancel = () => {
    setRole(initialFormState);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
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
      <DialogTitle>
        {initialData ? "Редактировать роль" : "Новая роль"}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Название роли"
            name="name"
            value={role.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Описание"
            name="description"
            value={role.description}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Отменить</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !isFormValid}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BelbinRoleForm;
