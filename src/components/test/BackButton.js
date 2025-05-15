import React from "react";
import { IconButton, Box, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BackButton = ({ onBack, label = "Назад", sx = {} }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2, ...sx }}>
      <IconButton onClick={onBack}>
        <ArrowBackIcon />
      </IconButton>
    </Box>
  );
};

export default BackButton;
