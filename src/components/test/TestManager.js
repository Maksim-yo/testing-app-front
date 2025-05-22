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
import { useUpdateTestMutation, useCreateTestMutation } from "../../app/api";
function parseRawTest(raw) {
  const questions = [];
  const belbin_questions = [];
  console.log(raw);
  raw.questions.forEach((q, index) => {
    if (q.isBelbin) {
      // Создаем один вопрос
      const belbin_question = {
        text: q.text, // общий текст вопроса
        block_number: index + 1,
        order: index,
        answers: [], // массив вариантов ответа
      };

      q.answers.forEach((a) => {
        if (a.role && a.role.id) {
          belbin_question.answers.push({
            text: a.text,
            role_id: a.role.id,
          });
        }
      });

      belbin_questions.push(belbin_question);
    } else {
      questions.push({
        text: q.text,
        question_type: q.question_type,
        image: q.image,
        order: index,
        points: q.points,
        answers: q.answers.map((a) => ({
          text: a.text,
          is_correct: a.is_correct,
          image: a.image,
        })),
      });
    }
  });

  return {
    title: raw.title || "Без названия",
    description: raw.description || "",
    is_active: true,
    end_date: raw.end_date,
    image: raw.image,
    id: raw.id || "new",
    questions,
    belbin_questions,
    test_settings: raw.test_settings,
    status: raw.status || "draft",
    time_limit_minutes: raw.time_limit_minutes,
  };
}

export const TestManager = () => {
  const [mode, setMode] = useState("list"); // 'list' или 'edit'
  const [currentTest, setCurrentTest] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTest, setPreviewTest] = useState(null);
  const dispatch = useDispatch();
  const [successOpen, setSuccessOpen] = useState(false);
  const [createTest] = useCreateTestMutation();
  const [updateTest] = useUpdateTestMutation();
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
    setCurrentTest(test);
    setMode("edit");
  };

  const checkTestSettings = (test) => {};

  const handleSave = async (updatedTest) => {
    setMode("list");

    try {
      const parsedTest = parseRawTest(updatedTest);

      const response =
        updatedTest.id === "new"
          ? await createTest(parsedTest)
          : await updateTest(parsedTest);

      // RTK Query mutation вернёт объект с error, если была ошибка
      if (response.error) {
        const detail = response.error.data?.detail;
        let message = "Ошибка при сохранении теста.";

        if (typeof detail === "string") {
          message = detail;
        } else if (detail?.message) {
          message = detail.message;
        } else if (detail?.error_message) {
          message = detail.error_message;
        }

        handleShowError(message);
        return;
      }

      handleShowSuccess();
    } catch (err) {
      console.error("Ошибка сохранения:", err);
      handleShowError("Неизвестная ошибка при сохранении теста.");
    }
  };

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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled">
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
          onSave={handleSave}
          onCancel={handleCancel}
          onPreview={handlePreview}
          saveSettings={updateSettings}
          triggerBack={triggerEditorBack}
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
