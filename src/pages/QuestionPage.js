import React, { useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
} from "@mui/material";

const questions = [
  {
    text: "Какой язык используется для стилизации веб-страниц?",
    options: ["HTML", "CSS", "JavaScript", "Python"],
    correctAnswer: "CSS",
  },
  {
    text: "Что такое React?",
    options: [
      "Фреймворк для Python",
      "Библиотека для JavaScript",
      "Язык программирования",
      "СУБД",
    ],
    correctAnswer: "Библиотека для JavaScript",
  },
  {
    text: "Что такое JSX?",
    options: [
      "Стилизация в JavaScript",
      "Расширение JavaScript синтаксиса",
      "JSON формат",
      "Серверная технология",
    ],
    correctAnswer: "Расширение JavaScript синтаксиса",
  },
];

export default function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [showResult, setShowResult] = useState(false);

  const handleOptionChange = (event) => {
    const updatedAnswers = [...answers];
    updatedAnswers[activeStep] = event.target.value;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (activeStep < questions.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const getScore = () => {
    return answers.filter((ans, idx) => ans === questions[idx].correctAnswer)
      .length;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Вопрос {activeStep + 1} из {questions.length}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={((activeStep + 1) / questions.length) * 100}
        />
      </Box>

      {!showResult ? (
        <Card sx={{ backgroundColor: "#f4f4f8", p: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {questions[activeStep].text}
            </Typography>
            <RadioGroup
              value={answers[activeStep]}
              onChange={handleOptionChange}
            >
              {questions[activeStep].options.map((option, idx) => (
                <Box
                  key={idx}
                  sx={{
                    border: "1px solid",
                    borderColor:
                      answers[activeStep] === option
                        ? "primary.main"
                        : "transparent",
                    borderRadius: 2,
                    my: 1,
                    p: 1.5,
                    bgcolor: "#fff",
                    transition: "0.3s",
                    "&:hover": {
                      borderColor: "primary.light",
                    },
                  }}
                >
                  <FormControlLabel
                    value={option}
                    control={<Radio />}
                    label={<Typography>{option}</Typography>}
                    sx={{ width: "100%", m: 0 }}
                  />
                </Box>
              ))}
            </RadioGroup>
            <Box mt={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleNext}
                disabled={!answers[activeStep]}
                sx={{ textTransform: "none" }}
              >
                {activeStep === questions.length - 1 ? "Завершить" : "Далее"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mt: 4, p: 3 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Результат теста
            </Typography>
            <Typography>
              Вы правильно ответили на {getScore()} из {questions.length}{" "}
              вопросов.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
