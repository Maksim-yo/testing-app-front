import React from "react";
import {
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  Box,
  Avatar,
  Chip,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { BelbinQuestion } from "../../components/test/BelbinQuestion";
import { utcToZonedTime, format } from "date-fns-tz";
import { ru } from "date-fns/locale";
import { parseISO } from "date-fns";

const TestPreviewWithAnswers = ({ test }) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const created_at = utcToZonedTime(test.created_at, timeZone);
  const endDate = test.end_date
    ? utcToZonedTime(parseISO(test.end_date), timeZone)
    : null;

  const sortedQuestions = [
    ...(Array.isArray(test.questions)
      ? test.questions.map((q) => ({ ...q, type: "regular" }))
      : []),
    ...(Array.isArray(test.belbin_questions)
      ? test.belbin_questions.map((q) => ({ ...q, type: "belbin" }))
      : []),
  ].sort((a, b) => a.order - b.order);
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {test.title}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {/* <Chip
          label={
            endDate
              ? `Лимит времени: ${format(endDate, "dd-MM-yyyy HH:mm", {
                  timeZone,
                  locale: ru,
                })}`
              : "Лимит времени не указан"
          }
        /> */}
        {/* <Chip
          label={test.is_active ? "Активный" : "Неактивный"}
          color={test.is_active ? "success" : "default"}
        /> */}
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
          Ответы
        </Typography>
      )}

      {/* NEW: Добавлена прокрутка при maxHeight */}
      <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
        {sortedQuestions.map((question, qIndex) => {
          if (question.type === "regular") {
            const userAnswers = question.answers.filter(
              (a) => a.is_user_answer
            );

            return (
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
                {question.question_type === "text_answer" ? (
                  <TextField
                    fullWidth
                    multiline
                    label="Ответ пользователя"
                    value={
                      question?.answers[0]?.text
                        ? question?.answers[0]?.text
                        : ""
                    }
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                ) : (
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
                                checked={!!answer.is_user_answer}
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
                )}
              </Box>
            );
          } else if (question.type === "belbin") {
            return (
              <Box
                key={question.id}
                sx={{ mb: 4, border: "1px solid #eee", p: 2, borderRadius: 1 }}
              >
                <Typography variant="h6" gutterBottom>
                  {qIndex + 1}. {question.text}
                </Typography>
                <BelbinQuestion
                  question={question}
                  isEditable={false}
                  readonly
                />
              </Box>
            );
          }

          return null;
        })}
      </Box>

      {sortedQuestions.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          В этом тесте пока нет вопросов.
        </Typography>
      )}
    </Paper>
  );
};

export default TestPreviewWithAnswers;
