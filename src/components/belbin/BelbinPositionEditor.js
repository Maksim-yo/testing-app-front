import React, { useEffect, useState } from "react";
import { NumberFormatBase } from "react-number-format";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  useUpdateBelbinPositionMutation,
  useCreateBelbinPositionMutation,
  useGetBelbinRolesQuery,
  useGetPositionsQuery,
  useGetBelbinPositionsQuery,
  useDeleteBelbinRequirimentMutation,
} from "../../app/api";

const BeblinPositionEditor = ({ position, onCancel }) => {
  const [selectedPositionId, setSelectedPositionId] = useState(
    position?.position_id || ""
  );
  const [requirements, setRequirements] = useState(
    position?.requirements || []
  );
  const [requirementsToDelete, setRequirementsToDelete] = useState([]);

  const { data: positions = [] } = useGetBelbinPositionsQuery();

  const simplifiedPositions = positions.map((p) => ({
    position_id: p.position_id,
    position_title: p.position_title,
  }));

  const { data: availableRoles = [], isLoading: isLoadingRoles } =
    useGetBelbinRolesQuery();
  const { data: availablePositions = [], isLoading: isLoadingPositions } =
    useGetPositionsQuery();
  const [updateBelbinPosition] = useUpdateBelbinPositionMutation();
  const [createBelbinPosition] = useCreateBelbinPositionMutation();
  const [deleteBelbinRequriminets] = useDeleteBelbinRequirimentMutation();
  const selectedPosition = availablePositions.find(
    (p) => p.id === selectedPositionId
  );

  const usedPositionIds = positions.map((p) => p.position_id);
  const unusedPositions = availablePositions.filter(
    (pos) => !usedPositionIds.includes(pos.id) || pos.id === selectedPositionId
  );

  const handleAddRole = (role) => {
    if (!requirements.find((r) => r.role_id === role.id)) {
      setRequirements([
        ...requirements,
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
      // Если у требования есть id (значит оно уже существует в базе), добавляем в список на удаление
      if (requirement.id) {
        setRequirementsToDelete([...requirementsToDelete, requirement.id]);
      }
      // Удаляем из текущего списка требований
      setRequirements(requirements.filter((r) => r.role_id !== role_id));
    }
  };

  const handleScoreChange = (role_id, value) => {
    setRequirements((prev) =>
      prev.map((r) => (r.role_id === role_id ? { ...r, min_score: value } : r))
    );
  };

  const handleSubmit = async () => {
    try {
      // Сначала удаляем помеченные требования
      if (requirementsToDelete.length > 0) {
        await Promise.all(
          requirementsToDelete.map((id) =>
            deleteBelbinRequriminets(id).unwrap()
          )
        );
      }
      console.log(selectedPositionId);
      console.log(requirements);

      // Затем сохраняем/обновляем остальные требования
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
      } else {
        await updateBelbinPosition(dataToSend).unwrap();
      }

      onCancel();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      // Здесь можно добавить обработку ошибки, например, показать уведомление пользователю
    }
  };

  return (
    <Box component="form" sx={{ p: 3 }}>
      <Typography variant="h6">
        {position.id === "new"
          ? "Добавить должность"
          : "Редактировать должность"}
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="position-select-label">Выбрать должность</InputLabel>
        <Select
          labelId="position-select-label"
          value={selectedPositionId}
          onChange={(e) => setSelectedPositionId(e.target.value)}
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
        >
          {availableRoles
            .filter((role) => !requirements.find((r) => r.role_id === role.id))
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
              floatValue === undefined || (floatValue >= 0 && floatValue <= 10)
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
            sx={{ ml: 2 }}
          >
            Удалить
          </Button>
        </Box>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Отмена
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Сохранить
        </Button>
      </Box>
    </Box>
  );
};

export default BeblinPositionEditor;
