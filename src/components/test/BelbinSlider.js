import React from "react";
import { Slider, FormControl, FormLabel, Box } from "@mui/material";
import { brown } from "@mui/material/colors";

// Функция для получения фона слайдера
export const getTrackBackground = (value, limit, max, totalPoints) => {
  const left = (value / max) * 100;
  const points = 10 - totalPoints;
  const middle = ((value + points) / max) * 100;

  if (totalPoints === 10 && value === 0) {
    return "white"; // Голубой цвет для начальной позиции
  }

  return `linear-gradient(
    to right,
    #00bcd4 0% ${left}%,
    #ffc107 ${left}% ${middle}%,
    white ${middle}% 100%
  )`;
};

// Новый компонент слайдера
const CustomSliderComponent = ({
  index,
  value,
  handleSliderChange,
  totalPoints,
  marks,
  limit,
  max,
  answerOption,
}) => {
  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <FormLabel sx={{ mb: 1 }}>{answerOption}</FormLabel>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Slider
          value={value}
          onChange={handleSliderChange(index)}
          min={0}
          max={max}
          step={1}
          marks={marks}
          size="small"
          sx={{
            "& .MuiSlider-track": {
              border: "none",
              backgroundColor: "transparent",
            },
            "& .MuiSlider-rail": {
              background: getTrackBackground(value, limit, max, totalPoints),
              opacity: 1,
            },
            "& .MuiSlider-thumb": {
              backgroundColor: "#fff",
              border: "2px solid currentColor",
              "&:hover": {
                boxShadow: "0 0 0 8px rgba(0, 188, 212, 0.16)",
              },
            },
          }}
          defaultValue={0}
          valueLabelDisplay="auto"
        />
      </Box>
    </FormControl>
  );
};

export default CustomSliderComponent;
