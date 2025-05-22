import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
  TextField,
  Avatar,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

const AssignDialog = ({
  open,
  onClose,
  onAssign,
  onRemove, // <- ДОБАВЛЕНО: метод, вызываемый при снятии
  test,
  employees,
  positions,
  selectedEmployees,
  setSelectedEmployees,
  isLoadingAssignments,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const initialAssignedIdsRef = useRef([]);
  const getPhotoUrl = (photo) => {
    if (!photo) return null;

    if (typeof photo === "string") {
      if (photo.startsWith("data:image")) {
        return photo;
      }
      return `data:image/jpeg;base64,${photo}`;
    }

    if (photo instanceof File) {
      return URL.createObjectURL(photo); // Если это File объект
    }

    return null;
  };
  // При открытии сохраняем начальные ID назначенных сотрудников
  useEffect(() => {
    if (open && test?.assigned_to) {
      const assignedIds = test.assigned_to.map((emp) => emp.id);
      initialAssignedIdsRef.current = assignedIds;
      setSelectedEmployees(assignedIds);
    }
  }, [open, test, setSelectedEmployees]);

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter((id) => id !== employeeId)
        : [...prevSelected, employeeId]
    );
  };

  const handleAssignClick = () => {
    const initialAssignedIds = initialAssignedIdsRef.current;
    const removedEmployees = initialAssignedIds.filter(
      (id) => !selectedEmployees.includes(id)
    );

    if (removedEmployees.length > 0) {
      setConfirmDialogOpen(true);
    } else {
      onAssign(selectedEmployees);
    }
  };

  const handleConfirmAssign = () => {
    const initialAssignedIds = initialAssignedIdsRef.current;

    // Удалённые: были назначены, но теперь не выбраны
    const removedEmployees = initialAssignedIds.filter(
      (id) => !selectedEmployees.includes(id)
    );

    // Новые: выбраны, но не были назначены ранее
    const newlyAssignedEmployees = selectedEmployees.filter(
      (id) => !initialAssignedIds.includes(id)
    );

    setConfirmDialogOpen(false);
    if (removedEmployees.length === 0 && newlyAssignedEmployees.length === 0) {
      onClose();
      return;
    }
    // Выполняем нужные действия
    if (removedEmployees.length > 0) {
      onRemove(removedEmployees);
    }

    if (newlyAssignedEmployees.length > 0) {
      onAssign(newlyAssignedEmployees);
    }
  };

  const handleCancelRemove = () => {
    setConfirmDialogOpen(false);
  };

  if (!employees || !open) return null;

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.last_name} ${employee.first_name} ${
      employee.middle_name || ""
    }`.toLowerCase();
    const email = (employee.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Назначение теста: {test?.title}</DialogTitle>
        <DialogContent sx={{ maxHeight: "60vh", overflowY: "auto" }}>
          <TextField
            fullWidth
            label="Поиск сотрудника (ФИО или email)"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />

          {filteredEmployees.length === 0 ? (
            <Box
              sx={{
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="body1">Сотрудники не найдены</Typography>
            </Box>
          ) : (
            <Box sx={{ height: "300px", overflowY: "auto" }}>
              <List>
                {filteredEmployees.map((employee) => {
                  const position = positions.find(
                    (p) => p.id === employee.position_id
                  );
                  const fullName = `${employee.last_name || ""} ${
                    employee.first_name || ""
                  } ${employee.middle_name || ""}`;
                  const is_ready = employee.clerk_id?.startsWith("user_");
                  if (!is_ready) return null;

                  const isSelected = selectedEmployees.includes(employee.id);

                  return (
                    <ListItem
                      key={employee.id}
                      button
                      onClick={() => handleEmployeeSelect(employee.id)}
                      selected={isSelected}
                    >
                      <Avatar
                        src={getPhotoUrl(employee?.photo)}
                        alt={fullName}
                        sx={{ mr: 2 }}
                      />
                      <ListItemText
                        primary={
                          <Box>
                            <Typography>{fullName}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {employee?.email}
                            </Typography>
                          </Box>
                        }
                        secondary={position ? position.title : "Без должности"}
                      />
                      <Checkbox
                        edge="end"
                        checked={isSelected}
                        // onChange={() => handleEmployeeSelect(employee.id)}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            onClick={handleAssignClick}
            variant="contained"
            disabled={isLoadingAssignments}
            startIcon={
              isLoadingAssignments ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isLoadingAssignments ? "Назначение..." : "Назначить"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения снятия сотрудников */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelRemove}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Подтвердите действие</DialogTitle>
        <DialogContent>
          <Typography>
            Вы сняли одного или нескольких сотрудников, ранее назначенных на
            тест. Это может отменить их прогресс. Продолжить?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove}>Отмена</Button>
          <Button
            onClick={handleConfirmAssign}
            variant="contained"
            color="error"
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssignDialog;
