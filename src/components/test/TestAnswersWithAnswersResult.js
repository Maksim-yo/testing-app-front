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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { BelbinQuestion } from "./BelbinQuestion";
import { utcToZonedTime, format } from "date-fns-tz";
import { ru } from "date-fns/locale";
import { parseISO } from "date-fns";

const TestAnswersWithAnswersResult = ({ result, test, open, onClose }) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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

  const fullName =
    result.employee?.full_name ||
    `${result.employee?.last_name || ""} ${result.employee?.first_name || ""} ${
      result.employee?.middle_name || ""
    }`.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Результаты теста сотрудника {fullName}</DialogTitle>
      <DialogContent dividers>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {test.title}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            {endDate && (
              <Chip
                label={`Лимит времени: ${format(endDate, "dd-MM-yyyy HH:mm", {
                  timeZone,
                  locale: ru,
                })}`}
              />
            )}
            <Chip
              label={test.is_active ? "Активный" : "Неактивный"}
              color={test.is_active ? "success" : "default"}
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

          <Typography variant="h5" gutterBottom>
            Ответы пользователя и правильные ответы
          </Typography>

          {/* Пояснения по цветам и галочкам */}
          <Box sx={{ mb: 2, textAlign: "left" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Checkbox checked color="success" sx={{ p: 0, mr: 1 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                component="span"
              >
                — ответ выбран пользователем
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", alignItems: "center", mb: 0.5, ml: 0.5 }}
            >
              <Box
                component="span"
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: "#4caf50",
                  mr: 1,
                  display: "inline-block",
                }}
              />
              <Typography variant="body2" sx={{ color: "#4caf50" }}>
                — правильный ответ пользователя
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", ml: 0.5 }}>
              <Box
                component="span"
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: "#dcedc8",
                  mr: 1,
                  display: "inline-block",
                }}
              />{" "}
              <Typography
                variant="body2"
                color="text.secondary"
                component="span"
              >
                — ответ правильный, но не выбран пользователем
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", ml: 0.5 }}>
              <Box
                component="span"
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: "#f44336",
                  mr: 1,
                  display: "inline-block",
                }}
              />
              <Typography variant="body2" sx={{ color: "#f44336" }}>
                — неправильный ответ пользователя
              </Typography>
            </Box>
          </Box>

          <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
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

                {question.type === "regular" &&
                question.question_type === "text_answer" ? (
                  (() => {
                    const isCorrect = !!question.answers[0]?.is_correct;
                    let backgroundColor = "inherit";

                    if (isCorrect) backgroundColor = "#c8e6c9"; // зелёный
                    else backgroundColor = "#ffcdd2"; // красный

                    return (
                      <TextField
                        fullWidth
                        multiline
                        label="Ответ пользователя"
                        value={question?.answers[0]?.text || ""}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        sx={{ backgroundColor }}
                      />
                    );
                  })()
                ) : question.type === "regular" ? (
                  <List>
                    {question.answers.map((answer, aIndex) => {
                      const isUserAnswer = !!answer.selected;
                      const isCorrect = !!answer.is_correct;

                      let backgroundColor = "inherit";
                      if (isUserAnswer && isCorrect)
                        backgroundColor = "#c8e6c9"; // зелёный
                      else if (isUserAnswer && !isCorrect)
                        backgroundColor = "#ffcdd2"; // красный
                      else if (!isUserAnswer && isCorrect)
                        backgroundColor = "#dcedc8"; // светло-зелёный

                      return (
                        <ListItem key={aIndex} disablePadding>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              bgcolor: backgroundColor,
                              px: 1,
                              borderRadius: 1,
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isUserAnswer}
                                  color="success"
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
                      );
                    })}
                  </List>
                ) : (
                  <BelbinQuestion
                    question={question}
                    isEditable={false}
                    readonly
                  />
                )}
              </Box>
            ))}

            {sortedQuestions.length === 0 && (
              <Typography variant="body1" color="text.secondary">
                В этом тесте пока нет вопросов.
              </Typography>
            )}
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestAnswersWithAnswersResult;
