import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  CircularProgress,
  Checkbox,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import BelbinSlider from "../../components/test/BelbinSlider";
import {
  useSaveTestAnswerMutation,
  useCompleteTestMutation,
} from "../../app/api";
import { TestTimer } from "../../components/test/TestTimer";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { set } from "date-fns";
import { NavigateBefore } from "@mui/icons-material";
function isSameAnswer(question, body) {
  console.log(question);

  if (question.type === "belbin" || question.type === "text_answer")
    return false;
  const selectedIdsFromQuestion = question.answers
    .filter((a) => a.is_user_answer)
    .map((a) => a.id)
    .sort(); // на случай если порядок разный

  const bodyAnswerIds = [...(body.answer_ids || [])].sort();

  return (
    JSON.stringify(selectedIdsFromQuestion) === JSON.stringify(bodyAnswerIds)
  );
}

const TestSolver = ({ test, handleBack }) => {
  const navigate = useNavigate();
  const isCompleted = test.status === "completed";

  const questions = [
    ...test.questions.map((q) => ({ ...q, type: q.question_type })),
    ...test.belbin_questions.map((q) => ({ ...q, type: "belbin" })),
  ].sort((a, b) => a.order - b.order);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [saveTestAnswer, { isLoading: isTestAnswerSaving }] =
    useSaveTestAnswerMutation();
  const [completeTest, { isLoading: isCompleteTestLoading }] =
    useCompleteTestMutation();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Функция для закрытия Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const isLoading = isCompleteTestLoading || isTestAnswerSaving;
  const currentQuestion = questions[currentQuestionIndex];
  const isBelbin = currentQuestion?.type === "belbin";
  const startedAtStr = test.started_at.substring(0, 23) + "Z";
  // берём первые 23 символа (до миллисекунд), добавляем "Z" для UTC
  const startedAtDate = new Date(startedAtStr);
  const deadline = new Date(
    startedAtDate.getTime() + test.time_limit_minutes * 60 * 1000
  );

  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000))
  );

  const [isTimeUp, setIsTimeUp] = useState(false);
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId); // остановить, когда дойдёт до 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId); // очистка при размонтировании
  }, []);

  const handleTimeUp = async () => {
    if (isCompleted) return; // Не выполняем, если тест уже завершен

    setIsTimeUp(true);
    setOpenSnackbar(true); // Показываем уведомление

    try {
      await handleFinish(true);
    } catch (error) {
      console.error("Failed to auto-complete test:", error);
    }

    // 2. Показать уведомление
  };
  const handleMultipleChoiceChange = (answerId) => (event) => {
    if (isCompleted) return;
    const currentAnswers = answers[currentQuestion.id] || [];
    let newAnswers;

    if (event.target.checked) {
      newAnswers = [...currentAnswers, answerId];
    } else {
      newAnswers = currentAnswers.filter((id) => id !== answerId);
    }

    setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
    setError("");
  };
  // Предзаполнение ответов, если тест завершён
  useEffect(() => {
    if (!test) return;

    const initialAnswers = {};

    for (const question of test.questions) {
      if (question.question_type === "single_choice") {
        const selected = question.answers.find((a) => a.is_user_answer);
        if (selected) {
          initialAnswers[question.id] = String(selected.id);
        }
      } else if (question.question_type === "multiple_choice") {
        const selected = question.answers
          .filter((a) => a.is_user_answer)
          .map((a) => a.id);
        if (selected.length > 0) {
          initialAnswers[question.id] = selected;
        }
      } else if (question.question_type === "text_answer") {
        const textAnswer = question.answers?.[0]?.text;
        if (textAnswer) {
          initialAnswers[question.id] = textAnswer;
        }
      }
    }

    for (const q of test.belbin_questions) {
      if (q.answers?.some((a) => a.user_score != null)) {
        initialAnswers[q.id] = q.answers.map((a) => a.user_score || 0);
      }
    }

    setAnswers(initialAnswers);

    // 👉 Вычисляем первый неотвеченный вопрос
    const allQuestions = [
      ...test.questions.map((q) => ({ ...q, type: q.question_type })),
      ...test.belbin_questions.map((q) => ({ ...q, type: "belbin" })),
    ].sort((a, b) => a.order - b.order);

  //   const firstUnansweredIndex = allQuestions.findIndex((q) => {
  //     return;
  //     const answer = initialAnswers[q.id];
  //     if (q.type === "belbin") {
  //       const sum = (answer || []).reduce((a, b) => a + b, 0);
  //       return sum !== 10;
  //     } else if (q.type === "single_choice") {
  //       return !answer;
  //     } else if (q.type === "multiple_choice") {
  //       // если нет ни одного выбранного варианта — считаем как неполный
  //       return !answer || answer.length === 0;
  //     } else if (q.type === "text") {
  //       return !answer || answer.trim() === "";
  //     }
  //     return false;
  //   });

  //   if (firstUnansweredIndex >= 0) {
  //     setCurrentQuestionIndex(firstUnansweredIndex);
  //   } else {
  //     setCurrentQuestionIndex(0);
  //   }
  // }, [isCompleted, test]);

  const handleBelbinChange = (index) => (event, newValue) => {
    if (isCompleted) return;
    const newAnswer = [
      ...(answers[currentQuestion.id] ||
        Array(currentQuestion.answers.length).fill(0)),
    ];
    newAnswer[index] = newValue;

    const sum = newAnswer.reduce((a, b) => a + b, 0);
    if (sum > 10) return;

    setAnswers({ ...answers, [currentQuestion.id]: newAnswer });
    setError("");
  };

  const handleSingleChoiceChange = (event) => {
    if (isCompleted) return;
    setAnswers({ ...answers, [currentQuestion.id]: event.target.value });
    setError("");
  };

  const handleTextChange = (event) => {
    if (isCompleted) return;
    setAnswers({ ...answers, [currentQuestion.id]: event.target.value });
    setError("");
  };

  const validateAnswer = () => {
    const value = answers[currentQuestion.id];
    console.log(value);
    console.log(answers);

    if (currentQuestion.type === "belbin") {
      const sum = (value || []).reduce((a, b) => a + b, 0);
      if (sum !== 10) {
        setError("Необходимо распределить ровно 10 баллов");
        return false;
      }
    } else if (currentQuestion.type === "single_choice") {
      if (!value) {
        setError("Выберите один вариант");
        return false;
      }
    } else if (currentQuestion.type === "multiple_choice") {
      if (!value) {
        setError("Выберите несколько вариантов");
        return false;
      }
    } else if (currentQuestion.type === "text_answer") {
      if (!value || value.trim() === "") {
        setError("Введите ответ");
        return false;
      }
    }
    console.log("right");

    return true;
  };

  const sendAnswer = async () => {
    let answer_ids = [];
    let text_response = null;

    if (currentQuestion.type === "belbin") {
      const scores = answers[currentQuestion.id] || [];
      const answerScorePairs = currentQuestion.answers.map((a, index) => [
        a.id,
        scores[index] ?? 0,
      ]);
      text_response = JSON.stringify(answerScorePairs);
    } else if (currentQuestion.type === "single_choice") {
      answer_ids = [parseInt(answers[currentQuestion.id])];
    } else if (currentQuestion.type === "multiple_choice") {
      // Множественный выбор — просто передаем массив выбранных id
      answer_ids = (answers[currentQuestion.id] || []).map(Number);
    } else if (currentQuestion.type === "text_answer") {
      text_response = answers[currentQuestion.id];
    }

    const body = {
      test_id: test.id,
      question_id: currentQuestion.id,
      answer_ids,
      text_response,
      question_type: currentQuestion.type,
    };
    // const curr

    const alreadyAnswered = isSameAnswer(currentQuestion, body);
    console.log(alreadyAnswered);
    if (alreadyAnswered) {
      return;
    }
    try {
      await saveTestAnswer(body).unwrap();
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.data?.detail ||
        error?.data?.message ||
        error?.error ||
        error?.message ||
        error?.detail ||
        "Произошла ошибка";
      // setSnackbar({
      //   open: true,
      //   message: errorMessage,
      //   severity: "error",
      // });

      // Дополнительно, если тест просрочен — можешь остановить дальнейшее прохождение
      if (
        errorMessage === "Срок действия теста истёк" ||
        errorMessage === "Время на выполнение теста истекло"
      ) {
        // Например, показать диалог или вернуть пользователя
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      } else if (errorMessage === "Тест приостановлен") {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }
      setTimeout(() => {
        handleBack();
      }, 2000);
    }
  };
  const handleNext = async () => {
    if (!validateAnswer()) return;
    console.log("HELLO");

    try {
      if (!isCompleted) await sendAnswer();
      setCurrentQuestionIndex((prev) => prev + 1);
      setError("");
    } catch (error) {
      console.error("Ошибка при сохранении ответа", error);
      setSnackbar({
        open: true,
        message: "Не удалось сохранить ответ. Попробуйте ещё раз.",
        severity: "error",
      });
    }
  };

  const handlePrev = () => {
    setCurrentQuestionIndex((prev) => prev - 1);
    setError("");
  };

  const handleFinish = async (forceFinish = false) => {
    if (isCompleted) return;

    const isValid = validateAnswer();

    if (forceFinish && !isValid) {
      // Завершаем тест без отправки ответа
      try {
        await completeTest(test.id);
        navigate("/test-completed");
      } catch (error) {
        console.log(error);
      }
      return;
    }

    if (!forceFinish && !isValid) {
      // При обычном вызове, если ответ не валиден, выходим
      return;
    }

    // В остальных случаях пытаемся отправить ответ, затем завершить тест
    try {
      if (!isCompleted) {
        try {
          await sendAnswer();
        } catch (error) {
          console.log("Ошибка при сохранении последнего ответа:", error);
          setSnackbar({
            open: true,
            message: "Ошибка при сохранении ответа перед завершением теста.",
            severity: "error",
          });
        }
      }
      await completeTest(test.id);
      navigate("/test-completed");
    } catch (error) {
      console.log("Ошибка при завершении теста:", error);
      setSnackbar({
        open: true,
        message: "Ошибка при завершении теста. Попробуйте ещё раз.",
        severity: "error",
      });
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const totalPoints = isBelbin
    ? (answers[currentQuestion.id] || [])
        .map((v) => Number(v) || 0)
        .reduce((a, b) => a + b, 0)
    : null;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {test.title}
        </Typography>
        {test.time_limit_minutes && (
          <TestTimer secondsLeft={secondsLeft} onTimeUp={handleTimeUp} />
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Typography variant="body2">
          Вопрос {currentQuestionIndex + 1} из {questions.length}
        </Typography>
      </Box>
      <Typography variant="h6" gutterBottom>
        {currentQuestionIndex + 1}. {currentQuestion.text}
      </Typography>
      {isBelbin && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, color: "#555" }}>
            Распределите 10 баллов между вариантами:
          </Typography>
          {currentQuestion.answers.map((a, index) => (
            <FormControl key={a.id} fullWidth sx={{ mb: 2 }}>
              <BelbinSlider
                index={index}
                value={(answers[currentQuestion.id] || [])[index] || 0}
                handleSliderChange={handleBelbinChange}
                totalPoints={totalPoints}
                marks={[...Array(11).keys()].map((n) => ({
                  value: n,
                  label: `${n}`,
                }))}
                limit={8}
                max={10}
                answerOption={a.text}
                disabled={isCompleted}
              />
            </FormControl>
          ))}
          <Typography
            sx={{
              fontWeight: "bold",
              color:
                totalPoints === 10
                  ? "green"
                  : totalPoints > 10
                  ? "red"
                  : "inherit",
            }}
          >
            Распределено баллов: {totalPoints || 0}/10
          </Typography>
        </Box>
      )}
      {currentQuestion.type === "single_choice" && (
        <RadioGroup
          value={answers[currentQuestion.id] || ""}
          onChange={handleSingleChoiceChange}
        >
          {currentQuestion.answers.map((a) => (
            <FormControlLabel
              key={a.id}
              value={String(a.id)}
              control={<Radio disabled={isCompleted} />}
              label={a.text + (isCompleted && a.is_user_answer ? " ✅" : "")}
            />
          ))}
        </RadioGroup>
      )}
      {currentQuestion.type === "multiple_choice" && (
        <FormControl component="fieldset" fullWidth>
          {currentQuestion.answers.map((a) => (
            <FormControlLabel
              key={a.id}
              control={
                <Checkbox
                  checked={(answers[currentQuestion.id] || []).includes(a.id)}
                  onChange={handleMultipleChoiceChange(a.id)}
                  disabled={isCompleted}
                />
              }
              label={a.text + (isCompleted && a.is_user_answer ? " ✅" : "")}
            />
          ))}
        </FormControl>
      )}
      {currentQuestion.type === "text_answer" && (
        <FormControl fullWidth sx={{ mt: 2 }}>
          <TextField
            multiline
            minRows={1}
            value={answers[currentQuestion.id] || ""}
            onChange={handleTextChange}
            disabled={isCompleted}
            placeholder="Введите ваш ответ"
            variant="outlined"
            fullWidth
          />
        </FormControl>
      )}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {!isCompleted && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            variant="contained"
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
          >
            Назад
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                isLoading || (isBelbin && totalPoints !== 10) || isTimeUp
              }
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isLoading ? "Далее..." : "Далее"}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleFinish}
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isLoading ? "Завершение..." : "Завершить"}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TestSolver;
