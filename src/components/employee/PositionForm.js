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
  Paper,
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
  const isLoading = isUpdating || isCreating;
  const accessLevels = [
    { value: "basic", label: "Базовый" },
    { value: "medium", label: "Средний" },
    { value: "high", label: "Высокий" },
    { value: "admin", label: "Администратор" },
  ];
  const isFormValid = position.title.trim() !== "";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPosition((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (positionData) => {
    if (initialData) {
      console.log({ ...initialData, ...positionData });
      await updatePosition({ ...initialData, ...positionData });
    } else {
      await createPosition(positionData);
    }
    handleCloseForm();
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
            // helperText={!isFormValid ? "Обязательное поле" : ""}
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
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отменить</Button>
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
  );
};

export default PositionForm;
