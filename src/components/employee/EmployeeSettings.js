import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";

export const EmployeeSettings = ({ open, setOpen, onConfirm }) => {
  const [mode, setMode] = useState("manual");

  const handleConfirm = () => {
    onConfirm(mode);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Выбор способа создания сотрудника</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Как вы хотите добавить нового сотрудника?
        </Typography>
        <RadioGroup value={mode} onChange={(e) => setMode(e.target.value)}>
          <FormControlLabel
            value="manual"
            control={<Radio />}
            label="✔ Заполнить профиль вручную"
          />
          <FormControlLabel
            value="invite"
            control={<Radio />}
            label="🔗 Отправить ссылку сотруднику для заполнения"
          />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button onClick={handleConfirm} variant="contained">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
