import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Close,
  Image as ImageIcon,
  Settings,
  Add,
  LocalConvenienceStoreOutlined,
  DifferenceRounded,
} from "@mui/icons-material";
import { QuestionEditor } from "./QuestionEditor";
import { TestSettingsDilog } from "./TestSettingsDIalog";
import { Snackbar, Alert } from "@mui/material";
import { ValidationDialog } from "./ValidationDialog";
import { validateTest } from "./TestValidate";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ruLocale from "date-fns/locale/ru";
import { startOfToday } from "date-fns";
import isEqual from "lodash.isequal";
import { diff } from "deep-diff";
import { useUpdateTestMutation, useCreateTestMutation } from "../../app/api";

function normalizeTest(test) {
  const sortById = (arr) => {
    if (!Array.isArray(arr)) return arr;
    return arr
      .map((item) => normalizeTest(item))
      .sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));
  };

  if (Array.isArray(test)) return sortById(test);

  if (test && typeof test === "object") {
    const result = {};
    Object.keys(test)
      .sort()
      .forEach((key) => {
        result[key] = normalizeTest(test[key]);
      });
    return result;
  }

  return test;
}
const splitQuestions = (questions) => {
  const normalQuestions = [];
  const belbinQuestions = [];

  questions.forEach((question) => {
    if (question.question_type === "belbin") {
      const { isBelbin, ...questionWithoutIsBelbin } = question;

      const transformedAnswers = questionWithoutIsBelbin.answers.map(
        ({ role, ...rest }) => ({
          ...rest,
          role_id: role?.id ?? null,
          role_name: role?.name ?? "",
        })
      );

      belbinQuestions.push({
        ...questionWithoutIsBelbin,
        answers: transformedAnswers,
      });
    } else {
      normalQuestions.push(question);
    }
  });

  return {
    questions: normalQuestions,
    belbin_questions: belbinQuestions,
  };
};
function parseRawTest(raw) {
  const questions = [];
  const belbin_questions = [];
  console.log(raw);
  raw.questions.forEach((q, index) => {
    if (q.question_type === "belbin") {
      // Создаем один вопрос
      const belbin_question = {
        text: q.text, // общий текст вопроса
        block_number: index + 1,
        order: index,
        answers: [], // массив вариантов ответа
        id: q.id,
        test_id: raw.id,
      };

      q.answers.forEach((a) => {
        console.log(a);
        if (a.role && a.role.id) {
          belbin_question.answers.push({
            id: a.id,
            text: a.text,
            role_id: a.role.id,
            role_name: a.role.name,
            question_id: q.id,
          });
        }
      });

      belbin_questions.push(belbin_question);
    } else {
      questions.push({
        test_id: raw.id,
        id: q.id,
        text: q.text,
        question_type: q.question_type,
        image: q.image,
        order: index,
        points: q.points,
        answers: q.answers.map((a) => ({
          id: a.id,
          text: a.text,
          question_id: q.id,
          is_correct: a.is_correct,
          image: a.image,
        })),
      });
    }
  });

  return {
    title: raw.title || "Без названия",
    description: raw.description || "",
    is_active: true,
    end_date: raw.end_date,
    image: raw.image,
    id: raw.id || "new",
    questions,
    belbin_questions,
    test_settings: raw.test_settings,
    status: raw.status || "draft",
    time_limit_minutes: raw.time_limit_minutes,
  };
}
export const TestEditor = ({
  initialTest,
  onCancel,
  onPreview,
  saveSettings,
  onBack,
  triggerBack,
  resetTriggerBack,
  backToList,
}) => {
  // Состояния компонента
  const [title, setTitle] = useState(initialTest.title || "");
  const [testImage, setTestImage] = useState(initialTest.image || null);
  const [timeLimit, setTimeLimit] = useState(initialTest.time_limit_minutes);
  const [deadline, setDeadline] = useState(
    initialTest?.end_date ? new Date(initialTest.end_date) : null
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createTest, { isLoading: isCreateTestLoading }] =
    useCreateTestMutation();
  const [updateTest, { isLoading: isUpdateTestLoading }] =
    useUpdateTestMutation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const isLoading = isCreateTestLoading || isUpdateTestLoading;
  const imageInputRef = useRef();

  // Подготовка вопросов
  const prepareQuestions = useCallback(() => {
    const initialQuestions = initialTest?.questions || [];
    const belbinQuestions = (initialTest?.belbin_questions || []).map((q) => ({
      ...q,
      answers: (q.answers || []).map((answer) => ({
        ...answer,
        role: {
          id: answer.role_id,
          name: answer.role_name,
        },
        role_id: undefined,
        role_name: undefined,
      })),
      isBelbin: true,
    }));
    return [...initialQuestions, ...belbinQuestions];
  }, [initialTest]);

  const isTestChanged = () => {
    const current = {
      ...initialTest,
      title,
      image: testImage,
      ...splitQuestions(questions),
      end_date: normalizeDate(deadline?.toISOString() || null),

      time_limit_minutes: timeLimit,
      test_settings: { ...testSettings, has_time_limit: null },
    };
    console.log(current);

    const baseTest = {
      ...initialTest,
      end_date: normalizeDate(initialTest.end_date),

      test_settings: { ...initialTest.test_settings, has_time_limit: null },
    };
    console.log(baseTest);

    const normalizedCurrent = normalizeTest(current);
    const normalizedBase = normalizeTest(baseTest);
    const differences = diff(normalizedCurrent, normalizedBase);
    console.log(differences);
    return !isEqual(normalizedCurrent, normalizedBase);
  };

  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") return;
    setErrorOpen(false);
  };

  const handleShowError = (message) => {
    setErrorMessage(message);
    setErrorOpen(true);
  };
  const [successOpen, setSuccessOpen] = useState(false);

  const handleShowSuccess = () => {
    setSuccessOpen(true);
  };

  const handleSave = async (updatedTest) => {
    try {
      const parsedTest = parseRawTest(updatedTest);

      const response =
        updatedTest.id === "new"
          ? await createTest(parsedTest)
          : await updateTest(parsedTest);

      // RTK Query mutation вернёт объект с error, если была ошибка
      if (response.error) {
        const detail = response.error.data?.detail;
        let message = "Ошибка при сохранении теста.";

        if (typeof detail === "string") {
          message = detail;
        } else if (detail?.message) {
          message = detail.message;
        } else if (detail?.error_message) {
          message = detail.error_message;
        }

        handleShowError(message);
        return;
      }

      handleShowSuccess();
    } catch (err) {
      console.error("Ошибка сохранения:", err);
      handleShowError("Неизвестная ошибка при сохранении теста.");
    } finally {
      backToList();
    }
  };

  const [questions, setQuestions] = useState(prepareQuestions());
  const belbinCount = questions.filter((q) => q.isBelbin).length;
  const normalizeDate = (dateStr) =>
    dateStr ? new Date(dateStr).toISOString().replace(".000", "") : null;

  // Настройки теста
  const defaultSettings = {
    min_questions: 4,
    belbin_block: 7,
    belbin_questions_in_block: 4,
    id: initialTest?.id || null,
    has_time_limit: initialTest?.time_limit_minutes !== null,
  };

  const [testSettings, setTestSettings] = useState({
    ...defaultSettings,
    ...(initialTest?.test_settings || {}),
  });
  const handleShowCancelDialogue = () => {
    console.log("Test changed");
    console.log(isTestChanged());
    if (!isTestChanged()) {
      onCancel();
      return;
    }
    console.log("Test changed");
    setCancelDialogOpen(true);
  };
  // Обработчик триггера возврата
  useEffect(() => {
    if (triggerBack) {
      handleShowCancelDialogue();
      resetTriggerBack();
    }
  }, [triggerBack, resetTriggerBack]);

  // Обработчик загрузки изображения
  const handleImageUpload = useCallback((file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  // Валидация и сохранение
  const validateAndSave = useCallback(() => {
    const errors = validateTest(
      {
        ...initialTest,
        title,
        image: testImage,
        questions,
        deadline,
        time_limit_minutes: timeLimit,
      },
      testSettings
    );

    if (errors.length > 0) {
      setValidationErrors(errors);
      setDialogOpen(true);
      return false;
    }
    console.log(testSettings);
    handleSave({
      ...initialTest,
      title,
      image: testImage,
      questions,
      end_date: deadline?.toISOString(),
      test_settings: testSettings,
      time_limit_minutes: timeLimit,
      status: initialTest.status,
    });
    return true;
  }, [
    initialTest,
    title,
    testImage,
    questions,
    deadline,
    timeLimit,
    testSettings,
    handleSave,
  ]);

  // Обработчики действий
  const handleSaveDraft = useCallback(() => {
    if (validateAndSave("draft")) {
      setCancelDialogOpen(false);
    } else {
      setCancelDialogOpen(false);
    }
  }, [validateAndSave]);

  const handleSaveClick = useCallback(() => {
    validateAndSave();
  }, [validateAndSave]);

  // Обработчик добавления вопроса
  const handleAddQuestion = useCallback(() => {
    const lastQuestion = questions[questions.length - 1];

    // Валидация последнего вопроса перед добавлением нового
    if (lastQuestion) {
      // Проверка для обычных вопросов
      if (!lastQuestion.isBelbin) {
        if (lastQuestion.question_type !== "text_answer") {
          const hasCorrectAnswer = lastQuestion.answers.some(
            (opt) => opt.is_correct
          );
          if (!hasCorrectAnswer) {
            setSnackbar({
              open: true,
              message:
                "Вопрос должен иметь хотя бы один правильный вариант. Измените в настройках при необходимости",
            });
            return;
          }

          if (lastQuestion.answers.length < testSettings.min_questions) {
            setSnackbar({
              open: true,
              message: `Вопрос должен иметь минимум ${testSettings.min_questions} вариантов. Измените в настройках при необходимости`,
            });
            return;
          }
        }
      }
      // Проверка для вопросов Белбина
      else if (
        lastQuestion.answers.length < testSettings.belbin_questions_in_block
      ) {
        setSnackbar({
          open: true,
          message: `Вопрос Белбина должен иметь минимум ${testSettings.belbin_questions_in_block} вариантов. Измените в настройках при необходимости`,
        });
        return;
      }

      if (lastQuestion.text === "") {
        setSnackbar({
          open: true,
          message: "Вопрос должен иметь заголовок.",
        });
        return;
      }
    }

    // Добавление нового вопроса
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        answers: [],
        image: null,
        isBelbin: false,
        order: questions.length,
        points: 1,
      },
    ]);
  }, [questions, testSettings]);

  // Обработчик изменения вопроса
  const handleQuestionChange = useCallback((index, updatedQuestion) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? updatedQuestion : q))
    );
  }, []);

  // Обработчик удаления вопроса
  const handleQuestionDelete = useCallback((index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <ValidationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        errors={validationErrors}
      />

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Заголовок и кнопки управления */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" gutterBottom>
          {initialTest?.id === "new"
            ? "Создание теста"
            : "Редактирование теста"}
        </Typography>
        <Box>
          {/* <IconButton variant="contained" startIcon={<AssignmentIcon />}>
            <AssignmentIcon color="info" />
          </IconButton> */}
          <IconButton onClick={() => setSettingsOpen(true)}>
            <Settings />
          </IconButton>
          {/* <IconButton
            onClick={() =>
              onPreview({
                ...initialTest,
                title,
                image: testImage,
                questions,
                end_date: deadline?.toISOString(),
                test_settings: testSettings,
              })
            }
          >
            <VisibilityIcon color="info" />
          </IconButton> */}
        </Box>
      </Box>

      {/* Диалог настроек теста */}
      {settingsOpen && (
        <TestSettingsDilog
          initialTest={initialTest}
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          testSettings={testSettings}
          onSave={setTestSettings}
        />
      )}

      {/* Изображение теста */}
      {/* {testImage ? (
        <Box position="relative" display="inline-block" mb={2}>
          <Avatar
            variant="rounded"
            src={testImage}
            sx={{ width: "100%", maxWidth: "400px", height: "auto" }}
          />
          <IconButton
            onClick={() => setTestImage(null)}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "white",
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Button
          variant="outlined"
          startIcon={<ImageIcon />}
          onClick={() => imageInputRef.current.click()}
          sx={{ mb: 2 }}
        >
          Добавить изображение к тесту
        </Button>
      )} */}

      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={(e) => handleImageUpload(e.target.files[0], setTestImage)}
        style={{ display: "none" }}
      />

      {/* Основные поля теста */}
      <TextField
        fullWidth
        label="Название теста"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 3 }}
      />

      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={ruLocale}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Срок выполнения
          </Typography>
          <DateTimePicker
            minDateTime={startOfToday()}
            label="Выберите дату и время"
            value={deadline}
            onChange={(newValue) => {
              if (newValue instanceof Date && !isNaN(newValue)) {
                setDeadline(newValue);
              }
            }}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Box>
      </LocalizationProvider>

      {testSettings.has_time_limit && (
        <Box sx={{ mb: 2 }}>
          <TextField
            type="number"
            label="Лимит времени (в минутах)"
            value={timeLimit || ""}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            inputProps={{ min: 0 }}
            fullWidth
          />
        </Box>
      )}

      {/* Список вопросов */}
      <Typography variant="h6" gutterBottom>
        Вопросы
      </Typography>

      {questions.length > 0 ? (
        [...questions] // создаём копию, чтобы не мутировать исходный массив
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((question, index) => (
            <Box
              key={question.id}
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                border: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <Box
                sx={{
                  mb: 1,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: "#333",
                }}
              >
                Вопрос {index + 1}
              </Box>
              <QuestionEditor
                settings={testSettings}
                belbinCount={belbinCount}
                question={question}
                setTestSettings={saveSettings}
                onChange={(updatedQuestion) =>
                  handleQuestionChange(index, updatedQuestion)
                }
                onDelete={() => handleQuestionDelete(index)}
              />
            </Box>
          ))
      ) : (
        <Typography>Нет вопросов</Typography>
      )}

      <Box mt={2}>
        <Button
          onClick={handleAddQuestion}
          startIcon={<Add />}
          variant="outlined"
        >
          Добавить вопрос
        </Button>
      </Box>

      {/* Кнопки сохранения/отмены */}
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button onClick={() => handleShowCancelDialogue()} variant="outlined">
          Отмена
        </Button>
        <Button
          onClick={handleSaveClick}
          variant="contained"
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </Box>

      {/* Диалог подтверждения отмены */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Сохранить как черновик?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите выйти? Изменения могут быть сохранены как
            черновик для дальнейшего редактирования.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveDraft}>Сохранить как черновик</Button>
          <Button
            onClick={() => {
              setCancelDialogOpen(false);
              onCancel();
            }}
            color="error"
          >
            Выйти без сохранения
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseError} severity="warning">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};
