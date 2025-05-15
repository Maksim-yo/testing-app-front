import React from "react";
import { Box, Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import BelbinRolesList from "./BelbinRolesList";
import BelbinRoleEditor from "./BelbinRoleEditor";
import BelbinTestPreviewDialog from "./BelbinTestPreviewDialog";

import { BelbinPositionList } from "./BelbinPositionList";
import BeblinPositionEditor from "./BelbinPositionEditor";

import { BelbinRolesManager } from "./BelbinRolesManager";
import { BelbinPositionManager } from "./BelbinPositionsManager";

export const BelbinManager = () => {
  const dispatch = useDispatch();
  const roleMode = useSelector((state) => state.roles.mode);
  const positionMode = useSelector((state) => state.positionsBelbin.mode);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // --- Handlers for Roles ---

  const handlePreview = () => setPreviewOpen(true);

  // --- Conditional UI Rendering ---
  const isEditing = roleMode === "edit" || positionMode === "edit";

  return (
    <Box sx={{ p: 3 }}>
      {isEditing ? (
        <>
          {roleMode === "edit" && <BelbinRolesManager />}
          {positionMode === "edit" && <BelbinPositionManager />}
        </>
      ) : (
        <>
          <BelbinRolesManager />
          <BelbinPositionManager />
        </>
      )}
    </Box>
  );
};
