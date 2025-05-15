import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

export const ValidationDialog = ({ open, onClose, errors }) => {
  if (!errors || errors.length === 0) return null;

  // Группировка по типу ошибок (можно адаптировать по ключевым словам)
  const belbinErrors = errors.filter((e) => e.toLowerCase().includes("белбин"));
  const questionErrors = errors.filter(
    (e) =>
      e.toLowerCase().includes("вопрос") && !e.toLowerCase().includes("белбин")
  );
  const otherErrors = errors.filter(
    (e) => !belbinErrors.includes(e) && !questionErrors.includes(e)
  );

  const renderList = (title, items) => (
    <>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        {title}
      </Typography>
      <List dense>
        {items.map((err, i) => (
          <ListItem key={i}>
            <ListItemIcon>
              <ReportProblemIcon color="error" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={err} />
          </ListItem>
        ))}
      </List>
      <Divider />
    </>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <ErrorOutlineIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Обнаружены ошибки в тесте
      </DialogTitle>
      <DialogContent dividers>
        {otherErrors.length > 0 && renderList("Общие ошибки", otherErrors)}
        {questionErrors.length > 0 &&
          renderList("Ошибки вопросов", questionErrors)}
        {belbinErrors.length > 0 &&
          renderList("Ошибки Белбин-блоков", belbinErrors)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Понятно
        </Button>
      </DialogActions>
    </Dialog>
  );
};
