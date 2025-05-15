import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { ContentCopy, Check } from "@mui/icons-material";
import { useState } from "react";

const AccountDetailsModal = ({ open, onClose, account, employee }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!account) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Данные учетной записи</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {employee.lastName} {employee.firstName} {employee.middleName}
          </Typography>
          <Typography color="text.secondary">
            Для входа в систему используйте следующие данные:
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <TextField
            label="Логин"
            value={account.username}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleCopy(account.username)}>
                    {copied ? <Check color="success" /> : <ContentCopy />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Временный пароль"
            value={account.tempPassword}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleCopy(account.tempPassword)}>
                    {copied ? <Check color="success" /> : <ContentCopy />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            * Пароль необходимо сменить при первом входе в систему
          </Typography>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        <Button
          variant="contained"
          onClick={() => {
            // Здесь можно добавить отправку данных на email
            onClose();
          }}
        >
          Отправить на email
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountDetailsModal;
