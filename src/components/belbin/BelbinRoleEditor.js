import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  useGetBelbinRolesQuery,
  useDeleteBelbinRoleMutation,
  useUpdateBelbinRoleMutation,
  useCreateBelbinRoleMutation,
} from "../../app/api";
import { useDispatch, useSelector } from "react-redux";

const BelbinRoleEditor = ({ initialRole, onSave, onCancel }) => {
  const [name, setName] = useState(initialRole?.name || "");
  const [description, setDescription] = useState(
    initialRole?.description || ""
  );
  const isFormValid = name.trim() !== "";
  const [updateBelbinRole, { isLoading: isUpdating }] =
    useUpdateBelbinRoleMutation();
  const [createBelbinRole, { isLoading: isCreating }] =
    useCreateBelbinRoleMutation();
  const isLoading = isCreating || isUpdating;
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSave({ ...initialRole, name, description });
    onSave();
  };

  const handleSave = async (updatedRole) => {
    if (updatedRole.id === "new") {
      await createBelbinRole(updatedRole);
    } else {
      await updateBelbinRole(updatedRole);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, mx: "auto" }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {initialRole?.id === "new" ? "Добавление роли" : "Редактирование роли"}
      </Typography>

      <TextField
        label="Название роли"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={!isFormValid || isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </Box>
    </Box>
  );
};

export default BelbinRoleEditor;
