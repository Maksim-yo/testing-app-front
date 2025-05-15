import React, { useState } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import BelbinSlider from "./BelbinSlider";

export const BelbinQuestion = ({ question }) => {
  const [answers, setAnswers] = useState(
    question.answers.map(() => 0) // Инициализируем ответы для текущего вопроса
  );
  const [totalPoints, setTotalPoints] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSliderChange = (index) => (event, newValue) => {
    const newAnswers = [...answers];
    newAnswers[index] = newValue;

    const sum = newAnswers.reduce((a, b) => a + b, 0);
    if (sum > 10) return;

    setAnswers(newAnswers);
    setTotalPoints(sum);
    setError("");
  };

  const handleNext = () => {
    if (totalPoints !== 10) {
      setError("Необходимо распределить ровно 10 баллов");
      return;
    }
    navigate("/belbin-result", { state: { answers } });
  };

  const progress = (1 / 1) * 100; // Всего один вопрос
  const current = question;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, fontFamily: "Arial" }}>
      {/* <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        УЧАСТИЕ В СОВМЕСТНОМ ПРОЕКТЕ:
      </Typography> */}

      {/* Прогресс-бар */}
      {/* <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Typography variant="body2" sx={{ minWidth: 50 }}>
          Вопрос 1 из 1
        </Typography>
      </Box> */}

      {/* Вопрос */}
      {/* <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        1. {current.text}
      </Typography> */}

      {/* <Typography variant="subtitle1" sx={{ mb: 2, color: "#555" }}>
        Распределите 10 баллов между вариантами ответов:
      </Typography> */}

      {/* Ответы */}
      <Box sx={{ mb: 4 }}>
        {current.answers.map((option, index) => (
          <FormControl key={index} fullWidth sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <BelbinSlider
                index={index}
                value={answers[index]}
                handleSliderChange={handleSliderChange}
                totalPoints={totalPoints}
                marks={[...Array(11)].map((_, i) => ({
                  value: i,
                  label: String(i),
                }))}
                limit={8}
                max={10}
                answerOption={option.text}
              />
            </Box>
          </FormControl>
        ))}
      </Box>

      {/* Баллы и ошибки */}
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

      {/* Кнопки */}
      {/* <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={totalPoints !== 10}
          sx={{ minWidth: 120 }}
        >
          Завершить тест
        </Button>
      </Box> */}
    </Box>
  );
};
