import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import TestPreview from "./TestPreview";

const TestPreviewDialog = ({ open, onClose, test }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Предпросмотр теста</DialogTitle>
      <DialogContent dividers>
        <TestPreview test={test} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestPreviewDialog;
