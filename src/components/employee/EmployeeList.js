import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { Add, Edit, Delete, Key } from "@mui/icons-material";
import EmployeeForm from "./EmployeeForm";
import { generateAccountAsync } from "../../slices/employeeThunk";
import AccountDetailsModal from "../AccountDetailsModal";
import SettingsIcon from "@mui/icons-material/Settings";
import { EmployeeSettings } from "./EmployeeSettings";
import { useDeleteEmployeeMutation } from "../../app/api";
const EmployeesList = ({
  employees,
  positions,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
}) => {
  const dispatch = useDispatch();

  const [openForm, setOpenForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [employeeSettingsOpen, setEmployeeSettingsOpen] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [employeeSettings, setEmployeeSettings] = useState({
    mode: "manual",
  });
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

  const handleGenerateAccount = async (employeeId) => {
    try {
      const resultAction = await dispatch(generateAccountAsync(employeeId));

      if (generateAccountAsync.fulfilled.match(resultAction)) {
        const account = resultAction.payload;
        const employee = employees.find((e) => e.id === employeeId);
        setSelectedAccount({ account, employee });
        setAccountModalOpen(true);
      }
    } catch (error) {
      console.error("Ошибка при генерации аккаунта:", error);
    }
  };
  const handleEmployeeSettings = (selectedMode) => {
    setEmployeeSettings({ ...employeeSettings, mode: selectedMode });
  };
  const handleOpenForm = (employee = null) => {
    setEditingEmployee(employee);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingEmployee(null);
  };

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
  const showSnackbar = (message) => {
    setSnackbar({
      open: true,
      message: message,
    });
  };

  const handleDelete = async () => {
    await deleteEmployee(deleteEmployeeId);
    setOpenDeleteDialog(false);
  };
  const handleDeleteDialog = (clerk_id) => {
    // TODO: здесь вызывается API для удаления аккаунта
    setDeleteEmployeeId(clerk_id);
    setOpenDeleteDialog(true);
  };
  return (
    <Box>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <EmployeeSettings
        open={employeeSettingsOpen}
        setOpen={setEmployeeSettingsOpen}
        onConfirm={handleEmployeeSettings}
      />
      <AccountDetailsModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        account={selectedAccount?.account}
        employee={selectedAccount?.employee}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Список сотрудников</Typography>
        <Box>
          <IconButton onClick={() => setEmployeeSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenForm()}
          >
            Добавить сотрудника
          </Button>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          height: 500,
          overflowY: "auto",
          position: "relative",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Фото</TableCell>
              <TableCell>ФИО</TableCell>
              <TableCell>Должность</TableCell>
              <TableCell>Почта</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Аккаунт</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length > 0 ? (
              employees.map((employee) => {
                const is_created = employee?.clerk_id?.startsWith("user_")
                  ? true
                  : false;

                const position = positions.find(
                  (p) => p.id === employee.position_id
                );
                const photoUrl = getPhotoUrl(employee.photo);

                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Avatar src={photoUrl} sx={{ width: 56, height: 56 }} />
                    </TableCell>
                    <TableCell>
                      {employee.last_name} {employee.first_name}{" "}
                      {employee.middle_name}
                    </TableCell>
                    <TableCell>{position?.title || "-"}</TableCell>
                    <TableCell>{employee?.email || "-"}</TableCell>
                    <TableCell>{employee.phone || "-"}</TableCell>
                    <TableCell>
                      {is_created ? (
                        <Chip
                          label="Аккаунт создан"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="Аккаунт не подтвержден"
                          color="warning"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {is_created && (
                        <IconButton onClick={() => handleOpenForm(employee)}>
                          <Edit color="primary" />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={() => handleDeleteDialog(employee.clerk_id)}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <></>
            )}
          </TableBody>
        </Table>

        {employees.length === 0 && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "text.disabled",
                fontStyle: "italic",
              }}
            >
              Сотрудники не найдены
            </Typography>
          </Box>
        )}
      </TableContainer>

      <EmployeeForm
        open={openForm}
        onClose={handleCloseForm}
        initialData={editingEmployee}
        positions={positions}
        settings={employeeSettings}
        showSnackbar={showSnackbar}
      />
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Удаление аккаунта</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить аккаунт? Это действие необратимо.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Отмена</Button>
          <Button
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
            startIcon={
              isDeleting ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesList;
