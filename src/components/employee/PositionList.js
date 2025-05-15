import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import PositionForm from "./PositionForm";
import { useDeletePositionMutation } from "../../app/api";

const PositionsList = ({ positions }) => {
  const [openForm, setOpenForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletePositionId, setDeletePositionId] = useState(null);
  const [deletePosition, { isLoading: isDeleting }] =
    useDeletePositionMutation();
  const handleOpenForm = (position = null) => {
    setEditingPosition(position);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingPosition(null);
  };

  const handleDelete = async (position) => {
    await deletePosition(deletePositionId);
    setOpenDeleteDialog(false);
  };
  const handleDeleteDialog = (position) => {
    // TODO: здесь вызывается API для удаления аккаунта
    setDeletePositionId(position.id);
    setOpenDeleteDialog(true);
  };
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Список должностей</Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenForm()}
        >
          Добавить должность
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          height: 500,
          overflowY: "auto",
          position: "relative", // Для абсолютного позиционирования сообщения
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {positions.length > 0 ? (
              positions.map((position, index) => (
                <TableRow key={position.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{position.title}</TableCell>
                  <TableCell>{position.description}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenForm(position)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteDialog(position)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Пустая строка для сохранения структуры таблицы
              <></>
            )}
          </TableBody>
        </Table>

        {/* Сообщение о пустом списке */}
        {positions.length === 0 && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              textAlign: "center",
              pointerEvents: "none", // Чтобы можно было кликать сквозь сообщение
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "text.disabled",
                fontStyle: "italic",
              }}
            >
              Должности не найдены
            </Typography>
          </Box>
        )}
      </TableContainer>

      <PositionForm
        open={openForm}
        onClose={handleCloseForm}
        handleCloseForm={handleCloseForm}
        initialData={editingPosition}
      />
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Удаление аккаунта</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить аккаунт? Это действие необратимо.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Отмена</Button>
          <Button
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
            startIcon={
              isDeleting ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PositionsList;
