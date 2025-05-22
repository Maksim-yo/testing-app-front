import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  IconButton,
  Typography,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Delete,
  Add,
  Image,
  Close,
  Co2Sharp,
  QuestionMarkSharp,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { Snackbar, Alert } from "@mui/material";
import { useGetBelbinRolesQuery } from "../../app/api";
export const QuestionEditor = ({
  settings,
  setTestSettings,
  question,
  onChange,
  onDelete,
  belbinCount,
}) => {
  const [newOption, setNewOption] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const questionImageRef = useRef();
  const optionImageRefs = useRef({});
  const { data: roles } = useGetBelbinRolesQuery(); // предполагаю, что у тебя есть rolesSlice
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });
  const handleBelbinQuestion = (value) => {
    if (belbinCount == settings.belbinBlocks && value === true) {
      setSnackbar({
        open: true,
        message: `Вы не можете добавить больше ${settings.belbinBlocks} блоков Белбина. Измените в настройках при необходимости`,
      });
      return;
    }
    onChange({
      ...question,
      isBelbin: value,
      question_type: "belbin",
    });
  };
  const handleAddOption = () => {
    if (question.question_type === "text_answer") {
      onChange({
        ...question,
        answers: [
          ...question.answers,
          {
            text: newOption.trim(),
            is_correct: true,
            image: null,
            role: "", // добавим поле role
          },
        ],
      });
      return;
    }
    if (newOption.trim()) {
      onChange({
        ...question,
        answers: [
          ...question.answers,
          {
            text: newOption.trim(),
            is_correct: false,
            image: null,
            role: "", // добавим поле role
          },
        ],
      });
      setNewOption("");
    } else {
      setSnackbar({
        open: true,
        message: `Варианты вопросов не могут быть пустыми`,
      });
    }
  };

  const handleImageUpload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleQuestionImageChange = (e) => {
    handleImageUpload(e.target.files[0], (image) => {
      onChange({ ...question, image });
    });
    question.answers = [
      {
        text: newOption.trim(),
        is_correct: true,
        image: null,
        role: "", // добавим поле role}];
      },
    ];
    onChange({ ...question });
  };
  const handleQuestionTypeChange = (e) => {
    if (e.target.value === "text_answer") {
      const answer = [
        {
          text: newOption.trim(),
          is_correct: true,
          image: null,
          role: "", // добавим поле role}];
        },
      ];
      onChange({ ...question, question_type: e.target.value, answers: answer });
    } else {
      const answers = question.answers.map((a, i) => ({
        ...a,
        is_correct: false,
      }));
      onChange({
        ...question,
        question_type: e.target.value,
        answers: answers,
      });
    }
  };
  const handleOptionImageChange = (index, e) => {
    handleImageUpload(e.target.files[0], (image) => {
      const newOptions = question.answers.map((opt, i) =>
        i === index ? { ...opt, image } : opt
      );
      onChange({ ...question, answers: newOptions });
    });
  };
  const removeQuestionImage = () => {
    onChange({ ...question, image: null });
  };

  const removeOptionImage = (index) => {
    const newOptions = question.answers.map((opt, i) =>
      i === index ? { ...opt, image: null } : opt
    );
    onChange({ ...question, answers: newOptions });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = question.answers.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    );
    onChange({ ...question, answers: newOptions });
  };

  const handleToggleCorrect = (index) => {
    let newOptions;
    if (question.question_type === "single_choice") {
      newOptions = question.answers.map((opt, i) => ({
        ...opt,
        is_correct: i === index,
      }));
    } else {
      newOptions = question.answers.map((opt, i) =>
        i === index ? { ...opt, is_correct: !opt.is_correct } : opt
      );
    }
    onChange({ ...question, answers: newOptions });
  };
  const openRoleDialog = (index) => {
    setSelectedOptionIndex(index);
    setSelectedRole(question.answers[index].role || null);
    setRoleDialogOpen(true);
  };

  const handleConfirmRole = () => {
    if (selectedOptionIndex !== null && selectedRole !== null) {
      const newOptions = question.answers.map((opt, i) =>
        i === selectedOptionIndex ? { ...opt, role: selectedRole } : opt
      );
      onChange({ ...question, answers: newOptions });
    }
    setRoleDialogOpen(false);
  };
  const handlePointsChange = (e) => {
    const points = parseInt(e.target.value) || 0;
    onChange({ ...question, points });
  };
  const handleCloseDialog = () => {
    setRoleDialogOpen(false);
  };
  return (
    <Box
      sx={{
        p: 3,
        border: "1px solid #ddd",
        borderRadius: 2,
        mb: 3,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <TextField
          label="Текст вопроса"
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          fullWidth
        />
        {!question.isBelbin && (
          <>
            <TextField
              label="Баллы за вопрос"
              type="number"
              value={question.points || 1}
              onChange={handlePointsChange}
              sx={{ width: 120, ml: 2 }}
              inputProps={{ min: 0 }}
            />
            <FormControl sx={{ minWidth: 200, ml: 2 }}>
              <InputLabel id="question-type-label">Тип вопроса</InputLabel>
              <Select
                labelId="question-type-label"
                value={question.question_type || "single_choice"}
                label="Тип вопроса"
                onChange={(e) => handleQuestionTypeChange(e)}
              >
                <MenuItem value="single_choice" default>
                  Одиночный выбор
                </MenuItem>
                <MenuItem value="multiple_choice">Множественный выбор</MenuItem>
                <MenuItem value="text_answer">Текстовый ответ</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        <IconButton
          onClick={onDelete}
          color="error"
          sx={{ ml: 2 }}
          title="Удалить вопрос"
        >
          <Delete />
        </IconButton>
      </Box>
      {/* Варианты ответов */}
      {question?.answers?.map((option, index) => (
        <Box
          key={index}
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid #eee",
            borderRadius: 1,
            backgroundColor: "white",
          }}
        >
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
            {question.question_type !== "text_answer" && (
              <Checkbox
                sx={{
                  visibility: question.isBelbin ? "hidden" : "visible",
                  pointerEvents: question.isBelbin ? "none" : "auto",
                }}
                checked={option.is_correct}
                onChange={() => handleToggleCorrect(index)}
                color="primary"
              />
            )}
            <TextField
              value={option.text}
              onChange={(e) =>
                handleOptionChange(index, "text", e.target.value)
              }
              variant="outlined"
              size="small"
              sx={{ flexGrow: 1, minWidth: 200 }}
            />

            {/* {option.image ? (
              <Box position="relative" sx={{ width: 56, height: 56 }}>
                <Avatar
                  src={option.image}
                  sx={{ width: 56, height: 56, cursor: "pointer" }}
                  onClick={() => optionImageRefs.current[index].click()}
                />
                <IconButton
                  onClick={() => removeOptionImage(index)}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                onClick={() => optionImageRefs.current[index].click()}
              >
                <Image />
              </IconButton>
            )} */}

            <input
              type="file"
              ref={(el) => (optionImageRefs.current[index] = el)}
              onChange={(e) => handleOptionImageChange(index, e)}
              accept="image/*"
              style={{ display: "none" }}
            />

            <IconButton
              onClick={() => {
                const newOptions = [...question.answers];
                newOptions.splice(index, 1);
                onChange({ ...question, answers: newOptions });
              }}
            >
              <Delete />
            </IconButton>
          </Box>

          {/* Кнопка роли */}
          <Box
            display="flex"
            justifyContent="flex-end"
            mt={1}
            sx={{
              visibility: question.isBelbin ? "visible" : "hidden",
              pointerEvents: question.isBelbin ? "auto" : "none",
              opacity: question.isBelbin ? 1 : 0.4, // можно убрать или оставить
            }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={() => openRoleDialog(index)}
            >
              {option.role ? `Роль: ${option.role.name}` : "Добавить роль"}
            </Button>
          </Box>
        </Box>
      ))}
      {/* Диалог выбора роли */}
      <Dialog
        open={roleDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Выберите роль
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <List>
            {roles?.map((role) => (
              <ListItem key={role.id} disablePadding>
                <ListItemButton onClick={() => setSelectedRole(role)}>
                  <Checkbox
                    edge="start"
                    checked={selectedRole?.id === role.id}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText primary={role.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Отмена
          </Button>
          <Button
            onClick={handleConfirmRole}
            variant="contained"
            disabled={!selectedRole}
          >
            ОК
          </Button>
        </DialogActions>
      </Dialog>
      {/* Добавление нового варианта ответа */}
      <Box display="flex" mt={2}>
        <TextField
          fullWidth
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          label="Новый вариант ответа"
          variant="outlined"
          size="small"
        />
        <Button
          onClick={handleAddOption}
          startIcon={<Add />}
          sx={{ ml: 1 }}
          variant="contained"
        >
          Добавить
        </Button>
      </Box>

      <Box mt={2}>
        <FormControlLabel
          control={
            <Switch
              checked={question.isBelbin}
              onChange={(e) => handleBelbinQuestion(e.target.checked)}
            />
          }
          label="Вопрос участвует в тесте Белбина"
          sx={{ display: "block" }} // Это свойство заставит переключатель начать с новой строки
        />
      </Box>
    </Box>
  );
};
