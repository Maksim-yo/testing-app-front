import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import TestPreview from "./TestPreview";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Для стрелки
import { useGetTestResultsQuery } from "../../app/api";
import UserResultsPage from "./UserResultsPage";

const sampleResults = [
  {
    id: 25,
    test_id: 22,
    employee_id: 49,
    is_completed: true,
    completed_at: "2025-05-20T10:34:28.909807Z",
    started_at: "2025-05-20T10:24:20.720986",
    score: 6,
    max_score: 7,
    percent: 85.71428571428571,
    employee: {
      last_name: "Иван",
      first_name: "Васильев534",
      middle_name: null,
      birth_date: null,
      phone: "+7 (000) 000-00-00",
      email: "lyzlov026@gmail.com",
      position_id: 8,
      hire_date: null,
      is_admin: false,
      clerk_id: "user_2xAuBSxuPZTPpGzxitKojJQfGRJ",
      id: 49,
      photo_url: null,
      belbin_results: [],
    },
  },
  {
    id: 25,
    test_id: 22,
    employee_id: 49,
    is_completed: true,
    completed_at: "2025-05-20T10:34:28.909807Z",
    started_at: "2025-05-20T10:24:20.720986",
    score: 6,
    max_score: 7,
    percent: 85.71428571428571,
    employee: {
      last_name: "Иван",
      first_name: "Васильев534",
      middle_name: null,
      birth_date: null,
      phone: "+7 (000) 000-00-00",
      email: "lyzlov026@gmail.com",
      position_id: 8,
      hire_date: null,
      is_admin: false,
      clerk_id: "user_2xAuBSxuPZTPpGzxitKojJQfGRJ",
      id: 49,
      photo_url: null,
      belbin_results: [],
    },
  },
  {
    id: 25,
    test_id: 22,
    employee_id: 49,
    is_completed: true,
    completed_at: "2025-05-20T10:34:28.909807Z",
    started_at: "2025-05-20T10:24:20.720986",
    score: 6,
    max_score: 7,
    percent: 85.71428571428571,
    employee: {
      last_name: "Иван",
      first_name: "Васильев534",
      middle_name: null,
      birth_date: null,
      phone: "+7 (000) 000-00-00",
      email: "lyzlov026@gmail.com",
      position_id: 8,
      hire_date: null,
      is_admin: false,
      clerk_id: "user_2xAuBSxuPZTPpGzxitKojJQfGRJ",
      id: 49,
      photo_url: null,
      belbin_results: [],
    },
  },
  {
    id: 25,
    test_id: 22,
    employee_id: 49,
    is_completed: true,
    completed_at: "2025-05-20T10:34:28.909807Z",
    started_at: "2025-05-20T10:24:20.720986",
    score: 6,
    max_score: 7,
    percent: 85.71428571428571,
    employee: {
      last_name: "Иван",
      first_name: "Васильев534",
      middle_name: null,
      birth_date: null,
      phone: "+7 (000) 000-00-00",
      email: "lyzlov026@gmail.com",
      position_id: 8,
      hire_date: null,
      is_admin: false,
      clerk_id: "user_2xAuBSxuPZTPpGzxitKojJQfGRJ",
      id: 49,
      photo_url: null,
      belbin_results: [],
    },
  },
  {
    id: 25,
    test_id: 22,
    employee_id: 49,
    is_completed: true,
    completed_at: "2025-05-20T10:34:28.909807Z",
    started_at: "2025-05-20T10:24:20.720986",
    score: 6,
    max_score: 7,
    percent: 85.71428571428571,
    employee: {
      last_name: "Иван",
      first_name: "Васильев534",
      middle_name: null,
      birth_date: null,
      phone: "+7 (000) 000-00-00",
      email: "lyzlov026@gmail.com",
      position_id: 8,
      hire_date: null,
      is_admin: false,
      clerk_id: "user_2xAuBSxuPZTPpGzxitKojJQfGRJ",
      id: 49,
      photo_url: null,
      belbin_results: [],
    },
  },
  {
    id: 25,
    test_id: 22,
    employee_id: 49,
    is_completed: true,
    completed_at: "2025-05-20T10:34:28.909807Z",
    started_at: "2025-05-20T10:24:20.720986",
    score: 6,
    max_score: 7,
    percent: 85.71428571428571,
    employee: {
      last_name: "Иван",
      first_name: "Васильев534",
      middle_name: null,
      birth_date: null,
      phone: "+7 (000) 000-00-00",
      email: "lyzlov026@gmail.com",
      position_id: 8,
      hire_date: null,
      is_admin: false,
      clerk_id: "user_2xAuBSxuPZTPpGzxitKojJQfGRJ",
      id: 49,
      photo_url: null,
      belbin_results: [],
    },
  },
];

const TestStatsPage = ({ test }) => {
  console.log(test);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { data: testResults = [], isLoading: isTestResultsLoading } =
    useGetTestResultsQuery(test.id);
  const users = [
    {
      last_name: "Иван",
      first_name: "Васильев534",
      id: 49,
    },
  ];
  const handleTogglePreview = () => {
    setIsPreviewOpen((prev) => !prev); // Переключаем видимость
  };
  const userMap = React.useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  return (
    <Box>
      <Box sx={{}}>
        <Typography variant="h4" gutterBottom>
          Статистика по тесту: {test.title}
        </Typography>
        <Typography>
          Всего вопросов:{" "}
          {test?.questions?.length + test?.belbin_questions?.length}
        </Typography>
        <Typography sx={{}}>
          Кол-во назначений: {test.assigned_to?.length}
        </Typography>
        <UserResultsPage
          results={testResults}
          isLoading={isTestResultsLoading}
        />

        <Box sx={{}}>
          <Button
            variant=""
            onClick={handleTogglePreview}
            sx={{
              width: "100%", // Занимает всю ширину
              boxShadow: 3, // Добавляем тень для эффекта кнопки
              textAlign: "left", // Текст будет выровнен по левому краю
              padding: "12px", // Увеличиваем отступы, чтобы кнопка была удобнее
              display: "flex",
              justifyContent: "space-between", // Располагаем текст и стрелку
              alignItems: "center", // Центрируем элементы по вертикали
            }}
          >
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Предпросмотр теста
            </Typography>
            <IconButton>
              <ExpandMoreIcon />
            </IconButton>
          </Button>
        </Box>
        {/* Секция предпросмотра с ограничением по размеру и прокруткой */}
        {isPreviewOpen && (
          <Box
            sx={{
              maxHeight: "500px", // Ограничиваем высоту
              overflowY: "auto", // Добавляем прокрутку
              transition: "max-height 0.3s ease-in-out", // Плавное изменение
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 2,
            }}
          >
            <TestPreview test={test} />
          </Box>
        )}
        {/* <Box sx={{ height: 200 }} />  */}
      </Box>

      {/* Кнопка для предпросмотра теста с тенью, которая срабатывает на всю ширину */}
    </Box>
  );
};

export default TestStatsPage;
