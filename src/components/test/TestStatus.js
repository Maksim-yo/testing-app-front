import React, { useState } from "react";
import {
  Chip,
  Popover,
  Box,
  Typography,
  ClickAwayListener,
} from "@mui/material";

const TestStatus = ({ onChange, status }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const statusOptions = [
    { value: "active", label: "Активен", color: "success" },
    { value: "draft", label: "Черновик", color: "warning" },
    { value: "archive", label: "Архив", color: "default" },
  ];
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => !prev);
  };

  const handleStatusSelect = (newStatus) => {
    onChange(newStatus);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Chip
        label={
          statusOptions.find((option) => option.value === status)?.label ||
          "Выберите статус"
        }
        color={
          statusOptions.find((option) => option.value === status)?.color ||
          "default"
        }
        onClick={handleClick}
        sx={{ cursor: "pointer", fontWeight: 100 }}
      />

      {/* Popover с кастомным списком */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        disableRestoreFocus
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Box sx={{ p: 2 }}>
            {statusOptions.map((option) => (
              <Box
                key={option.value}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: "5px",
                  },
                  padding: "5px",
                }}
                onClick={() => handleStatusSelect(option.value)}
              >
                <Chip
                  label={option.label}
                  color={option.color}
                  sx={{ mr: 1 }}
                />
              </Box>
            ))}
          </Box>
        </ClickAwayListener>
      </Popover>
    </div>
  );
};
export default TestStatus;
