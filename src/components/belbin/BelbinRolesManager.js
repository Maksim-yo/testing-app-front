import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Box, Alert } from "@mui/material";
import BelbinRolesList from "./BelbinRolesList"; // список ролей
import BelbinRoleEditor from "./BelbinRoleEditor"; // форма редактирования одной роли
import BelbinTestPreviewDialog from "./BelbinTestPreviewDialog"; // просмотр теста
import {
  createRole,
  editRole,
  saveRole,
  deleteRole,
  setMode,
  resetCurrentRole,
} from "../../slices/roleSlice";
import {
  useGetBelbinRolesQuery,
  useDeleteBelbinRoleMutation,
  useUpdateBelbinRoleMutation,
  useCreateBelbinRoleMutation,
} from "../../app/api";
export const BelbinRolesManager = ({ setError }) => {
  const dispatch = useDispatch();
  const { currentRole, mode } = useSelector((state) => state.roles);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    error: errorRoles,
  } = useGetBelbinRolesQuery();
  const [deleteBelbinRole] = useDeleteBelbinRoleMutation();
  const handleCreate = () => {
    dispatch(createRole());
  };

  const handleEdit = (role) => {
    dispatch(editRole(role));
  };

  const handleSave =  () => {
    dispatch(setMode("list"));
  };

  const handleDelete = async (roleId) => {
    await deleteBelbinRole(roleId);
  };

  const handleCancel = () => {
    dispatch(setMode("list"));
    dispatch(resetCurrentRole());
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };
  useEffect(() => {
    if (errorRoles) setError(errorRoles);
  });
  return (
    <Box sx={{ p: 3 }}>
      {mode === "list" ? (
        <BelbinRolesList
          roles={roles}
          onAddRole={handleCreate}
          onEditRole={handleEdit}
          onDeleteRole={handleDelete}
          onPreviewTest={handlePreview}
        />
      ) : (
        <BelbinRoleEditor
          initialRole={currentRole}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      <BelbinTestPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        roles={roles}
      />
    </Box>
  );
};
