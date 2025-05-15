import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { Add, Close, Image, Settings } from "@mui/icons-material";
import { QuestionEditor } from "./QuestionEditor";
import { TestSettingsDilog } from "./TestSettingsDIalog";
import { useSelector, useDispatch } from "react-redux";
import { Snackbar, Alert } from "@mui/material";
import { ValidationDialog } from "./ValidationDialog";
import { validateTest } from "./TestValidate";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ruLocale from "date-fns/locale/ru";
import { startOfToday } from "date-fns";

export const TestEditor = ({
  initialTest,
  onSave,
  onCancel,
  onPreview,
  saveSettings,
}) => {
  const [title, setTitle] = useState(initialTest.title || "");
  const initialQuestions = initialTest?.questions || [];
  const belbinQuestions = (initialTest?.belbin_questions || []).map((q) => ({
    ...q,
    answers: (q.answers || []).map((answer) => ({
      ...answer,
      role: {
        id: answer.role_id,
        name: answer.role_name,
      },
      role_id: undefined, // Убираем role_id
      role_name: undefined, // Убираем role_name
    })),
    isBelbin: true,
  }));
  const allQuestions = [...initialQuestions, ...belbinQuestions];

  const [questions, setQuestions] = useState(allQuestions);
  const belbinCount = questions.filter((q) => q.isBelbin).length;
  const [testImage, setTestImage] = useState(initialTest.image || null);
  const [errorMessage, setErrorMessage] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [testSettings, setTestSettings] = useState(
    initialTest.test_settings || {
      min_questions: 4,
      belbin_block: 7,
      belbin_questions_in_block: 4,
    }
  );
  const dispatch = useDispatch();
  const [deadline, setDeadline] = useState(initialTest?.end_date || null);
  console.log(initialTest);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });
  console.log(questions);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const imageInputRef = useRef();
  const [validationErrors, setValidationErrors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSaveClick = () => {
    console.log(initialTest);
    const errors = validateTest(
      {
        ...initialTest,
        title,
        image: testImage,
        questions,
        deadline: deadline,

        // minQuestions,
        // maxQuestions,
      },
      testSettings
    );
    if (errors.length > 0) {
      setValidationErrors(errors);
      setDialogOpen(true);
    } else {
      // Сохраняем тест
      onSave({
        ...initialTest,
        title,
        image: testImage,
        questions,
        end_date: deadline.toISOString(),
        test_settings: testSettings,
        deadline: deadline,
      });
    }
  };
  const handleAddQuestion = () => {
    if (questions.length > 0 && !questions[questions.length - 1].isBelbin) {
      let is_correct = false;
      for (const opt of questions[questions.length - 1].answers) {
        if (opt.is_correct) is_correct = true;
      }
      if (!is_correct) {
        setSnackbar({
          open: true,
          message: `Вопрос должен иметь хотя бы один правильный вариант. Измените в настройках при необходимости`,
        });
        return;
      }
    }

    if (
      questions.length > 0 &&
      !questions[questions.length - 1].isBelbin &&
      questions[questions.length - 1].answers.length <
        testSettings.min_questions
    ) {
      setSnackbar({
        open: true,
        message: `Вопрос должны иметь минимум ${testSettings.min_questions} вариантов. Измените в настройках при необходимости`,
      });
      return;
    }
    if (
      questions.length > 0 &&
      questions[questions.length - 1].isBelbin &&
      questions[questions.length - 1].answers.length <
        testSettings.belbinOptionsPerBlock
    ) {
      setSnackbar({
        open: true,
        message: `Вопрос Белбина должны иметь минимум ${testSettings.belbin_questions_in_block} вариантов. Измените в настройках при необходимости`,
      });
      return;
    }
    console.log(questions[questions.length - 1]);
    if (questions.length > 0 && questions[questions.length - 1].title === "") {
      setSnackbar({
        open: true,
        message: `Вопрос должны иметь заголовок.`,
      });
      return;
    }
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        answers: [],
        image: null,
        isBelbin: false,
        order: questions.length,
      },
    ]);
  };

  const handleImageUpload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({
      ...initialTest,
      title,
      image: testImage,
      questions,
      // minQuestions,
      // maxQuestions,
    });
  };

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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" gutterBottom>
          {initialTest?.id === "new"
            ? "Создание теста"
            : "Редактирование теста"}
        </Typography>
        <Box>
          <IconButton
            // onClick={handleAssignTest}
            variant="contained"
            startIcon={<AssignmentIcon />}
          >
            {/* Назначить */}
            <AssignmentIcon color="info" />
          </IconButton>
          <IconButton onClick={() => setSettingsOpen(true)}>
            <Settings />
          </IconButton>
          <IconButton
            onClick={() =>
              onPreview({
                ...initialTest,
                title,
                image: testImage,
                questions,
                end_date: deadline.toISOString(),
                test_settings: testSettings,
              })
            }
          >
            <VisibilityIcon color="info" />
          </IconButton>
        </Box>
      </Box>
      {/* Настройки теста - диалог */}
      {settingsOpen && (
        <TestSettingsDilog
          initialTest={initialTest}
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          testSettings={testSettings}
          onSave={(newSettings) => {
            setTestSettings(newSettings);
          }}
        />
      )}
      {/* Изображение и Название теста */}
      {testImage ? (
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
          startIcon={<Image />}
          onClick={() => imageInputRef.current.click()}
          sx={{ mb: 2 }}
        >
          Добавить изображение к тесту
        </Button>
      )}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={(e) => handleImageUpload(e.target.files[0], setTestImage)}
        style={{ display: "none" }}
      />
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

      <Typography variant="h6" gutterBottom>
        Вопросы
      </Typography>
      {questions && questions.length > 0 ? (
        questions.map((question, index) => (
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
              onChange={(updatedQuestion) => {
                const newQuestions = [...questions];
                newQuestions[index] = updatedQuestion;
                setQuestions(newQuestions);
              }}
              onDelete={() => {
                setQuestions(questions.filter((_, i) => i !== index));
              }}
            />
          </Box>
        ))
      ) : (
        <div>No questions available</div>
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
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button onClick={() => setCancelDialogOpen(true)} variant="outlined">
          Отмена
        </Button>
        <Button onClick={handleSaveClick} variant="contained">
          Сохранить тест
        </Button>
      </Box>
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
          <Button
            onClick={() => {
              // Сохранить как черновик
              onSave({
                ...initialTest,
                title,
                image: testImage,
                questions,
                status: "draft", // например, флаг черновика
                end_date: deadline.toISOString(),
              });
              setCancelDialogOpen(false);
            }}
          >
            Сохранить как черновик
          </Button>
          <Button
            onClick={() => {
              setCancelDialogOpen(false);
              onCancel(); // выход без сохранения
            }}
            color="error"
          >
            Выйти без сохранения
          </Button>
          <Button onClick={() => setCancelDialogOpen(false)}>Отмена</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
