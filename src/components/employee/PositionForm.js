import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  useDeletePositionMutation,
  useUpdatePositionMutation,
  useCreatePositionMutation,
} from "../../app/api";

const PositionForm = ({ open, onClose, initialData, handleCloseForm }) => {
  const initialFormState = {
    title: "",
    description: "",
    accessLevel: "basic",
    salary: 0,
    hasSystemAccess: false,
  };
  const [position, setPosition] = useState(initialFormState);

  const [
    createPosition,
    { isLoading: isCreating, isError: isCreatingError, error: createError },
  ] = useCreatePositionMutation();
  const [
    updatePosition,
    { isLoading: isUpdating, isError: isUpdatingError, error: updateError },
  ] = useUpdatePositionMutation();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error", // error, success, warning, info
  });

  const isLoading = isUpdating || isCreating;
  const isFormValid = position.title.trim() !== "";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPosition((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSave = async (positionData) => {
    try {
      if (initialData) {
        await updatePosition({ ...initialData, ...positionData }).unwrap();
      } else {
        await createPosition(positionData).unwrap();
      }

      setTimeout(() => {}, 1000); // 1 секунда — достаточно, чтобы Snackbar успел отобразиться
      handleCloseForm();
    } catch (error) {
      console.error("Ошибка при сохранении должности:", error);

      // Попытка извлечь сообщение
      const detail =
        error?.data?.detail ||
        (Array.isArray(error?.data) && error.data[0]?.msg) || // если список ошибок от Pydantic
        "Не удалось сохранить должность";

      const isDuplicate =
        detail.includes("уже существует") || detail.includes("already exists");

      setSnackbar({
        open: true,
        message: isDuplicate
          ? "Должность с таким именем уже существует"
          : detail,
        severity: "error",
      });
    }
  };

  useEffect(() => {
    if (open) {
      setPosition(initialData || initialFormState);
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    await handleSave(position);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setPosition(initialFormState);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {initialData ? "Редактировать должность" : "Новая должность"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Название должности"
              name="title"
              value={position.title}
              onChange={handleChange}
              margin="normal"
              required
              // error={!isFormValid}
              helperText={!isFormValid ? "Обязательное поле" : ""}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={position.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              disabled={isLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Отменить
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isLoading || !isFormValid}
            startIcon={
              isLoading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
    </>
  );
};

export default PositionForm;
