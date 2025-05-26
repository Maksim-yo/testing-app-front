import React, { useState } from "react";
import { NumberFormatBase } from "react-number-format";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  useUpdateBelbinPositionMutation,
  useCreateBelbinPositionMutation,
  useGetBelbinRolesQuery,
  useGetPositionsQuery,
  useGetBelbinPositionsQuery,
  useDeleteBelbinRequirimentMutation,
} from "../../app/api";

const BeblinPositionEditor = ({ position, open, onCancel }) => {
  const [selectedPositionId, setSelectedPositionId] = useState(
    position?.position_id || ""
  );
  const [requirements, setRequirements] = useState(
    position?.requirements || []
  );
  const [requirementsToDelete, setRequirementsToDelete] = useState([]);

  const { data: positions = [] } = useGetBelbinPositionsQuery();
  const { data: availableRoles = [] } = useGetBelbinRolesQuery();
  const { data: availablePositions = [] } = useGetPositionsQuery();

  const [updateBelbinPosition] = useUpdateBelbinPositionMutation();
  const [createBelbinPosition] = useCreateBelbinPositionMutation();
  const [deleteBelbinRequriminets] = useDeleteBelbinRequirimentMutation();

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error", // error, success, info, warning
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const usedPositionIds = positions.map((p) => p.position_id);
  const unusedPositions = availablePositions.filter(
    (pos) => !usedPositionIds.includes(pos.id) || pos.id === selectedPositionId
  );

  const handleAddRole = (role) => {
    if (!requirements.find((r) => r.role_id === role.id)) {
      setRequirements((prev) => [
        ...prev,
        {
          role_id: role.id,
          role_name: role.name,
          role_description: role.description,
          min_score: 0,
          is_key: false,
          position_id: selectedPositionId,
        },
      ]);
    }
  };

  const handleMarkForRemoval = (role_id) => {
    const requirement = requirements.find((r) => r.role_id === role_id);
    if (requirement) {
      if (requirement.id) {
        setRequirementsToDelete((prev) => [...prev, requirement.id]);
      }
      setRequirements((prev) => prev.filter((r) => r.role_id !== role_id));
    }
  };

  const handleScoreChange = (role_id, value) => {
    setRequirements((prev) =>
      prev.map((r) => (r.role_id === role_id ? { ...r, min_score: value } : r))
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedPositionId) {
      setSnackbar({
        open: true,
        message: "Пожалуйста, выберите должность.",
        severity: "error",
      });
      return;
    }

    try {
      if (requirementsToDelete.length > 0) {
        await Promise.all(
          requirementsToDelete.map((id) =>
            deleteBelbinRequriminets(id).unwrap()
          )
        );
      }

      const dataToSend = {
        position_id: selectedPositionId,
        requirements: requirements.map((r) => ({
          ...r,
          min_score: r.min_score ?? 0,
          position_id: selectedPositionId,
        })),
      };

      if (position.id === "new") {
        await createBelbinPosition(dataToSend).unwrap();
        setSnackbar({
          open: true,
          message: "Должность успешно создана",
          severity: "success",
        });
      } else {
        await updateBelbinPosition(dataToSend).unwrap();
        setSnackbar({
          open: true,
          message: "Должность успешно обновлена",
          severity: "success",
        });
      }

      onCancel(); // Закрыть диалог после успешного сохранения
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      setSnackbar({
        open: true,
        message:
          error?.data?.detail ||
          error?.message ||
          "Произошла ошибка при сохранении должности",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {position.id === "new"
            ? "Добавить должность"
            : "Редактировать должность"}
        </DialogTitle>

        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="position-select-label">
                Выбрать должность
              </InputLabel>
              <Select
                labelId="position-select-label"
                value={selectedPositionId}
                onChange={(e) => setSelectedPositionId(e.target.value)}
                required
                label="Выбрать должность"
              >
                {unusedPositions.map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>
                    {pos.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Добавить роль</InputLabel>
              <Select
                value=""
                onChange={(e) => {
                  const selectedRole = availableRoles.find(
                    (r) => r.name === e.target.value
                  );
                  if (selectedRole) handleAddRole(selectedRole);
                }}
                label="Добавить роль"
              >
                {availableRoles
                  .filter(
                    (role) => !requirements.find((r) => r.role_id === role.id)
                  )
                  .map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      <Box>
                        <div>{role.name}</div>
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {requirements.map((req) => (
              <Box
                key={req.role_id}
                sx={{ display: "flex", alignItems: "center", mb: 2 }}
              >
                <NumberFormatBase
                  customInput={TextField}
                  label={req.role_name}
                  value={req.min_score}
                  allowNegative={false}
                  decimalScale={0}
                  isAllowed={({ floatValue }) =>
                    floatValue === undefined || floatValue >= 0
                  }
                  onValueChange={({ floatValue }) =>
                    handleScoreChange(req.role_id, floatValue)
                  }
                  fullWidth
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleMarkForRemoval(req.role_id)}
                  sx={{ ml: 2, whiteSpace: "nowrap" }}
                >
                  Удалить
                </Button>
              </Box>
            ))}

            <DialogActions sx={{ px: 0 }}>
              <Button onClick={onCancel} color="primary">
                Отмена
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Сохранить
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default BeblinPositionEditor;
