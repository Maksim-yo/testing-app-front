import React, { useState } from "react";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import { useUser } from "@clerk/clerk-react";
import TestList from "../components/test/TestsList";
import { TestEditor } from "../components/test/TestEditor";
import { TestManager } from "../components/test/TestManager";
export const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  // if (!user || user.publicMetadata?.role !== "admin") {
  //   return (
  //     <Container maxWidth="md" sx={{ mt: 4 }}>
  //       <Typography variant="h5" color="error">
  //         Доступ запрещён. Требуются права администратора.
  //       </Typography>
  //     </Container>
  //   );
  // }

  const handleSaveTest = async (newTest) => {
    setIsLoading(true);
    try {
      // Здесь будет запрос к API для сохранения теста
      setTests([...tests, newTest]);
      alert(`Тест "${newTest.title}" успешно сохранён!`);
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4, mb: 4, width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Панель администратора
      </Typography>

      {<TestManager />}
    </Box>
  );
};
