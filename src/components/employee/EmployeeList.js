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
import {
  useDeleteEmployeeMutation,
  useCreateClerkEmployeesMutation,
} from "../../app/api";
import GenerateAccountsDialog from "./GenerateAccountsDialog";
import GenerateAccountsResultDialog from "./GenerateAccountsResultDialog";
import DeleteEmployeeDialog from "./DeleteEmployeeDialog";

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
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [generatedAccounts, setGeneratedAccounts] = useState([]);
  const [createClerkEmployees, { isLoading: isGenerating }] =
    useCreateClerkEmployeesMutation();
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

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
  const handleGenerate = async (data) => {
    try {
      const result = await createClerkEmployees({ employees: data }).unwrap();

      // Обработка частичных ошибок
      if (result.errors.length > 0) {
        const allErrors = result.errors
          .map((err) => {
            const user = data[err.index];
            return `${user.last_name} ${user.first_name}: ${err.error}`;
          })
          .join("\n");

        setSnackbar({
          open: true,
          message: `Некоторые аккаунты не были созданы:\n${allErrors}`,
        });
      }

      if (result.results.length > 0) {
        console.log(result);
        setGeneratedAccounts(result.results);
        setOpenResultDialog(true);
      }
    } catch (err) {
      console.error("Ошибка создания аккаунтов:", err);

      let message = "Ошибка при создании аккаунтов";

      if (err?.data?.detail) {
        const detail = err.data.detail;

        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((e) => e.msg).join(", ");
        } else if (typeof detail === "object") {
          message = JSON.stringify(detail);
        }
      }

      setSnackbar({
        open: true,
        message,
      });
    }
  };

  const handleDelete = async () => {
    console.log(deleteEmployeeId);
    if (!deleteEmployeeId) return;
    await deleteEmployee(deleteEmployeeId);
    setOpenDeleteDialog(false);
  };
  const handleDeleteDialog = (employee_id) => {
    // TODO: здесь вызывается API для удаления аккаунта
    setDeleteEmployeeId(employee_id);
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
          {/* <IconButton onClick={() => setEmployeeSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton> */}
          <Button
            variant="outlined"
            startIcon={<Key />}
            sx={{ mr: 2, ml: 2 }}
            onClick={() => setOpenGenerateDialog(true)}
          >
            Сгенерировать аккаунты
          </Button>
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
                const is_inv = employee?.clerk_id?.startsWith("inv_")
                  ? true
                  : false;
                const is_clerk = employee?.clerk_id ? true : false;
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
                    <TableCell>
                      {is_created && (
                        <Chip
                          label="Аккаунт создан"
                          color="success"
                          size="small"
                        />
                      )}
                      {is_inv && (
                        <Chip
                          label="Аккаунт не подтвержден"
                          color="warning"
                          size="small"
                        />
                      )}
                      {!is_clerk && (
                        <Chip
                          label="Аккаунт не создан"
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
                        onClick={() => handleDeleteDialog(employee.id)}
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
      <GenerateAccountsDialog
        open={openGenerateDialog}
        onClose={() => setOpenGenerateDialog(false)}
        employees={employees}
        onGenerate={handleGenerate}
        positions={positions}
        isGenerating={isGenerating} // передаём загрузку
      />

      {/* Диалог показа результатов */}
      <GenerateAccountsResultDialog
        open={openResultDialog}
        onClose={() => setOpenResultDialog(false)}
        results={generatedAccounts}
      />

      {/* Диалог удаления сотрудника */}
      <DeleteEmployeeDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
      <EmployeeForm
        open={openForm}
        onClose={handleCloseForm}
        initialData={editingEmployee}
        positions={positions}
        settings={employeeSettings}
        showSnackbar={showSnackbar}
      />
    </Box>
  );
};

export default EmployeesList;
