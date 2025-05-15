import React from "react";
import { Box, TextField, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

export const RoleEditor = ({ role, onChange, onDelete }) => {
  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 2,
        mb: 2,
        position: "relative",
      }}
    >
      <IconButton
        onClick={onDelete}
        sx={{ position: "absolute", top: 8, right: 8 }}
        size="small"
      >
        <Delete color="error" />
      </IconButton>

      <TextField
        fullWidth
        label="Название роли"
        value={role.title}
        onChange={(e) => onChange({ ...role, title: e.target.value })}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Описание роли"
        value={role.description}
        onChange={(e) => onChange({ ...role, description: e.target.value })}
      />
    </Box>
  );
};
