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
} from "@mui/material";
import TestPreview from "./TestPreview";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Для стрелки

const TestStatsPage = ({ test }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleTogglePreview = () => {
    setIsPreviewOpen((prev) => !prev); // Переключаем видимость
  };

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Статистика по тесту: {test.title}
        </Typography>
        <Typography>Описание: {test.description}</Typography>
        <Typography>Всего вопросов: {test.questions.length}</Typography>
        <Typography sx={{ my: 2 }}>
          Кол-во назначений: {test.assignedTo?.length}
        </Typography>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Результаты прохождения</Typography>
          <List>
            {(test.results || []).map((res) => (
              <React.Fragment key={res.userId}>
                <ListItem>
                  <ListItemText
                    primary={`${res.name} — ${res.score} баллов`}
                    secondary={`Завершено за ${res.duration} сек.`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
        <Box sx={{ mt: 4 }}>
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
