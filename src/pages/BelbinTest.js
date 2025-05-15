import React, { useState } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Slider,
  FormControl,
  FormLabel,
  styled,
} from "@mui/material";
import { brown } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import BelbinSlider from "../components/test/BelbinSlider";
const marks = [
  {
    value: 0,
    label: "0",
  },
  {
    value: 1,
    label: "1",
  },
  {
    value: 2,
    label: "2",
  },
  {
    value: 3,
    label: "3",
  },
  {
    value: 4,
    label: "4",
  },
  {
    value: 5,
    label: "5",
  },
  {
    value: 6,
    label: "6",
  },
  {
    value: 7,
    label: "7",
  },
  {
    value: 8,
    label: "8",
  },

  {
    value: 9,
    label: "9",
  },
  {
    value: 10,
    label: "10",
  },
];

const BelbinTest = () => {
  const questions = [
    "Я умею влиять на людей, не оказывая на них давления.",
    "Врожденная осмотрительность предохраняет меня от ошибок, возникающих из-за невнимательности.",
    "Я готов оказать давление, чтобы совещание не превращалось в пустую трату времени.",
    "Можно рассчитывать на поступление от меня оригинальных предложений.",
    "Я всегда готов поддержать любое предложение, если оно служит общим интересам.",
    "Я энергично ищу среди новых идей и разработок свежайшие.",
  ];

  const answerOptions = [
    "Совершенно не согласен",
    "Скорее не согласен",
    "Затрудняюсь ответить",
    "Скорее согласен",
    "Полностью согласен",
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(
    Array(questions.length).fill([0, 0, 0, 0, 0])
  );
  const [totalPoints, setTotalPoints] = useState(0);
  const [error, setError] = useState("");

  const handleSliderChange = (index) => (event, newValue) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = [...newAnswers[currentQuestion]];
    newAnswers[currentQuestion][index] = newValue;
    // console.log(newValue);
    setValue(newValue);
    // Проверяем, чтобы сумма не превышала 10
    const sum = newAnswers[currentQuestion].reduce((a, b) => a + b, 0);
    if (sum > 10) {
      return;
    }

    setAnswers(newAnswers);
    setTotalPoints(sum);
    setError("");
  };

  const handleNext = () => {
    if (totalPoints !== 10) {
      setError("Необходимо распределить ровно 10 баллов");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTotalPoints(answers[currentQuestion + 1].reduce((a, b) => a + b, 0));
      setError("");
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setTotalPoints(answers[currentQuestion - 1].reduce((a, b) => a + b, 0));
      setError("");
    }
  };
  const [value, setValue] = useState(5); // Начальное значение ползунка

  const limit = 8;
  const max = 10;
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const getTrackBackground = (value, limit, max) => {
    const left = (value / max) * 100;
    const points = 10 - totalPoints;
    const middle = ((value + points) / max) * 100;

    if (totalPoints === 10 && value === 0) {
      return "white"; // Голубой цвет для начальной позиции
    }
    console.log(left, middle, value, max);

    // Если текущее значение до лимита
    return `linear-gradient(
      to right,
      #00bcd4 0% ${left}%,
      #ffc107 ${left}% ${middle}%,
      white ${middle}% 100%
    )`;
  };

  const navigate = useNavigate();
  console.log(answers);
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, fontFamily: "Arial" }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        УЧАСТИЕ В СОВМЕСТНОМ ПРОЕКТЕ:
      </Typography>

      {/* Прогресс-бар и счетчик */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Typography variant="body2" sx={{ minWidth: 50 }}>
          Вопрос {currentQuestion + 1} из {questions.length}
        </Typography>
      </Box>

      {/* Текущий вопрос */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        {currentQuestion + 1}. {questions[currentQuestion]}
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 2, color: "#555" }}>
        Распределите 10 баллов между вариантами ответов:
      </Typography>

      {/* Шкалы оценки для каждого варианта ответа */}
      <Box sx={{ mb: 4 }}>
        {answerOptions.map((option, index) => (
          <FormControl key={index} fullWidth sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <BelbinSlider
                key={index}
                index={index}
                value={answers[currentQuestion][index]}
                handleSliderChange={handleSliderChange}
                totalPoints={totalPoints}
                marks={marks}
                limit={limit}
                max={max}
                answerOption={option.text}
              />
            </Box>
          </FormControl>
        ))}
      </Box>

      {/* Счетчик баллов */}
      <Typography
        variant="body1"
        sx={{
          mb: 2,
          fontWeight: "bold",
          color:
            totalPoints === 10 ? "green" : totalPoints > 10 ? "red" : "inherit",
        }}
      >
        Распределено баллов: {totalPoints}/10
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Навигация */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="contained"
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          sx={{ minWidth: 120 }}
        >
          Назад
        </Button>

        {currentQuestion < questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={totalPoints !== 10}
            sx={{ minWidth: 120 }}
          >
            Далее
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            disabled={totalPoints !== 10}
            sx={{ minWidth: 120 }}
            onClick={() => navigate("/belbin-result", { state: { answers } })}
          >
            Завершить тест
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BelbinTest;
