import React from "react";
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
} from "@mui/material";
import { Add, Edit, Delete, Preview } from "@mui/icons-material";
const BelbinRolesList = ({
  roles,
  onAddRole,
  onEditRole,
  onDeleteRole,
  onPreviewTest,
}) => {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Роли Белбина</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Preview />}
            sx={{ mr: 1 }}
            onClick={onPreviewTest}
          >
            Предпросмотр теста
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={onAddRole}>
            Добавить роль
          </Button>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          height: 500,
          overflowY: "auto",
          position: "relative",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название роли</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEditRole(role)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => onDeleteRole(role.id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {roles.length === 0 && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              textAlign: "center",
              pointerEvents: "none",
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
    </Box>
  );
};

export default BelbinRolesList;
