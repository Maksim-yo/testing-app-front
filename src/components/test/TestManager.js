import React, { useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import TestList from "./TestsList";
import { TestEditor } from "./TestEditor";
import TestPreviewDialog from "./TestPreviewDialog";
import { useSelector, useDispatch } from "react-redux";
import { addTest, updateTest, updateSettings } from "../../slices/testSlice";
import { Snackbar, Alert } from "@mui/material";
import TestStatsPage from "./TestsStatPage";
import BackButton from "./BackButton";

export const TestManager = () => {
  const [mode, setMode] = useState("list"); // 'list' или 'edit'
  const [currentTest, setCurrentTest] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTest, setPreviewTest] = useState(null);
  const dispatch = useDispatch();
  const [successOpen, setSuccessOpen] = useState(false);

  const [triggerEditorBack, setTriggerEditorBack] = useState(false);

  const handleShowSuccess = () => {
    setSuccessOpen(true);
  };

  const handleCloseSuccess = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccessOpen(false);
  };
  const handleCreate = () => {
    setCurrentTest({ id: "new", title: "", questions: [] });
    setMode("edit");
  };
  const handleShowError = (message) => {
    setErrorMessage(message);
    setErrorOpen(true);
  };

  // Закрытие snackbar ошибки
  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") return;
    setErrorOpen(false);
  };

  const handlePreview = (test) => {
    console.log(test);
    setPreviewTest(test);
    setPreviewOpen(true);
  };
  const handleEdit = (test) => {
    if (test.status === "active") {
      setErrorMessage(
        "Необходимо сменить статус теста на 'Неактивен' для редактирования"
      );
      setErrorOpen(true);
      return;
    }
    setCurrentTest(test);
    setMode("edit");
  };

  const checkTestSettings = (test) => {};

  const handleCancel = () => {
    setMode("list");
  };

  const onClick = (test) => {
    setCurrentTest(test);
    setMode("stats");
  };
  const handleBack = () => {
    if (mode === "edit") {
      setTriggerEditorBack(true);
    } else {
      setMode("list");
    }
  };

  const addQuestion = () => {};
  return (
    <Box sx={{ width: "100%" }}>
      {mode !== "list" && (
        <BackButton onBack={handleBack} label="К списку тестов" />
      )}

      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseError} severity="warning">
          {errorMessage}
        </Alert>
      </Snackbar>

      {mode === "list" && (
        <TestList
          onCreate={handleCreate}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onClick={onClick}
        />
      )}
      {mode === "edit" && (
        <TestEditor
          initialTest={currentTest}
          onCancel={handleCancel}
          onPreview={handlePreview}
          saveSettings={updateSettings}
          triggerBack={triggerEditorBack}
          backToList={() => setMode("list")}
          resetTriggerBack={() => setTriggerEditorBack(false)}
        />
      )}
      {mode === "stats" && <TestStatsPage test={currentTest} />}

      <TestPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        test={previewTest}
      />
    </Box>
  );
};
