import { useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

import TitleBar from "../components/TitleBar";
import ExcelUploader from "../components/ExcelUploader";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export default function Main() {
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFileSelect = async (filePath: string[]) => {
    setIsProcessing(true);
    try {
      const res: [] = await invoke("process_excel", { paths: filePath });
      if (res.length === 0) {
        toast.error("处理失败，返回数据为空或无效");
        setIsProcessing(false);
        return;
      }
      console.log(res)
      setIsProcessing(false);
    } catch (err) {
      toast.error(String(err));
      setIsProcessing(false);
    }
  };


  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TitleBar title="Main" />
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
      </Box>
    </Box>
  );
}
