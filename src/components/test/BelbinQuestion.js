import React, { useState, useEffect } from "react";
import { Box, Typography, FormControl, Grid, Button } from "@mui/material";
import BelbinSlider from "./BelbinSlider";
import { useGetBelbinRolesQuery } from "../../app/api";
export const BelbinQuestion = ({ question, isEditable = true }) => {
  const initialScores = question.answers.map((a) => a.score ?? 0);
  const [answers, setAnswers] = useState(initialScores);
  const [totalPoints, setTotalPoints] = useState(
    initialScores.reduce((sum, val) => sum + val, 0)
  );
  const { data: belbinRoles } = useGetBelbinRolesQuery();

  useEffect(() => {
    // Обновляем баллы, если переданный question изменился
    const newScores = question.answers.map((a) => a.user_score ?? 0);
    console.log(question);
    console.log(newScores);

    setAnswers(newScores);
    setTotalPoints(newScores.reduce((sum, val) => sum + val, 0));
  }, [question]);

  const handleSliderChange = (index) => (event, newValue) => {
    if (!isEditable) return;

    const newAnswers = [...answers];
    newAnswers[index] = newValue;

    const sum = newAnswers.reduce((a, b) => a + b, 0);
    if (sum > 10) return;

    setAnswers(newAnswers);
    setTotalPoints(sum);
  };
  const getRoleName = (roleId) => {
    return belbinRoles?.find((role) => role.id === roleId)?.name || "Без роли";
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      {question.answers.map((option, index) => (
        <FormControl key={index} fullWidth sx={{ mb: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={9}>
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
                disabled={!isEditable}
              />
            </Grid>
            {option?.role_id && (
              <Grid item xs={3}>
                <Button
                  variant="outlined"
                  sx={{
                    disabled: true,
                    "&:hover": {
                      backgroundColor: "transparent", // или любой другой цвет
                      boxShadow: "none",
                    },
                  }}
                >
                  Роль: {getRoleName(option.role_id)}
                </Button>
              </Grid>
            )}
          </Grid>
        </FormControl>
      ))}
      <Typography
        variant="body1"
        sx={{
          mt: 2,
          fontWeight: "bold",
          color:
            totalPoints === 10 ? "green" : totalPoints > 10 ? "red" : "inherit",
        }}
      >
        {isEditable && `Распределено баллов: ${totalPoints}/10`}
      </Typography>
    </Box>
  );
};
