import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Collapse,
  Button,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

import { useGetTestResultsQuery } from "../../app/api";

// Функция для форматирования времени прохождения теста
function formatTimeSpent(startedAt, completedAt) {
  if (!startedAt || !completedAt) return "Н/Д";

  // Приводим обе даты к формату с Z, если его нет
  const normalize = (dateStr) =>
    dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`;

  const start = new Date(normalize(startedAt));
  const end = new Date(normalize(completedAt));

  const diff = (end - start) / 1000; // разница в секундах

  const minutes = Math.floor(diff / 60);
  const seconds = Math.floor(diff % 60);

  return `${minutes} мин ${seconds} с`;
}
// Функция для форматирования даты
function formatDate(dateString) {
  if (!dateString) return "Н/Д";

  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU");
}
const sampleResults = [
  {
    id: 1,
    name: "Иван Иванов",
    email: "ivan@example.com",
    position: "Менеджер проектов",
    regularScore: 85,
    belbinRoles: [
      { role: "Реализатор", score: 7 },
      { role: "Координатор", score: 5 },
      { role: "Мотиватор", score: 6 },
    ],
    positionBelbinRoles: [
      { role: "Реализатор", recommended: 8 },
      { role: "Координатор", recommended: 6 },
      { role: "Мотиватор", recommended: 7 },
      { role: "Аналитик", recommended: 5 },
    ],
    timeSpent: "12 мин 30 с",
    date: "2025-05-18",
  },
  {
    id: 2,
    name: "Мария Петрова",
    email: "maria@example.com",
    position: "Аналитик",
    regularScore: 92,
    belbinRoles: [],
    positionBelbinRoles: [
      { role: "Аналитик", recommended: 8 },
      { role: "Исследователь", recommended: 7 },
    ],
    timeSpent: "10 мин 15 с",
    date: "2025-05-17",
  },
  {
    id: 3,
    name: "Алексей Смирнов",
    email: "aleksey@example.com",
    position: "Разработчик",
    regularScore: 78,
    belbinRoles: [
      { role: "Исследователь", score: 8 },
      { role: "Контролер", score: 4 },
    ],
    positionBelbinRoles: [
      { role: "Исследователь", recommended: 7 },
      { role: "Контролер", recommended: 5 },
      { role: "Реализатор", recommended: 6 },
    ],
    timeSpent: "15 мин 5 с",
    date: "2025-05-16",
  },
];

// Компонент строки результата с раскрывающимся блоком
function ResultRow({ result }) {
  const [open, setOpen] = useState(false);

  const handleRowClick = () => {
    setOpen((prev) => !prev);
  };
  function findRoleScore(roleName, belbinRoles) {
    const found = belbinRoles.find((r) => r.role.name === roleName);
    return found ? found.total_score : 0;
  }

  const employee = result.employee;
  const fullName = `${employee?.last_name} ${employee?.first_name}${
    employee.middle_name ? ` ${employee.middle_name}` : ""
  }`;
  const photoUrl = getPhotoUrl(employee.photo);
  return (
    <>
      <TableRow
        hover
        onClick={handleRowClick}
        sx={{ cursor: "pointer" }}
        tabIndex={0}
        role="button"
        aria-expanded={open}
      >
        <TableCell>
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </TableCell>
        <TableCell>
          <Avatar src={photoUrl} sx={{ width: 56, height: 56 }} />
        </TableCell>
        <TableCell>{fullName}</TableCell>
        <TableCell>{employee.email}</TableCell>
        <TableCell>{employee.position?.title}</TableCell>
        <TableCell align="right">{result.percent.toFixed(2)}%</TableCell>
        <TableCell align="right">
          {formatTimeSpent(result.started_at, result.completed_at)}
        </TableCell>
        <TableCell align="right">{formatDate(result.completed_at)}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={2}>
              <Typography variant="subtitle1" gutterBottom>
                Детали теста:
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography sx={{ minWidth: 200 }}>
                    Набранные баллы:
                  </Typography>
                  <Chip
                    label={`${result.score} из ${result.max_score}`}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography sx={{ minWidth: 200 }}>
                    Процент выполнения:
                  </Typography>
                  <Chip
                    label={`${result.percent.toFixed(2)}%`}
                    color={
                      result.percent >= 80
                        ? "success"
                        : result.percent >= 50
                        ? "warning"
                        : "error"
                    }
                    size="small"
                  />
                </Box>
                {/* <Box display="flex" alignItems="center" gap={1}> */}
                {/* <Typography sx={{ minWidth: 200 }}>Дата начала:</Typography>
                  <Typography>{formatDate(result.started_at)}</Typography> */}
                {/* </Box> */}
                {/* <Box display="flex" alignItems="center" gap={1}>
                  <Typography sx={{ minWidth: 200 }}>
                    Дата завершения:
                  </Typography>
                  <Typography>{formatDate(result.completed_at)}</Typography>
                </Box> */}
              </Box>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Результаты Белбин теста:
              </Typography>
              {result?.belbin_results && result?.belbin_results?.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {result?.belbin_results?.map((role) => (
                    <Chip
                      key={role.role.id}
                      label={`${role.role?.name ?? role.role.id}: ${
                        role.total_score
                      }`}
                      color="secondary"
                      size="medium"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Белбин-тест не проходился
                </Typography>
              )}
              <Typography variant="subtitle1" gutterBottom>
                Рекомендации по ролям для должности: <b>{result.position}</b>
              </Typography>
              {employee?.position?.belbin_requirements &&
              employee?.position?.belbin_requirements.length > 0 ? (
                <Box display="flex" flexDirection="column" gap={1}>
                  {employee?.position?.belbin_requirements.map(
                    (recommended_role) => {
                      const userScore = findRoleScore(
                        recommended_role.role.name,
                        result.belbin_results
                      );
                      const isBelow = userScore < recommended_role.min_score;
                      return (
                        <Box
                          key={recommended_role.role.id}
                          display="flex"
                          alignItems="center"
                          gap={1}
                          sx={{
                            bgcolor: isBelow
                              ? "rgba(255,0,0,0.1)"
                              : "rgba(0,255,0,0.1)",
                            borderRadius: 1,
                            p: 1,
                          }}
                        >
                          <Typography sx={{ minWidth: 140 }}>
                            {recommended_role.role.name}
                          </Typography>
                          <Chip
                            label={`Рекомендуемый: ${recommended_role.min_score}`}
                            size="small"
                            color="info"
                          />
                          <Chip
                            label={`Ваш балл: ${userScore}`}
                            size="small"
                            color={isBelow ? "error" : "success"}
                          />
                        </Box>
                      );
                    }
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Нет рекомендаций для этой должности
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
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
export default function UserResultsPage({ results, isLoading }) {
  return (
    <Box sx={{ mt: 2, mb: 5 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Результаты тестирования
        </Typography>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : results.length === 0 ? (
        <Typography variant="h6" align="center" color="text.secondary" mt={10}>
          Нет данных для отображения
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <b>Фото</b>
                </TableCell>
                <TableCell>
                  <b>Сотрудник</b>
                </TableCell>
                <TableCell>
                  <b>Email</b>
                </TableCell>
                <TableCell>
                  <b>Должность</b>
                </TableCell>
                <TableCell align="right">
                  <b>Результат</b>
                </TableCell>
                <TableCell align="right">
                  <b>Время прохождения</b>
                </TableCell>
                <TableCell align="right">
                  <b>Дата</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <ResultRow key={result.id} result={result} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
