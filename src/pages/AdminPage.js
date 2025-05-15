import React, { useState, useEffect } from "react";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
  Alert, // Импортируем компонент для отображения ошибок
} from "@mui/material";
import PositionsList from "../components/employee/PositionList";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ruLocale from "date-fns/locale/ru";
import EmployeesList from "../components/employee/EmployeeList";
import { useDispatch, useSelector } from "react-redux";
import {
  addPosition,
  editPosition,
  deletePosition,
} from "../slices/positionSlice";
import {
  addEmployee,
  editEmployee,
  deleteEmployee,
} from "../slices/employeeSlice";
import { useGetPositionsQuery, useGetEmployeesQuery } from "../app/api";

const AdminPage = () => {
  const dispatch = useDispatch();

  // Запросы для positions и employees
  const {
    data: positions = [],
    isLoading: isLoadingPositions,
    error: errorPositions,
  } = useGetPositionsQuery();
  const {
    data: employees = [],
    isLoading: isLoadingEmployees,
    error: errorEmployees,
  } = useGetEmployeesQuery();

  console.log(positions);
  // Общий статус загрузки и ошибки
  const isLoading = isLoadingPositions || isLoadingEmployees;
  const error = errorPositions || errorEmployees;

  const handleAddPosition = (position) => {
    dispatch(addPosition(position));
  };

  const handleEditPosition = (updatedPosition) => {
    dispatch(editPosition(updatedPosition));
  };

  const handleDeletePosition = (id) => {
    dispatch(deletePosition(id));
  };

  const handleAddEmployee = (employee) => {
    dispatch(addEmployee(employee));
  };

  const handleEditEmployee = (updatedEmployee) => {
    dispatch(editEmployee(updatedEmployee));
  };

  const handleDeleteEmployee = (id) => {
    dispatch(deleteEmployee(id));
  };

  useEffect(() => {
    if (error) {
      console.error("Error loading data:", error);
    }
  }, [error]);

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">HR Система</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Обработчик ошибки */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            Произошла ошибка при загрузке данных. Попробуйте позже.
          </Alert>
        )}

        {/* Основной контент */}
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <PositionsList
                positions={positions}
                onAddPosition={handleAddPosition}
                onEditPosition={handleEditPosition}
                onDeletePosition={handleDeletePosition}
              />
            </Box>

            <Box>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ruLocale}
              >
                <EmployeesList
                  employees={employees}
                  positions={positions}
                  onAddEmployee={handleAddEmployee}
                  onEditEmployee={handleEditEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                />
              </LocalizationProvider>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default AdminPage;
