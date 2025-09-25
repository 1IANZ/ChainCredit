import { useState, useRef, useEffect } from "react";
import { Box, Typography, Paper, useTheme, keyframes } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getCurrentWebview } from "@tauri-apps/api/webview";

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

interface ExcelUploaderProps {
  onFileSelect: (filePath: string) => void;
  disabled?: boolean;
}

export default function ExcelUploader({ onFileSelect, disabled = false }: ExcelUploaderProps) {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const setupDragDrop = async () => {
      const webview = getCurrentWebview();
      const unlisten = await webview.onDragDropEvent((event) => {
        switch (event.payload.type) {
          case "over":
            setIsDragging(true);
            break;
          case "drop":
            {
              const filePath = event.payload.paths[0];
              if (filePath && isExcelFile(filePath)) {
                onFileSelect(filePath);
              }
            }
            setIsDragging(false);
            break;
          case "leave":
            setIsDragging(false);
            break;
        }
      });

      return () => {
        unlisten();
      };
    };

    setupDragDrop();
  }, [onFileSelect]);

  const isExcelFile = (filePath: string) => {
    const ext = filePath.toLowerCase();
    return [".xlsx", ".xls", ".xlsm", ".xlsb"].some((suffix) =>
      ext.endsWith(suffix)
    );
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (isExcelFile(file.name)) {
        onFileSelect(file.name);
      }
    }
  };

  return (
    <Paper
      elevation={isDragging ? 8 : 2}
      onClick={handleClick}
      sx={{
        width: "100%",
        maxWidth: 600,
        height: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        backgroundColor: theme.palette.background.paper,
        border: `3px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider
          }`,
        borderRadius: 2,
        transition: "all 0.3s ease",
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? "none" : "auto",
        "&:hover": !disabled
          ? {
            borderColor: theme.palette.primary.light,
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[4],
            "& .upload-icon": {
              animation: `${bounce} 1s ease-in-out infinite`,
            },
          }
          : {},
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.xlsm,.xlsb"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <CloudUploadIcon
        className="upload-icon"
        sx={{
          fontSize: 80,
          color: isDragging
            ? theme.palette.primary.main
            : theme.palette.action.disabled,
          mb: 3,
          transition: "all 0.3s ease",
        }}
      />

      <Typography
        variant="h5"
        color={isDragging ? "primary" : "textPrimary"}
        sx={{
          mb: 1,
          fontWeight: 500,
          transition: "color 0.3s ease",
        }}
      >
        {isDragging ? "释放文件到这里" : "拖放 Excel 文件"}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        或点击此处选择文件
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontFamily: "monospace",
        }}
      >
        支持格式: .xlsx, .xls, .xlsm, .xlsb
      </Typography>

      {isDragging && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.palette.primary.main,
            opacity: 0.05,
            pointerEvents: "none",
            borderRadius: 2,
          }}
        />
      )}
    </Paper>
  );
}
