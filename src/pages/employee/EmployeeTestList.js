import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetAssignedTestsQuery } from "../../app/api"; // предполагается, что у тебя есть такой endpoint
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const EmployeeTestList = () => {
  const navigate = useNavigate();
  const { data: tests = [], isLoading } = useGetAssignedTestsQuery();
  //   const userId = useSelector((state) => state.auth.user?.id);

  if (isLoading) {
    return <Typography>Загрузка тестов...</Typography>;
  }

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Мои тесты
      </Typography>

      <Paper
        elevation={3}
        sx={{
          height: 800, // ограниченная высота
          overflowY: "auto",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        {tests.length === 0 ? (
          <Typography
            color="text.secondary"
            align="center"
            variant="h3"
            sx={{
              color: "#9e9e9e",
              textAlign: "center",
            }}
          >
            Тесты не найдены
          </Typography>
        ) : (
          <List>
            {tests.map((test) => {
              // const isCompleted = test.completedBy?.includes(userId);
              // const completedAt = test.results?.find(
              //   (r) => r.userId === userId
              // )?.completedAt;

              return (
                <React.Fragment key={test.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="h6">{test.title}</Typography>
                      }
                      secondary={
                        <>
                          {test.description}
                          <br />
                          Назначен до:{" "}
                          {test.dueDate
                            ? format(new Date(test.dueDate), "dd MMM yyyy", {
                                locale: ru,
                              })
                            : "не указано"}
                          {/* {isCompleted && completedAt && (
                          <>
                            <br />
                            Пройден:{" "}
                            {format(new Date(completedAt), "dd MMM yyyy", {
                              locale: ru,
                            })}
                          </>
                        )} */}
                        </>
                      }
                    />
                    <Box sx={{ ml: 2 }}>
                      {/* {isCompleted ? (
                      <Chip label="Пройден" color="success" />
                    ) : ( */}
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/tests/pass/${test.id}`)}
                      >
                        Пройти
                      </Button>
                      {/* )} */}
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeTestList;
