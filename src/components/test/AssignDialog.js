import React, { useState } from "react";
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
} from "@mui/material";
import { useGetPositionsQuery } from "../../app/api";
const AssignDialog = ({
  open,
  onClose,
  onAssign,
  test,
  employees,
  positions,
  selectedEmployees,
  setSelectedEmployees,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter((id) => id !== employeeId)
        : [...prevSelected, employeeId]
    );
  };

  if (!employees || !open) return null;

  const filteredEmployees = employees
    .filter((employee) => !!employee.email) // Показываем только с email
    .filter((employee) => {
      const fullName =
        `${employee.last_name} ${employee.first_name} ${employee.middle_name}`.toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  return (
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

        <Box sx={{ height: "300px", overflowY: "auto" }}>
          <List>
            {filteredEmployees.map((employee) => {
              const position = positions.find(
                (p) => p.id === employee.position_id
              );
              const fullName = `${employee.last_name || ""} ${
                employee.first_name || ""
              } ${employee.middle_name || " "}`;
              return (
                <ListItem
                  key={employee.id}
                  button
                  onClick={() => handleEmployeeSelect(employee.id)}
                  selected={selectedEmployees.includes(employee.id)}
                >
                  <Avatar src={employee.photo} alt={fullName} sx={{ mr: 2 }} />
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
                    checked={selectedEmployees.includes(employee.id)}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onAssign} variant="contained">
          Назначить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignDialog;
