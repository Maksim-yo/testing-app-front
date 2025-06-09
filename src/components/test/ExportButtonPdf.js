import { useRef } from "react";
import html2pdf from "html2pdf.js";
import { Button } from "@mui/material";

export default function ExportButton({ containerRef }) {
  const handleExport = () => {
    const element = containerRef.current;
    html2pdf()
      .set({
        margin: 10,
        filename: "test-results.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  return (
    <Button onClick={handleExport} variant="outlined">
      Экспорт в PDF
    </Button>
  );
}
