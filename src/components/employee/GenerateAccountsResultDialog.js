import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const GeneratedAccountsResultDialog = ({ open, onClose, results }) => {
  const handleCopy = (username, password, fullName, email) => {
    navigator.clipboard.writeText(
      `Логин: ${username}, Пароль: ${password}, ФИО: ${fullName}${
        email ? `, Почта: ${email}` : ""
      }`
    );
  };
  const getPhotoUrl = (photo) => {
    console.log("ff");
    if (!photo) return null;

    if (typeof photo === "string") {
      if (photo.startsWith("data:image")) {
        return photo;
      }
      return `data:image/jpeg;base64,${photo}`;
    }

    if (photo instanceof File) {
      return URL.createObjectURL(photo); // Если это File объект
    }

    return null;
  };
  const handleExportCSV = () => {
    if (!results || results.length === 0) return;

    const header = ["ID", "ФИО", "Логин", "Пароль", "Email", "Должность"];

    const escapeCsvField = (field) => {
      if (field == null) return '""';
      const str = String(field);
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = results.map(
      ({ id, fullName, username, password, email, positionTitle }) => [
        id,
        escapeCsvField(fullName),
        escapeCsvField(username),
        escapeCsvField(password),
        escapeCsvField(email),
        escapeCsvField(positionTitle || ""),
      ]
    );

    const bom = "\uFEFF";
    const csvContent =
      bom +
      [header.map(escapeCsvField), ...rows]
        .map((row) => row.join(";"))
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `generated_accounts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Автоматическая загрузка CSV при открытии окна
  useEffect(() => {
    if (open) {
      handleExportCSV();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Аккаунты успешно созданы</DialogTitle>
      <DialogContent>
        {results.map(
          (
            { id, fullName, username, password, email, photo, positionTitle },
            index
          ) => {
            const photoUrl = getPhotoUrl(photo);
            return (
              <Box
                key={id || index}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
                p={1}
                sx={{ border: "1px solid #ddd", borderRadius: 1 }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={photoUrl}
                    alt={fullName}
                    sx={{ width: 56, height: 56 }}
                  />
                  <Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">{fullName}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {positionTitle || "Должность не указана"}
                    </Typography>
                    {email && (
                      <Typography variant="body2" color="text.secondary">
                        {email}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box textAlign="right" ml={2}>
                  <Typography variant="body2">Логин: {username}</Typography>
                  <Typography variant="body2" mb={0.5}>
                    Пароль: {password}
                  </Typography>
                  <Tooltip title="Скопировать логин и пароль">
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleCopy(username, password, fullName, email)
                      }
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          }
        )}
      </DialogContent>
      {/* <DialogActions>
        <Button onClick={handleExportCSV} variant="outlined">
          Экспортировать CSV
        </Button>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default GeneratedAccountsResultDialog;
