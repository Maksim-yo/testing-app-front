import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

export const TestSettingsDilog = ({
  initialTest,
  settingsOpen,
  setSettingsOpen,
  onSave,
  testSettings,
}) => {
  const [minOptions, setMinOptions] = useState(testSettings.min_questions);
  const [belbinBlocks, setBelbinBlocks] = useState(testSettings.belbin_block);
  const [belbinOptionsPerBlock, setBelbinOptionsPerBlock] = useState(
    testSettings.belbin_questions_in_block
  );
  const [hasTimeLimit, setHasTimeLimit] = useState(
    testSettings.has_time_limit || false
  );

  const handleSave = () => {
    onSave({
      min_questions: minOptions,
      belbin_block: belbinBlocks,
      belbin_questions_in_block: belbinOptionsPerBlock,
      has_time_limit: hasTimeLimit,
      id: initialTest.id,
    });
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
          label="Минимальное количество вариантов ответа"
          type="number"
          fullWidth
          value={minOptions}
          onChange={(e) => setMinOptions(Math.max(0, Number(e.target.value)))}
          inputProps={{ min: 0 }}
          sx={{ mt: 1 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={hasTimeLimit}
              onChange={(e) => setHasTimeLimit(e.target.checked)}
            />
          }
          label="Ограничить по времени"
          sx={{ mt: 2 }}
        />

        {/* Тест Белбина */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
          Тест Белбина
        </Typography>
        <TextField
          label="Количество блоков"
          type="number"
          fullWidth
          value={belbinBlocks}
          onChange={(e) => setBelbinBlocks(Math.max(0, Number(e.target.value)))}
          inputProps={{ min: 0 }}
          sx={{ mt: 1 }}
        />
        <TextField
          label="Количество вопросов в блоке"
          type="number"
          fullWidth
          value={belbinOptionsPerBlock}
          onChange={(e) =>
            setBelbinOptionsPerBlock(Math.max(0, Number(e.target.value)))
          }
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
