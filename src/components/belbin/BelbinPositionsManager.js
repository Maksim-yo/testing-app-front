import React, { useEffect } from "react";
import { Box, Button, Typography, Paper, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  deletePosition,
  setCurrentPosition,
  resetCurrentPosition,
  setMode,
} from "../../slices/positionsBelbinSlice";
import { useState } from "react";
import BeblinPositionEditor from "./BelbinPositionEditor";
import { BelbinPositionList } from "./BelbinPositionList";
import { useDeleteBelbinPositionsMutation } from "../../app/api";
import { useGetBelbinPositionsQuery } from "../../app/api";

export const BelbinPositionManager = ({ setError }) => {
  const {
    data: positions = [],
    isLoading: isLoadingRoles,
    error: errorRoles,
  } = useGetBelbinPositionsQuery();
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();
  const currentPosition = useSelector(
    (state) => state.positionsBelbin.currentPosition
  );
  const mode = useSelector((state) => state.positionsBelbin.mode);
  const [deleteBelbinPosition] = useDeleteBelbinPositionsMutation();

  const handleAddPosition = () => {
    setOpen(true);
    dispatch(setCurrentPosition({ id: "new", title: "", coefficients: {} }));
    dispatch(setMode("edit"));
  };

  const handleEditPosition = (position) => {
    setOpen(true);
    dispatch(setCurrentPosition(position));
    dispatch(setMode("edit"));
  };

  const handleDeletePosition = async (positionId) => {
    await deleteBelbinPosition(positionId);
  };

  const handleCancelEdit = () => {
    dispatch(resetCurrentPosition());
    dispatch(setMode("list"));
  };
  useEffect(() => {
    if (errorRoles) setError(errorRoles);
  });
  return (
    <Box sx={{ p: 3 }}>
      {mode === "edit" && currentPosition ? (
        <BeblinPositionEditor
          position={currentPosition}
          onCancel={handleCancelEdit}
          open={open}
        />
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">
              Должности с коэффициентами Белбина
            </Typography>
            <Button variant="contained" onClick={handleAddPosition}>
              Добавить должность
            </Button>
          </Box>

          <Paper
            elevation={3}
            sx={{
              height: 500,
              overflowY: "auto",
              p: 2,
            }}
          >
            <BelbinPositionList
              positions={positions}
              onEdit={handleEditPosition}
              onDelete={handleDeletePosition}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};
