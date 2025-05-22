import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Divider,
  Badge,
  Button,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { People as PeopleIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useGetAssignedTestsQuery } from "../../app/api";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
import { useStartTestMutation } from "../../app/api";

const statusOrder = {
  not_started: 0,
  in_progress: 1,
  completed: 2,
  expired: 3,
};
const getTestStatus = (status) => {
  if (status === "completed") return { label: "Завершён", color: "success" };
  if (status === "expired") return { label: "Истёк срок", color: "error" };
  if (status === "in_progress")
    return { label: "В процессе", color: "warning" };

  return { label: "Ожидает", color: "default" };
};
const EmployeeTestList = ({ onTestSelect, setSelectPreviewTest }) => {
  const navigate = useNavigate();
  const { data: tests = [], isLoading, isError } = useGetAssignedTestsQuery();
  const [expiredSnackbarOpen, setExpiredSnackbarOpen] = React.useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = React.useState(false);
  const [errorSnackbarMessage, setErrorSnackbarMessage] = React.useState("");

  console.log(tests);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [startTest, { isLoading: isLoadingStart }] = useStartTestMutation();
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    console.log(isError);
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        Произошла ошибка при загрузке данных. Попробуйте позже.
      </Alert>
    );
  }

  const handleStartTest = async (test_id) => {
    const test = tests.find((t) => t.id === test_id);
    const now = new Date();
    const endDate = test.end_date ? parseISO(test.end_date) : null;

    if (endDate && now > endDate && !test.completed_at) {
      setExpiredSnackbarOpen(true);
      return;
    }

    try {
      const res = await startTest(test_id).unwrap(); // используем unwrap из RTK Query
      const updatedTest = { ...test, started_at: res.started_at };
      onTestSelect(updatedTest);
    } catch (err) {
      console.error("Ошибка при запуске теста:", err);
      setErrorSnackbarMessage("Не удалось начать тест. Попробуйте позже.");
      setErrorSnackbarOpen(true);
    }
  };
  const handlePreviewTest = (test) => {
    if (test.status !== "completed") return;
    setSelectPreviewTest(test);
  };
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Мои тесты
      </Typography>

      <Paper elevation={3} sx={{ width: "100%", mt: 4 }}>
        {tests.length === 0 ? (
          <Box
            sx={{
              height: 500,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
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
            {[...tests]
              .sort((a, b) => {
                const statusA = a.status || "in_progress";
                const statusB = b.status || "in_progress";
                return statusOrder[statusA] - statusOrder[statusB];
              })
              .map((test) => {
                const createdAt = utcToZonedTime(
                  parseISO(test.created_at),
                  timeZone
                );
                const dueDate = test.end_date
                  ? utcToZonedTime(parseISO(test.end_date), timeZone)
                  : null;

                return (
                  <React.Fragment key={test.id}>
                    <ListItem button onClick={() => handlePreviewTest(test)}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="h6">{test.title}</Typography>
                              <Chip
                                size="small"
                                label={getTestStatus(test?.status).label}
                                color={getTestStatus(test?.status).color}
                              />
                              {test.assignedTo?.length > 0 && (
                                <Badge
                                  badgeContent={test.assignedTo.length}
                                  color="primary"
                                >
                                  <PeopleIcon color="action" />
                                </Badge>
                              )}
                            </Box>{" "}
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
                            Окончание:{" "}
                            {dueDate
                              ? format(dueDate, "dd-MM-yyyy HH:mm", {
                                  locale: ru,
                                  timeZone,
                                })
                              : "не указано"}
                            <br />
                            {test.time_limit_minutes && (
                              <>
                                Лимит времени: {test.time_limit_minutes} мин.
                                <br />
                              </>
                            )}
                            Вопросов:{" "}
                            {test.questions?.length +
                              test.belbin_questions?.length || 0}
                          </>
                        }
                      />
                      {(test.status === "in_progress" ||
                        test.status === "not_started") && (
                        <ListItemSecondaryAction>
                          <Button
                            variant="contained"
                            onClick={() => handleStartTest(test.id)}
                            disabled={isLoadingStart}
                            startIcon={
                              isLoadingStart && (
                                <CircularProgress size={20} color="inherit" />
                              )
                            }
                          >
                            {isLoading ? "Загрузка..." : "Пройти"}
                          </Button>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
          </List>
        )}
      </Paper>
      <Snackbar
        open={expiredSnackbarOpen}
        autoHideDuration={4000}
        onClose={() => setExpiredSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setExpiredSnackbarOpen(false)}
          severity="warning"
          variant="filled"
        >
          Вы не можете пройти тест — срок его выполнения уже истёк.
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={4000}
        onClose={() => setErrorSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorSnackbarOpen(false)}
          severity="error"
          variant="filled"
        >
          {errorSnackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeTestList;
