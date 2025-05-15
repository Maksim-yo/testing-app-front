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
      <DialogTitle>Новая должность</DialogTitle>
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

          <TextField
            select
            fullWidth
            label="Уровень доступа"
            name="accessLevel"
            value={position.accessLevel}
            onChange={handleChange}
            margin="normal"
          >
            {accessLevels.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Оклад"
            name="salary"
            value={position.salary}
            onChange={handleChange}
            margin="normal"
            type="number"
            InputProps={{ endAdornment: "₽" }}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="hasSystemAccess"
                checked={position.hasSystemAccess}
                onChange={handleChange}
              />
            }
            label="Доступ к системе"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отменить</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading}
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
