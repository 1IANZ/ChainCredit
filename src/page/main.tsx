import { useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

import TitleBar from "../components/TitleBar";
import ExcelUploader from "../components/ExcelUploader";

export default function Main() {

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileSelect = async (filePath: string) => {
    setIsProcessing(true);
    setError("");
    try {


      // ⚡ 调用后端命令
      // await invoke("process_excel", { path: filePath });

      console.log("File processed successfully:", filePath);
      setIsProcessing(false);
    } catch (err) {
      setError(String(err));
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TitleBar title="Excel 文件处理" />

      <Box sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}>
        {isProcessing ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">正在处理文件...</Typography>
          </Box>
        ) : (
          <ExcelUploader onFileSelect={handleFileSelect} disabled={isProcessing} />
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
