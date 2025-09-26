import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography, Paper, useTheme, keyframes, alpha } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { open } from '@tauri-apps/plugin-dialog';

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
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
      elevation={isDragging ? 12 : 0}
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
        background: isDragging
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.08)} 100%)`
          : theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.grey[50], 0.5)} 100%)`,
        border: `2px dashed ${isDragging ? theme.palette.primary.main : alpha(theme.palette.divider, 0.3)}`,
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
        overflow: "hidden",
        "&:hover": !disabled
          ? {
            borderColor: alpha(theme.palette.primary.main, 0.5),
            transform: "translateY(-4px)",
            boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.03)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            "& .upload-icon": {
              animation: `${bounce} 1s ease-in-out infinite`,
              color: theme.palette.primary.main,
            },
            "& .shimmer-effect": {
              animation: `${shimmer} 2s linear infinite`,
            }
          }
          : {},
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDragging
            ? `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`
            : "none",
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
        },
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.xlsm,.xlsb"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Shimmer effect overlay */}
      <Box
        className="shimmer-effect"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.05)} 50%, transparent 100%)`,
          backgroundSize: "200% 100%",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.3s ease",
          "&:hover": {
            opacity: 1,
          }
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          zIndex: 1,
        }}
      >
        <CloudUploadIcon
          className="upload-icon"
          sx={{
            fontSize: 90,
            color: isDragging
              ? theme.palette.primary.main
              : alpha(theme.palette.text.secondary, 0.3),
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: isDragging ? `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.3)})` : "none",
          }}
        />

        <Typography
          variant="h5"
          sx={{
            color: isDragging ? theme.palette.primary.main : theme.palette.text.primary,
            fontWeight: 600,
            transition: "all 0.3s ease",
            textAlign: "center",
            animation: isDragging ? `${pulse} 1.5s ease-in-out infinite` : "none",
          }}
        >
          {isDragging ? "释放文件到这里" : "拖放 Excel 文件"}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: alpha(theme.palette.text.secondary, 0.7),
            textAlign: "center",
          }}
        >
          或点击此处选择文件
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            mt: 2,
            px: 3,
            py: 1,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <InsertDriveFileIcon
            sx={{
              fontSize: 16,
              color: theme.palette.primary.main,
              opacity: 0.8,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              color: theme.palette.primary.main,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: 0.5,
            }}
          >
            .xlsx .xls .xlsm .xlsb
          </Typography>
        </Box>
      </Box>
      {isDragging && (
        <Box
          sx={{
            position: "absolute",
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: 3,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
            backgroundSize: "300% 300%",
            animation: `${shimmer} 3s linear infinite`,
            opacity: 0.3,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}
    </Paper>
  );
}