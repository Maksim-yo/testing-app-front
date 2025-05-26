import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
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
      await deleteBelbinRole(roleId);
    } catch (err) {
      console.error("Ошибка при удалении роли:", err);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingRole(null);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
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
