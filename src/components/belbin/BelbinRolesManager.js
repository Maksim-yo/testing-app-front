import React, { useEffect, useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import BelbinRolesList from "./BelbinRolesList";
import BelbinRoleForm from "./BelbinRoleForm"; // <-- импорт новой формы
import BelbinTestPreviewDialog from "./BelbinTestPreviewDialog";

import {
  useGetBelbinRolesQuery,
  useDeleteBelbinRoleMutation,
} from "../../app/api";

export const BelbinRolesManager = ({ setError }) => {
  const { data: roles = [], error: errorRoles } = useGetBelbinRolesQuery();
  const [deleteBelbinRole] = useDeleteBelbinRoleMutation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'error' | 'success' | 'info' | 'warning'
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (errorRoles) setError(errorRoles);
  }, [errorRoles, setError]);

  const handleAddRole = () => {
    setEditingRole(null); // Создаем новую роль
    setFormOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role); // Редактируем существующую роль
    setFormOpen(true);
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await deleteBelbinRole(roleId).unwrap();
    } catch (error) {
      const detail =
        error?.data?.detail ||
        (Array.isArray(error?.data) && error.data[0]?.msg) || // если список ошибок от Pydantic
        "Не удалось сохранить роль";
      if (detail.includes("Cannot delete role with answers")) {
        setSnackbar({
          open: true,
          message: "Невозможно удалить роль так как она используется в тестах",
          severity: "error",
        });
      }
      console.error("Ошибка при удалении роли:", error);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingRole(null);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };
  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <BelbinRolesList
        roles={roles}
        onAddRole={handleAddRole}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
        onPreviewTest={handlePreview}
      />
      <BelbinRoleForm
        open={formOpen}
        onClose={handleCloseForm}
        initialData={editingRole}
        handleCloseForm={handleCloseForm}
      />
      <BelbinTestPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        roles={roles}
      />
    </Box>
  );
};
