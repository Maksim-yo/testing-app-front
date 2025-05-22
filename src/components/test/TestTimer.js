import React, { useEffect, useState, useRef } from "react";
import { Typography, Box } from "@mui/material";

export function TestTimer({ secondsLeft, onTimeUp }) {
  const hasCalledOnTimeUp = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0 && !hasCalledOnTimeUp.current) {
      hasCalledOnTimeUp.current = true;
      onTimeUp && onTimeUp();
    }
  }, [secondsLeft, onTimeUp]);

  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;
  const isDanger = secondsLeft <= 300; // 5 минут

  return (
    <Box
      sx={{
        backgroundColor: isDanger ? "#ffebee" : "#e3f2fd",
        border: "1px solid",
        borderColor: isDanger ? "error.main" : "primary.light",
        borderRadius: 2,
        px: 2,
        py: 0.5,
        ml: "auto",
        height: "fit-content",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: isDanger ? "error.main" : "primary.main",
          fontWeight: "bold",
        }}
      >
        {min}:{sec.toString().padStart(2, "0")}
      </Typography>
    </Box>
  );
}
