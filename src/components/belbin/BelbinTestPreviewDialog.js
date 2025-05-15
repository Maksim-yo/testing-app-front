import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  DialogActions,
  Button,
} from "@mui/material";

const BelbinTestPreviewDialog = ({ open, onClose, roles }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Предпросмотр теста Белбина</DialogTitle>
      <DialogContent>
        <List>
          {roles.map((role) => (
            <ListItem key={role.id} alignItems="flex-start">
              <ListItemText primary={role.title} secondary={role.description} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BelbinTestPreviewDialog;
