import { useEffect } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Chip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SmartToy as SmartToyIcon, Close as CloseIcon } from "@mui/icons-material";
import type { Company } from "./types";
import { Message } from "../AIAssistant/types";
import AIAssistant from "../AIAssistant";


interface Props {
  open: boolean;
  onClose: () => void;
  company: Company | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function AIChatDrawer({ open, onClose, company, messages, setMessages }: Props) {
  const theme = useTheme();

  // 每次切换公司时清空聊天记录
  useEffect(() => {
    setMessages([]);
  }, [company]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1400,
        '& .MuiDrawer-paper': {
          width: 500,
          height: '100vh',
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.default'
        }
      }}
    >
      {/* 抽屉头部 */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: 1,
          borderColor: 'divider',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SmartToyIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              基于DeepSeek的企业信用评估AI助手
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {company && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 0.5 }}>
              📊 当前分析企业
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {company.company_data.company_name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                label={`评分: ${company.credit_score.toFixed(1)}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}
              />
              <Chip
                label={company.credit_rating}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AIAssistant
          company={company}
          messages={messages}
          setMessages={setMessages}
        />
      </Box>
    </Drawer>
  );
}
