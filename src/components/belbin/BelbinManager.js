import React from "react";
import { Box, Grid, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import BelbinRolesList from "./BelbinRolesList";
import BelbinRoleEditor from "./BelbinRoleEditor";
import BelbinTestPreviewDialog from "./BelbinTestPreviewDialog";

import { BelbinPositionList } from "./BelbinPositionList";
import BeblinPositionEditor from "./BelbinPositionEditor";

import { BelbinRolesManager } from "./BelbinRolesManager";
import { BelbinPositionManager } from "./BelbinPositionsManager";
import { useState } from "react";

export const BelbinManager = () => {
  const dispatch = useDispatch();
  const roleMode = useSelector((state) => state.roles.mode);
  const positionMode = useSelector((state) => state.positionsBelbin.mode);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  // --- Handlers for Roles ---
  const [rolesError, setRolesError] = useState("");
  const [positionError, setPositionError] = useState("");

  const handlePreview = () => setPreviewOpen(true);

  // --- Conditional UI Rendering ---
  const isEditing = roleMode === "edit" || positionMode === "edit";
  if (rolesError || positionError) {
    console.log(rolesError, positionError);
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        Произошла ошибка при загрузке данных. Попробуйте позже.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {isEditing ? (
        <>
          {roleMode === "edit" && <BelbinRolesManager />}
          {positionMode === "edit" && <BelbinPositionManager />}
        </>
      ) : (
        <>
          <BelbinRolesManager setError={setRolesError} />
          <BelbinPositionManager setError={setPositionError} />
        </>
      )}
    </Box>
  );
};
