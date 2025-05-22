import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

const DeleteEmployeeDialog = ({ open, onClose, onConfirm, isDeleting }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Удаление аккаунта</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Вы уверены, что хотите удалить аккаунт? Это действие необратимо.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          color="error"
          onClick={onConfirm}
          disabled={isDeleting}
          startIcon={
            isDeleting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isDeleting ? "Удаление..." : "Удалить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteEmployeeDialog;
