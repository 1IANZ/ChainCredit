import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography, Paper, useTheme, keyframes } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { open } from '@tauri-apps/plugin-dialog';

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

interface ExcelUploaderProps {
  onFileSelect: (filePath: string[]) => void;
  disabled?: boolean;
}

export default function ExcelUploader({ onFileSelect, disabled = false }: ExcelUploaderProps) {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const filePathsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    filePathsRef.current = filePaths;
  }, [filePaths]);


  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let isMounted = true;

    const setupDragDrop = async () => {
      try {
        const webview = getCurrentWebview();

        unlisten = await webview.onDragDropEvent((event) => {
          if (isProcessing.current) return;
          isProcessing.current = true;

          switch (event.payload.type) {
            case "over":
              setIsDragging(true);
              break;
            case "drop": {
              const currentPaths = filePathsRef.current;
              const excelFiles = event.payload.paths.filter((path: string) =>
                isExcelFile(path) && !currentPaths.includes(path)
              );

              if (excelFiles.length > 0) {
                setFilePaths((prevPaths) => {
                  const newPaths = [...prevPaths, ...excelFiles];
                  const uniquePaths = Array.from(new Set(newPaths));
                  filePathsRef.current = uniquePaths;
                  return uniquePaths;
                });
                onFileSelect(excelFiles);
              }
            }
              setIsDragging(false);
              break;
            case "leave":
              setIsDragging(false);
              break;
          }

          isProcessing.current = false;
        });

        if (!isMounted && unlisten) {
          unlisten();
          unlisten = null;
        }
      } catch (error) {
        console.error("Failed to setup drag drop event:", error);
      }
    };

    setupDragDrop();

    return () => {
      isMounted = false;
      if (unlisten) {
        unlisten();
        unlisten = null;
      }
    };
  }, []);
  const isExcelFile = (filePath: string) => {
    const ext = filePath.toLowerCase();
    return [".xlsx", ".xls", ".xlsm", ".xlsb"].some((suffix) =>
      ext.endsWith(suffix)
    );
  };

  const handleFileClick = useCallback(async () => {
    if (disabled) return;
    const selected = await open({
      multiple: true,
      filters: [
        { name: "Excel", extensions: ["xlsx", "xls", "xlsm", "xlsb"] }
      ]
    });
    if (!selected) return;
    const paths = Array.isArray(selected) ? selected : [selected];

    const currentPaths = filePathsRef.current;
    const newPaths = paths.filter((path) => !currentPaths.includes(path));
    if (newPaths.length > 0) {
      setFilePaths((prevPaths) => {
        const allPaths = [...prevPaths, ...newPaths];
        const uniquePaths = Array.from(new Set(allPaths));
        filePathsRef.current = uniquePaths;
        return uniquePaths;
      });
      onFileSelect(newPaths);
    }
  }, [disabled, onFileSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const excelFiles = Array.from(e.target.files).filter(file =>
        isExcelFile(file.name)
      );

      const newFilePaths = excelFiles.map(file => file.name);
      const currentPaths = filePathsRef.current;
      const filteredPaths = newFilePaths.filter((path) => !currentPaths.includes(path));

      if (filteredPaths.length > 0) {
        setFilePaths((prevPaths) => {
          const allPaths = [...prevPaths, ...filteredPaths];
          const uniquePaths = Array.from(new Set(allPaths));
          filePathsRef.current = uniquePaths;
          return uniquePaths;
        });
        onFileSelect(filteredPaths);
      }
    }
  }, [onFileSelect]);

  return (
    <Paper
      elevation={isDragging ? 8 : 2}
      onClick={handleFileClick}
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
        border: `3px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
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