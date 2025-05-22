import React, { useState } from "react";
import EmployeeTestList from "./EmployeeTestList";
import TestSolver from "./TestSolver";
import TestPreviewWithAnswers from "./TestPreviewWithAnswers";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const VIEW = {
  LIST: "list",
  SOLVER: "solver",
  PREVIEW: "preview",
};

const EmployeeTestManager = () => {
  const [viewMode, setViewMode] = useState(VIEW.LIST);
  const [selectedTest, setSelectedTest] = useState(null);

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setViewMode(VIEW.SOLVER);
  };

  const handlePreviewSelect = (test) => {
    setSelectedTest(test);
    setViewMode(VIEW.PREVIEW);
  };

  const handleBack = () => {
    setSelectedTest(null);
    setViewMode(VIEW.LIST);
  };

  return (
    <Box>
      {/* Кнопка назад (кроме списка) */}
      {viewMode !== VIEW.LIST && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Назад
          </Button>
        </Box>
      )}

      {/* Отображение в зависимости от режима */}
      {viewMode === VIEW.LIST && (
        <EmployeeTestList
          onTestSelect={handleTestSelect}
          setSelectPreviewTest={handlePreviewSelect}
        />
      )}

      {viewMode === VIEW.SOLVER && selectedTest && (
        <TestSolver test={selectedTest} />
      )}

      {viewMode === VIEW.PREVIEW && selectedTest && (
        <TestPreviewWithAnswers test={selectedTest} />
      )}
    </Box>
  );
};

export default EmployeeTestManager;
