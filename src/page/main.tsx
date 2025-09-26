// Main.tsx
import { useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

import TitleBar from "../components/TitleBar";
import ExcelUploader from "../components/ExcelUploader";

import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import DataVisualization from "../components/DataVisualization";

export default function Main() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<any[] | null>(null);

  const handleFileSelect = async (filePath: string[]) => {
    setIsProcessing(true);
    try {
      const res: any[] = await invoke("process_excel", { paths: filePath });
      if (res.length === 0) {
        toast.error("处理失败，返回数据为空或无效");
        setIsProcessing(false);
        return;
      }
      setProcessedData(res);
      toast.success("文件处理成功！");
      setIsProcessing(false);
    } catch (err) {
      toast.error(String(err));
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TitleBar title="企业信用评估系统" />
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        {processedData ? (
          <DataVisualization data={processedData} />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
            }}
          >
            {isProcessing ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CircularProgress size={60} />
                <Typography variant="h6" color="text.secondary">
                  正在处理文件...
                </Typography>
              </Box>
            ) : (
              <ExcelUploader
                onFileSelect={handleFileSelect}
                disabled={isProcessing}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}