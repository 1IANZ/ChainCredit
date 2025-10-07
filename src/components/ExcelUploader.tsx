import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography, Paper, useTheme, keyframes, alpha, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { open, save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { toast } from "sonner";

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

interface ExcelUploaderProps {
  onFileSelect: (filePath: string[]) => void;
  disabled?: boolean;
}

export default function ExcelUploader({ onFileSelect, disabled = false }: ExcelUploaderProps) {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
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
              setTimeout(() => {
                setIsDragging(false);
              }, 100);
            }
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

  const handleGenerateTemplate = async () => {
    if (disabled || isGenerating) return;

    try {
      setIsGenerating(true);

      const filePath = await save({
        filters: [{
          name: 'Excel',
          extensions: ['xlsx']
        }],
        defaultPath: '企业信息模板.xlsx'
      });

      if (!filePath) {
        setIsGenerating(false);
        return;
      }

      await invoke('generate_template_excel', {
        filePath,
        headers: [
          '企业ID',
          '企业名称',
          '行业',
          '营业收入(万元)',
          '净利润(万元)',
          '资产总额(万元)',
          '负债总额(万元)',
          '资产负债率(%)',
          '研发投入占比(%)',
          '专利数量',
          '上游核心企业数量',
          '下游客户数量',
          '历史逾期次数',
          '法律诉讼次数'
        ],
        //21,500	2,500	32,000	8,000	25	18	60	4	110	0	0

        templateRow: [
          'QY006',
          '朗创人工智能有限公司',
          '人工智能',
          '21500',
          '2500',
          '32000',
          '8000',
          '25',
          '18',
          '60',
          '4',
          '110',
          '0',
          '0',
        ]
      });
      toast.success('生成模板文件成功!');
    } catch (error) {
      console.error('生成模板文件失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper
        elevation={0}
        onClick={handleFileClick}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          position: "relative",
          backgroundColor: theme.palette.background.paper,
          border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
          borderRadius: 3,
          transition: "all 0.2s ease-out",
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
          overflow: "hidden",
          "&:hover": !disabled
            ? {
              borderColor: alpha(theme.palette.primary.main, 0.5),
              transform: "translateY(-2px)",
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
              "& .upload-icon": {
                animation: `${bounce} 1s ease-in-out infinite`,
                color: theme.palette.primary.main,
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

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            opacity: isDragging ? 1 : 0,
            transition: "opacity 0.2s ease-out",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 3,
            opacity: isDragging ? 1 : 0,
            transition: "opacity 0.2s ease-out",
            pointerEvents: "none",
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
              transition: "color 0.2s ease-out",
              filter: isDragging ? `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.3)})` : "none",
            }}
          />

          <Typography
            variant="h5"
            sx={{
              color: isDragging ? theme.palette.primary.main : theme.palette.text.primary,
              fontWeight: 600,
              transition: "color 0.2s ease-out",
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
                fontWeight: 500,
                letterSpacing: 0.5,
              }}
            >
              .xlsx .xls .xlsm .xlsb
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleGenerateTemplate}
        disabled={disabled || isGenerating}
        sx={{
          alignSelf: 'center',
          width: '100%',
          borderRadius: 2,
          textTransform: 'none',
          px: 3,
          py: 1,
          borderColor: alpha(theme.palette.primary.main, 0.5),
          color: theme.palette.primary.main,
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
          '&:disabled': {
            borderColor: alpha(theme.palette.divider, 0.3),
            color: alpha(theme.palette.text.secondary, 0.3),
          }
        }}
      >
        {isGenerating ? '生成中...' : '下载Excel模板'}
      </Button>
    </Box>
  );
}