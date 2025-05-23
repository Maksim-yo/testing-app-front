import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useResetTestForEmployeeMutation } from "../../app/api";
import { useState } from "react";
import { useCallback } from "react";
const ResetTestDialog = ({ open, onClose, testId, employeeId }) => {
  const [resetTest, { isLoading }] = useResetTestForEmployeeMutation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleConfirm = async () => {
    try {
      await resetTest({ testId, employeeId }).unwrap();
      setSnackbar({
        open: true,
        message: "Результаты теста сброшены",
        severity: "success",
      });
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Ошибка при сбросе теста",
        severity: "error",
      });
    }
  };
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <Dialog open={open} onClose={onClose}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <DialogTitle>Сбросить результаты теста?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Вы уверены, что хотите сбросить результаты этого теста? Все ответы
          будут удалены.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Отменить
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          Сбросить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetTestDialog;
