import { useState } from "react";
import { useNavigate } from "react-router";
import { Box, Typography, CircularProgress } from "@mui/material";
import ExcelUploader from "../components/ExcelUploader";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { DataAtom } from "../utils/store";

export default function Upload() {
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const [_processedData, setProcessedData] = useAtom(DataAtom);
  const handleFileSelect = async (filePath: string[]) => {
    setIsProcessing(true);
    try {
      const res: any[] = await invoke("process_excel", { paths: filePath });
      if (res.length === 0) {
        toast.error("处理失败，返回数据为空或无效");
        return;
      }
      setProcessedData(res);
      toast.success("文件处理成功！");
      navigate("/dashboard");
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
      {isProcessing ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            正在处理文件...
          </Typography>
        </Box>
      ) : (
        <ExcelUploader onFileSelect={handleFileSelect} disabled={isProcessing} />
      )}
    </Box>
  );
}
