import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Box,
  Divider,
  Avatar,
  CircularProgress,
} from "@mui/material";

const generateLoginAndPassword = ({
  employees,
  method,
  allEmployees,
  positions,
}) => {
  return employees
    .map(({ id }) => {
      const employee = allEmployees.find((e) => e.id === id);
      console.log(employee);
      if (!employee) return null;

      const login = `user${employee.id}_${Math.floor(
        100 + Math.random() * 900
      )}`;
      const password = Math.random().toString(36).slice(-8);

      const position = positions.find((p) => p.id === employee.position_id);

      return {
        id: employee.id,
        fullName: `${employee.last_name} ${employee.first_name} ${
          employee.middle_name || ""
        }`.trim(),
        username: login,
        password,
        email: employee.email || null,
        photo: employee.photo || "",
        positionTitle: position ? position.title : "",
        position_id: employee.position_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        type: "username_password",
      };
    })
    .filter(Boolean);
};

const GenerateAccountsDialog = ({
  open,
  onClose,
  employees,
  positions = [],
  onGenerate,
  isGenerating,
}) => {
  const [selected, setSelected] = useState({});
  const [search, setSearch] = useState("");
  const [generationMethod, setGenerationMethod] = useState("email_password");
  const getPhotoUrl = (photo) => {
    if (!photo) return null;

    if (typeof photo === "string") {
      if (photo.startsWith("data:image")) {
        return photo;
      }
      return `data:image/jpeg;base64,${photo}`;
    }

    if (photo instanceof File) {
      return URL.createObjectURL(photo); // Если это File объект
    }

    return null;
  };
  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const lower = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.first_name.toLowerCase().includes(lower) ||
        e.last_name.toLowerCase().includes(lower) ||
        (e.email && e.email.toLowerCase().includes(lower))
    );
  }, [search, employees]);

  const handleToggle = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Функция сброса формы
  const resetForm = () => {
    setSelected({});
    setSearch("");
    setGenerationMethod("email_password");
  };

  // Обёртка onClose — сброс и вызов пропса
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const selectedEmployees = Object.entries(selected)
      .filter(([_, checked]) => checked)
      .map(([id]) => ({ id: Number(id) }));
    if (selectedEmployees.length === 0) {
      alert("Выберите хотя бы одного сотрудника");
      return;
    }

    const results = generateLoginAndPassword({
      employees: selectedEmployees,
      method: generationMethod,
      allEmployees: employees,
      positions,
    });
    await onGenerate(results);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Генерация аккаунтов</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: 550, // фиксированная высота всего контента
        }}
      >
        {/* <Typography variant="subtitle1">Метод генерации аккаунтов:</Typography>
        <RadioGroup
          value={generationMethod}
          onChange={(e) => setGenerationMethod(e.target.value)}
          row
        >
          <FormControlLabel
            value="email_password"
            control={<Radio />}
            label="Почта и пароль"
          />
          <FormControlLabel
            value="username_password"
            control={<Radio />}
            label="Логин и пароль"
          />
        </RadioGroup> */}

        <Divider />

        <TextField
          fullWidth
          size="small"
          label="Поиск сотрудников"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Typography variant="subtitle1">Выберите сотрудников:</Typography>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            p: 1,
            backgroundColor: "#fafafa",
          }}
        >
          {filteredEmployees.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary">
                Сотрудники не найдены
              </Typography>
            </Box>
          ) : (
            filteredEmployees.map((emp) => {
              const photoUrl = getPhotoUrl(emp.photo);
              const isSelected = !!selected[emp.id];
              const position = positions?.find((p) => p.id === emp.position_id);
              let is_created = false;
              if (emp?.clerk_id && emp?.clerk_id.startsWith("user"))
                is_created = true;
              if (is_created) return;
              return (
                <Box
                  key={emp.id}
                  onClick={() => handleToggle(emp.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid #eee",
                    borderRadius: 1,
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? "primary.light"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isSelected ? "primary.light" : "#f5f5f5",
                    },
                    transition: "background-color 0.2s",
                  }}
                >
                  <Avatar
                    src={photoUrl}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  />
                  <Box>
                    <Typography fontWeight={500}>
                      {emp.last_name} {emp.first_name} {emp.middle_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {position?.title || "—"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {emp.email || "—"}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!Object.values(selected).some(Boolean) || isGenerating}
          startIcon={
            isGenerating ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isGenerating ? "Создание..." : "Сгенерировать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateAccountsDialog;
