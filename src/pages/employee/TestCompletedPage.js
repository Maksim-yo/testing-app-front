import React from "react";
import { Box, Typography, Button, Slide, Fade } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const TestCompletedPage = () => {
  const navigate = useNavigate();

  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 8,
          textAlign: "center",
          p: 4,
          boxShadow: 3,
          borderRadius: 4,
          backgroundColor: "white",
        }}
      >
        <Slide direction="down" in mountOnEnter unmountOnExit timeout={600}>
          <CheckCircleIcon sx={{ fontSize: 80, color: "green", mb: 2 }} />
        </Slide>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Тест завершён!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Ваши ответы были успешно сохранены. Спасибо за прохождение теста.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/")}
        >
          Вернуться на главную
        </Button>
      </Box>
    </Fade>
  );
};

export default TestCompletedPage;
