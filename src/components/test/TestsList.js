import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Avatar,
  Badge,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  addTest,
  updateTest,
  assignTest,
  deleteTest,
} from "../../slices/testSlice";
import { useSelector, useDispatch } from "react-redux";
import TestStatus from "./TestStatus";
import AssignDialog from "./AssignDialog";
import {
  useGetTestsQuery,
  useGetPositionsQuery,
  useGetEmployeesQuery,
  useDeleteTestMutation,
  useSetAssignmentsToTestMutation,
  useDeleteAssignmentMutation,
} from "../../app/api";
import { ru } from "date-fns/locale"; // Правильный импорт русской локали
import { utcToZonedTime, format } from "date-fns-tz";
import { useUpdateTestStatusMutation } from "../../app/api";

const getTestStatus = (status) => {
  // if (status === "completed") return { label: "Завершён", color: "success" };
  if (status === "expired") return { label: "Истёк срок", color: "error" };
  if (status === "draft") return { label: "Неактивен", color: "default" };

  // if (status === "in_progress")
  //   return { label: "В процессе", color: "warning" };

  return { label: "Активен", color: "success" };
};
export const TestList = ({ onCreate, onEdit, onPreview, onClick }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testToDelete, setTestToDelete] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [updateTestStatus] = useUpdateTestStatusMutation();
  const [deleteTest] = useDeleteTestMutation();
  const navigate = useNavigate();
  const {
    data: data_tests = [],
    isLoading: isLoadingTests,
    error: errorTests,
  } = useGetTestsQuery();

  const statusOrder = {
    not_started: 0,
    active: 1,
    draft: 2,
    expired: 3,
  };
  const tests = [...data_tests].sort((a, b) => {
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const [deleteAssignment, { isLoading: isLoadingAssignmentsDelete }] =
    useDeleteAssignmentMutation();
  const [setAssignmentsToTest, { isLoading: isLoadingAssignmentsCreate }] =
    useSetAssignmentsToTestMutation();
  const isLoadingAssignments =
    isLoadingAssignmentsDelete || isLoadingAssignmentsCreate;
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

  const isLoading = isLoadingTests || isLoadingPositions || isLoadingEmployees;
  const dispatch = useDispatch();
  // Функции для управления тестами
  const handleEditTest = (id) => {
    navigate(`/tests/edit/${id}`);
  };

  const handleViewTest = (test) => {
    onPreview(test);
  };

  const handleChangeStatus = async (test_id, status) => {
    await updateTestStatus({ testId: test_id, status });
  };

  const confirmDelete = (id) => {
    setTestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAssignments = async () => {
    await deleteAssignment;
  };

  const handleDeleteTest = async () => {
    if (testToDelete) {
      // dispatch(deleteTest(testToDelete));
      await deleteTest(testToDelete);
      setDeleteDialogOpen(false);
      setTestToDelete(null);
    }
  };

  const handleRemoveAssignments = async (removedIds) => {
    const data = removedIds.map((id) => ({
      test_id: selectedTest.id,
      employee_id: id,
    }));
    await deleteAssignment(data);
    setAssignDialogOpen(false);
  };

  const openAssignDialog = (test) => {
    setSelectedTest(test);
    setSelectedEmployees(test.assignedTo || []);
    setAssignDialogOpen(true);
  };

  const handleAssignTest = async () => {
    const data = selectedEmployees.map((id) => ({
      test_id: selectedTest.id,
      employee_id: id,
    }));
    await setAssignmentsToTest(data);

    setAssignDialogOpen(false);
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees((prevSelected) => {
      if (prevSelected.includes(employeeId)) {
        return prevSelected.filter((id) => id !== employeeId); // Убираем из выбранных
      } else {
        return [...prevSelected, employeeId]; // Добавляем в выбранные
      }
    });
  };
  const utcDate = "2025-05-09T12:04:39.425061";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const zonedDate = utcToZonedTime(utcDate, timeZone);

  // Явное форматирование в локальное время
  const localTimeString = format(zonedDate, "dd-MM-yyyy HH:mm:ssXXX", {
    timeZone,
    locale: ru,
  });
  if (errorTests) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        Произошла ошибка при загрузке данных. Попробуйте позже.
      </Alert>
    );
  }
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Управление тестами
      </Typography>

      <Button variant="contained" sx={{ mb: 3 }} onClick={onCreate}>
        Создать новый тест
      </Button>

      <Paper
        elevation={3}
        sx={{
          width: "100%",
        }}
      >
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
        ) : tests.length === 0 ? (
          <Box
            sx={{
              height: 500,
              display: "flex",
              justifyContent: "center", // горизонтальное выравнивание
              alignItems: "center", // вертикальное выравнивание
            }}
          >
            <Typography
              color="text.secondary"
              align="center"
              variant="h6"
              sx={{
                color: "text.disabled",
                fontStyle: "italic",
              }}
            >
              Тесты не найдены
            </Typography>
          </Box>
        ) : (
          <List>
            {tests.map((test) => {
              const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

              const created_at = utcToZonedTime(test.created_at, timeZone);
              const updated_at = utcToZonedTime(test.updated_at, timeZone);
              const end_at = utcToZonedTime(test.end_date, timeZone);
              return (
                <React.Fragment key={test.id}>
                  <ListItem button onClick={() => onClick(test)}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="h6">{test.title}</Typography>
                          <Chip
                            size="small"
                            label={getTestStatus(test?.status).label}
                            color={getTestStatus(test?.status).color}
                          />{" "}
                          {test.assignedTo?.length > 0 && (
                            <Badge
                              badgeContent={test.assignedTo.length}
                              color="primary"
                              sx={{ ml: 2 }}
                            >
                              <PeopleIcon color="action" />
                            </Badge>
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {test.description}
                          </Typography>
                          <br />
                          Создан:{" "}
                          {format(created_at, "dd-MM-yyyy HH:mm", {
                            timeZone,
                            locale: ru,
                          })}{" "}
                          {/* | Обновлен:{" "}
                          {format(updated_at, "dd-MM-yyyy HH:mm", {
                            timeZone,
                            locale: ru,
                          })}{" "} */}
                          | Окончание:
                          {format(end_at, "dd-MM-yyyy HH:mm", {
                            timeZone,
                            locale: ru,
                          })}
                          <br />
                          Вопросов:
                          {test.questions.length + test.belbin_questions.length}
                          {test.dueDate && (
                            <>
                              <br />
                              Срок: {test.dueDate}
                            </>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      {test.status !== "expired" && (
                        <TestStatus
                          onChange={(status) =>
                            handleChangeStatus(test.id, status)
                          }
                          status={test.status}
                        />
                      )}
                      <IconButton onClick={() => handleViewTest(test)}>
                        <VisibilityIcon color="info" />
                      </IconButton>

                      <IconButton onClick={() => onEdit(test)}>
                        <EditIcon color="primary" />
                      </IconButton>

                      <IconButton onClick={() => confirmDelete(test.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>

                      <IconButton onClick={() => openAssignDialog(test)}>
                        <AssignmentIcon color="action" />
                      </IconButton>

                      {/* <Box sx={{ ml: 2, display: "flex" }}>
                    <IconButton
                      onClick={() => handleChangeStatus(test.id, "active")}
                      disabled={test.status === "active"}
                    >
                      <CheckIcon
                        color={
                          test.status === "active" ? "success" : "disabled"
                        }
                      />
                    </IconButton>
                    <IconButton
                      onClick={() => handleChangeStatus(test.id, "archived")}
                      disabled={test.status === "archived"}
                    >
                      <CloseIcon
                        color={
                          test.status === "archived" ? "error" : "disabled"
                        }
                      />
                    </IconButton>
                  </Box> */}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Диалог назначения теста */}
      <AssignDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        test={selectedTest}
        employees={employees}
        positions={positions}
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
        onAssign={handleAssignTest}
        isLoadingAssignments={isLoadingAssignments}
        onRemove={handleRemoveAssignments}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить этот тест? Это действие нельзя
          отменить.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteTest} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestList;
