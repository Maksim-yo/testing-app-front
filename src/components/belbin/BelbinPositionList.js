import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useSelector } from "react-redux";

export const BelbinPositionList = ({ positions, onEdit, onDelete }) => {
  return (
    <>
      {positions.length === 0 ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            color="text.secondary"
            variant="h6"
            sx={{
              color: "text.disabled",
              fontStyle: "italic",
            }}
          >
            Позиции не найдены
          </Typography>
        </Box>
      ) : (
        positions.map((position) => (
          <Paper sx={{ p: 2, mb: 2 }} key={position.position_id}>
            <Typography variant="h6">{position.position_title}</Typography>
            <Typography variant="body2">
              Коэффициенты:
              {position.requirements.map((req) => (
                <div key={req.id}>
                  Роль: {req.role_name} — Мин. балл: {req.min_score}
                  {req.is_key && "(Ключевая роль)"}
                </div>
              ))}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button variant="outlined" onClick={() => onEdit(position)}>
                Редактировать
              </Button>
              <Button
                variant="outlined"
                onClick={() => onDelete(position.position_id)}
              >
                Удалить
              </Button>
            </Box>
          </Paper>
        ))
      )}
    </>
  );
};
