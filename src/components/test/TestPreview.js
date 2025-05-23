import React from "react";
import {
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Avatar,
  Chip,
} from "@mui/material";
import { BelbinQuestion } from "./BelbinQuestion";
import { utcToZonedTime, format } from "date-fns-tz";
import { ru } from "date-fns/locale"; // Правильный импорт русской локали
import { parseISO } from "date-fns";

const TestPreview = ({ test }) => {
  console.log(test);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const created_at = utcToZonedTime(test.created_at, timeZone);
  const endDateISO = test.end_date; // "2025-05-16T05:17:00"
  const endDate = endDateISO
    ? utcToZonedTime(parseISO(endDateISO), timeZone)
    : null;

  const sortedQuestions = [
    ...test.questions.map((q) => ({ ...q, type: "regular" })),
    ...test.belbin_questions.map((q) => ({ ...q, type: "belbin" })),
  ].sort((a, b) => a.order - b.order);
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {test.title}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Chip
          label={
            endDate
              ? `Лимит времени: ${format(endDate, "dd-MM-yyyy HH:mm", {
                  timeZone,
                  locale: ru,
                })}`
              : "Лимит времени не указан"
          }
        />

        <Chip
          label={test.status === "active" ? "Активный" : "Неактивный"}
          color={test.status === "active" ? "success" : "default"}
        />
      </Box>

      {test.image && (
        <Box mb={2} display="flex" justifyContent="center">
          <Avatar
            variant="rounded"
            src={test.image}
            sx={{ width: "100%", maxWidth: 400, height: "auto" }}
          />
        </Box>
      )}

      {test.description && (
        <Typography variant="subtitle1" gutterBottom>
          {test.description}
        </Typography>
      )}

      <Divider sx={{ my: 3 }} />

      {sortedQuestions.length > 0 && (
        <Typography variant="h5" gutterBottom>
          Вопросы теста
        </Typography>
      )}

      {sortedQuestions.map((question, qIndex) => (
        <Box
          key={question.id}
          sx={{ mb: 4, border: "1px solid #eee", p: 2, borderRadius: 1 }}
        >
          <Typography variant="h6" gutterBottom>
            {qIndex + 1}. {question.text}
          </Typography>

          {question.image && (
            <Box mb={2}>
              <Avatar
                variant="rounded"
                src={question.image}
                sx={{ width: "100%", maxWidth: 300, height: "auto" }}
              />
            </Box>
          )}

          {question.type === "regular" && question.question_type === "text" ? (
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Введите ваш ответ..."
            />
          ) : question.type === "regular" ? (
            <List>
              {question.answers.map((answer, aIndex) => (
                <ListItem key={aIndex} disablePadding>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={answer.is_correct}
                          name={`question-${qIndex}-answer-${aIndex}`}
                          color="primary"
                        />
                      }
                      label={answer.text}
                      sx={{ flex: 1 }}
                    />
                    {answer.image && (
                      <Avatar
                        src={answer.image}
                        variant="rounded"
                        sx={{ width: 56, height: 56, ml: 2 }}
                      />
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <BelbinQuestion question={question} />
          )}
        </Box>
      ))}

      {sortedQuestions.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          В этом тесте пока нет вопросов.
        </Typography>
      )}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" size="large">
          Отправить ответы
        </Button>
      </Box>
    </Paper>
  );
};

export default TestPreview;
