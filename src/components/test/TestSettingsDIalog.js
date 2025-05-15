import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
export const TestSettingsDilog = ({
  initialTest,
  settingsOpen,
  setSettingsOpen,
  onSave,
  testSettings,
}) => {
  const [minOptions, setMinOptions] = useState(testSettings.min_questions);
  //   const [maxOptions, setMaxOptions] = useState(testSettings.maxOptions);
  const [belbinBlocks, setBelbinBlocks] = useState(testSettings.belbin_block);
  const [belbinOptionsPerBlock, setBelbinOptionsPerBlock] = useState(
    testSettings.belbin_questions_in_block
  );

  const handleSave = () => {
    onSave({
      min_questions: minOptions,
      belbin_block: belbinBlocks,
      belbin_questions_in_block: belbinOptionsPerBlock,
    }); // 👈 передаем все настройки родителю
    setSettingsOpen(false);
  };

  return (
    <Dialog
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      fullWidth
    >
      <DialogTitle>Настройки теста</DialogTitle>
      <DialogContent>
        {/* Обычные тесты */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
          Обычный тест
        </Typography>
        <TextField
          label="Минимальное количество варинатов ответа"
          type="number"
          fullWidth
          value={minOptions}
          onChange={(e) => {
            const val = Math.max(0, Number(e.target.value));
            setMinOptions(val);
          }}
          inputProps={{ min: 0 }}
          sx={{ mt: 1 }}
        />
        {/* <TextField
          label="Максимальное количество вариантов ответа"
          type="number"
          fullWidth
          value={maxOptions}
          onChange={(e) => {
            const val = Math.max(0, Number(e.target.value));
            setMaxOptions(val);
          }}
          inputProps={{ min: 0 }}
          sx={{ mt: 2 }}
        /> */}

        {/* Тест Белбина */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
          Тест Белбина
        </Typography>
        <TextField
          label="Количество блоков"
          type="number"
          fullWidth
          value={belbinBlocks}
          onChange={(e) => {
            const val = Math.max(0, Number(e.target.value));
            // onSave({ ...initialTest, belbinBlocks: val });
            setBelbinBlocks(val);
          }}
          inputProps={{ min: 0 }}
          sx={{ mt: 1 }}
        />
        <TextField
          label="Количество вопросов в блоке"
          type="number"
          fullWidth
          value={belbinOptionsPerBlock}
          onChange={(e) => {
            const val = Math.max(0, Number(e.target.value));
            setBelbinOptionsPerBlock(val);
            // onSave({ ...initialTest, belbinQuestionsPerBlock: val });
          }}
          inputProps={{ min: 0 }}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSettingsOpen(false)}>Отмена</Button>
        <Button onClick={handleSave} variant="contained">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
