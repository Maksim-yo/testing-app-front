import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { useClerk, useReverification } from "@clerk/clerk-react";

const ChangePasswordDialog = ({ open, onClose }) => {
  const clerk = useClerk();
  const changePassword = useReverification(
    async (currentPassword, newPassword) => {
      await clerk.user?.updatePassword({
        currentPassword,
        newPassword,
      });
    }
  );

  const {
    control,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data) => {
    setFormError(null);
    setSuccess(false);

    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Пароли не совпадают",
      });
      return;
    }

    try {
      setLoading(true);
      await changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      reset();
      onClose();
    } catch (err) {
      setFormError(
        err.errors?.[0]?.longMessage || err.message || "Ошибка смены пароля"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormError(null);
    setSuccess(false);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Изменить пароль</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Пароль успешно изменён!
          </Alert>
        )}

        {/* Текущий пароль */}
        <Controller
          name="currentPassword"
          control={control}
          rules={{ required: "Введите текущий пароль" }}
          render={({ field }) => (
            <TextField
              {...field}
              margin="dense"
              label="Текущий пароль"
              type={showCurrent ? "text" : "password"}
              fullWidth
              variant="standard"
              disabled={loading || success}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrent(!showCurrent)}
                      edge="end"
                    >
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* Новый пароль */}
        <Controller
          name="newPassword"
          control={control}
          rules={{
            required: "Введите новый пароль",
            minLength: {
              value: 8,
              message: "Пароль должен быть не менее 8 символов",
            },
            pattern: {
              value: /[A-Z]/,
              message: "Пароль должен содержать хотя бы одну заглавную букву",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              margin="dense"
              label="Новый пароль"
              type={showNew ? "text" : "password"}
              fullWidth
              variant="standard"
              disabled={loading || success}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew(!showNew)} edge="end">
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* Подтверждение пароля */}
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: "Подтвердите новый пароль",
            validate: (value) => value === newPassword || "Пароли не совпадают",
          }}
          render={({ field }) => (
            <TextField
              {...field}
              margin="dense"
              label="Повтор нового пароля"
              type={showConfirm ? "text" : "password"}
              fullWidth
              variant="standard"
              disabled={loading || success}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                      edge="end"
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={loading || success}>
          Сменить пароль
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
