import React, { useEffect } from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { brown } from "@mui/material/colors";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

const BelbinResults = ({ answers }) => {
  const { width, height } = useWindowSize();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = React.useState(true);

  // Здесь должна быть логика расчета результатов на основе answers
  // Для примера просто выведем фиктивные данные
  const roles = [
    { name: "Председатель", score: 45 },
    { name: "Формирователь", score: 38 },
    { name: "Мыслитель", score: 42 },
    { name: "Исполнитель", score: 35 },
    { name: "Разведчик", score: 40 },
    { name: "Оценщик", score: 32 },
    { name: "Коллективист", score: 28 },
    { name: "Доводчик", score: 30 },
  ];

  // Сортируем роли по убыванию баллов
  const sortedRoles = [...roles].sort((a, b) => b.score - a.score);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000); // Отключаем конфетти через 8 секунд

    return () => clearTimeout(timer);
  }, []);

  const handleRetakeTest = () => {
    navigate("/belbin-test");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}

      <Box
        sx={{
          textAlign: "center",
          mb: 4,
          p: 3,
          borderRadius: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            mb: 3,
            fontWeight: "bold",
            color: brown[800],
            textTransform: "uppercase",
          }}
        >
          Поздравляем!
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Вы успешно завершили тест Белбина
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Ниже представлены ваши результаты. Они помогут определить ваши сильные
          стороны в командной работе.
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              backgroundColor: brown[100],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `5px solid ${brown[300]}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <Typography
              variant="h2"
              sx={{ fontWeight: "bold", color: brown[800] }}
            >
              {sortedRoles[0].score}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Ваша основная роль: {sortedRoles[0].name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          {getRoleDescription(sortedRoles[0].name)}
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
        >
          Все результаты
        </Typography>

        {sortedRoles.map((role, index) => (
          <Box
            key={role.name}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              backgroundColor: index < 3 ? brown[50] : "transparent",
              borderLeft: `4px solid ${
                index === 0
                  ? brown[500]
                  : index === 1
                  ? brown[400]
                  : index === 2
                  ? brown[300]
                  : "transparent"
              }`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {role.name}
            </Typography>
            <Box
              sx={{
                width: "60%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: `${role.score}%`,
                  height: 20,
                  backgroundColor:
                    index === 0
                      ? brown[500]
                      : index === 1
                      ? brown[400]
                      : index === 2
                      ? brown[300]
                      : brown[200],
                  borderRadius: 10,
                  mr: 2,
                }}
              />
              <Typography variant="body1" sx={{ minWidth: 40 }}>
                {role.score}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: brown[600],
            "&:hover": { backgroundColor: brown[700] },
            px: 4,
            py: 2,
            fontSize: "1.1rem",
          }}
          onClick={handleRetakeTest}
        >
          Пройти тест еще раз
        </Button>
      </Box>
    </Container>
  );
};

// Вспомогательная функция для описания ролей
function getRoleDescription(roleName) {
  const descriptions = {
    Председатель:
      "Вы умеете четко формулировать цели, продвигать решения, делегировать полномочия. Способны объективно оценить потенциал каждого члена команды.",
    Формирователь:
      "Вы динамичны, решительны, умеете преодолевать инертность. Можете эффективно реагировать на изменения и находить нестандартные решения.",
    Мыслитель:
      "Вы обладаете высоким интеллектом, креативностью, способны генерировать оригинальные идеи и решать сложные проблемы.",
    Исполнитель:
      "Вы дисциплинированы, надежны, консервативны. Умеете эффективно воплощать идеи в практические действия.",
    Разведчик:
      "Вы общительны, энтузиастичны, любознательны. Умеете устанавливать контакты и исследовать новые возможности.",
    Оценщик:
      "Вы обладаете стратегическим мышлением, проницательностью, объективностью. Умеете анализировать варианты и принимать взвешенные решения.",
    Коллективист:
      "Вы дипломатичны, чутки, отзывчивы. Умеете предотвращать разногласия и создавать гармоничную атмосферу в команде.",
    Доводчик:
      "Вы добросовестны, обязательны, внимательны к деталям. Умеете доводить дела до завершения, избегая ошибок и упущений.",
  };

  return descriptions[roleName] || "Описание роли не найдено.";
}

export default BelbinResults;
