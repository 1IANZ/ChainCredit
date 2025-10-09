import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Avatar,
  Fade,
  Tooltip,

} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { listen } from '@tauri-apps/api/event';
import { useTheme } from "@mui/material/styles";

import { AIAssistantProps, Message, ChatMessage } from "./types";
import { MarkdownComponents } from "./MarkdownComponents";

import { buildCreditAnalysisText, buildAlgorithmCheckText } from "./utils";
import { specialQuestions } from "./SpecialQuestions";

export default function AIAssistant({ company, messages, setMessages }: AIAssistantProps) {
  const theme = useTheme();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef<string>('');

  /** 滚动到底部 */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /** 流式响应监听 */
  useEffect(() => {
    let chunkUnlisten: (() => void) | null = null;
    let endUnlisten: (() => void) | null = null;
    let isMounted = true;

    const setupListeners = async () => {
      if (chunkUnlisten || endUnlisten) return;

      chunkUnlisten = await listen<string>('ai_stream_chunk', (event) => {
        if (!isMounted) return;
        const chunk = event.payload;

        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];

          if (lastMsg && lastMsg.role === 'ai' && lastMsg.isStreaming) {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: (lastMsg.content || '') + chunk
            };
          }
          return updated;
        });
      });

      endUnlisten = await listen('ai_stream_end', () => {
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === 'ai' && lastMsg.isStreaming) {
            updated[updated.length - 1] = {
              ...lastMsg,
              isStreaming: false
            };
          }
          return updated;
        });
      });
    };

    setupListeners();

    return () => {
      isMounted = false;
      chunkUnlisten && chunkUnlisten();
      endUnlisten && endUnlisten();
    };
  }, []);

  /** 发送消息 */
  const handleSend = async (
    question?: string,
    type?: 'credit_analysis' | 'algorithm_check'
  ) => {
    const messageText = question || input.trim();
    if (!messageText || !company) return;

    let userMessageContent = messageText;

    if (type === 'credit_analysis') {
      userMessageContent = buildCreditAnalysisText(company);
    } else if (type === 'algorithm_check') {
      userMessageContent = buildAlgorithmCheckText(company);
    }

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setInput('');
    setIsLoading(true);
    streamingContentRef.current = '';

    // systemPrompt 构建
    let systemPrompt = `你是一个专业的企业信用分析专家,精通财务分析、风险评估和信贷决策。
请使用 Markdown 格式输出，包括：
- 使用 **粗体** 强调重点
- 使用标题分级（# ## ###）组织内容
- 使用列表展示要点
- 使用表格展示对比数据`;

    if (type === 'credit_analysis') {
      systemPrompt += `\n请基于提供的企业原始数据,进行深入的信贷分析,包括:
1. 财务健康度评估（资产负债率、盈利能力、现金流）
2. 经营能力分析（营收规模、利润率、行业地位）
3. 创新能力评价（研发投入、专利价值）
4. 供应链稳定性（上下游关系、依赖度）
5. 风险因素识别（逾期记录、法律诉讼）
6. 信贷建议（授信额度建议、风险缓释措施）`;
    } else if (type === 'algorithm_check') {
      systemPrompt += `\n请对比企业原始数据与算法计算结果,验证:
1. 信用评分的合理性（是否与财务指标匹配）
2. 信用评级的准确性（是否符合行业标准）
3. 授信额度的合理性（与资产规模的比例关系）
4. 风险等级的准确性（是否反映真实风险）
5. 算法可能存在的偏差或问题
6. 改进建议`;
    }

    const messagesToSend: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter(msg => !msg.isStreaming)
        .map(msg => ({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.content })),
      { role: 'user', content: userMessageContent }
    ];

    setMessages(prev => [
      ...prev,
      userMessage,
      { role: 'ai', content: '', timestamp: new Date(), isStreaming: true }
    ]);

    try {
      await invoke('call_deepseek_api_stream', { messages: messagesToSend });
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => prev.filter(msg => !msg.isStreaming));

      let errorMessage = '处理失败，请稍后重试';
      if (typeof error === 'string') {
        if (error.includes('API密钥未设置')) errorMessage = 'API Key 未配置，请设置 DEEPSEEK_API_KEY 环境变量';
        else if (error.includes('API 错误 429')) errorMessage = 'API 调用频率超限，请稍后再试';
        else if (error.includes('API 错误 401')) errorMessage = 'API Key 无效，请检查配置';
        else errorMessage = error;
      } else if (error.message) errorMessage = error.message;

      toast.error(errorMessage);
      setIsLoading(false);
      streamingContentRef.current = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>

      {/* 快捷分析按钮 */}
      {company && messages.length === 0 && (
        <Fade in timeout={500}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SmartToyIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight="bold" color="primary">
                AI 深度分析
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {specialQuestions.map((q, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  onClick={() => handleSend(q.text, q.type)}
                  sx={{
                    p: 2.5,
                    cursor: 'pointer',
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'white',
                    border: 2,
                    borderColor: `${q.color}.main`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    '&:hover': {
                      borderColor: `${q.color}.dark`,
                      bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : `${q.color}.50`,
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <Avatar sx={{ bgcolor: `${q.color}.main`, width: 40, height: 40 }}>
                    {q.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{q.text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {i === 0 ? '基于原始财务数据进行独立信贷评估' : '对比原始数据与算法结果'}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        </Fade>
      )}

      {/* 对话区域 */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column' }}>
        {/* 欢迎界面 */}
        {messages.length === 0 && company && (
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', mt: 'auto', mb: 'auto', color: 'text.secondary' }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: '50%',
                bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', mb: 3, boxShadow: `0 8px 24px ${theme.palette.primary.main}40`
              }}>
                <SmartToyIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>AI 信用分析助手</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                选择上方分析功能开始使用,由 DeepSeek 提供支持
              </Typography>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                px: 2, py: 1, borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'white',
                border: 1, borderColor: 'divider'
              }}>
                <Typography variant="caption" color="text.secondary">当前分析企业</Typography>
                <Typography variant="caption" fontWeight="bold" color="primary.main">{company.company_data.company_name}</Typography>
              </Box>
            </Box>
          </Fade>
        )}

        {!company && (
          <Box sx={{ textAlign: 'center', mt: 'auto', mb: 'auto', color: 'text.secondary' }}>
            <SmartToyIcon sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
            <Typography variant="body2">请先从左侧列表选择一个企业</Typography>
          </Box>
        )}

        {/* 消息列表 */}
        {messages.map((msg, i) => (
          <Fade in key={i} timeout={300}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 1.5 }}>
              {msg.role === 'ai' && <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, boxShadow: 2, flexShrink: 0 }}><SmartToyIcon sx={{ fontSize: 20 }} /></Avatar>}
              <Box sx={{ maxWidth: '85%', minWidth: '50%' }}>
                <Paper elevation={0} sx={{
                  p: 2,
                  bgcolor: msg.role === 'user' ? 'primary.main' : theme.palette.mode === 'dark' ? 'grey.800' : 'white',
                  color: msg.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  border: msg.role === 'ai' ? 1 : 0,
                  borderColor: 'divider',
                  wordBreak: 'break-word',
                  boxShadow: msg.role === 'user' ? 2 : 0
                }}>
                  {msg.role === 'ai' ? (
                    <>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents()}>{msg.content || ''}</ReactMarkdown>
                      {msg.isStreaming && <Box component="span" sx={{ display: 'inline-block', width: 8, height: 16, bgcolor: 'primary.main', ml: 0.5, animation: 'blink 1s infinite', '@keyframes blink': { '0%, 50%': { opacity: 1 }, '51%, 100%': { opacity: 0 } } }} />}
                    </>
                  ) : (
                    <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.875rem' }}>{msg.content}</Typography>
                  )}
                </Paper>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, px: 1, color: 'text.secondary', fontSize: '0.7rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              {msg.role === 'user' && <Avatar sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.400', width: 36, height: 36, flexShrink: 0 }}><PersonIcon sx={{ fontSize: 20 }} /></Avatar>}
            </Box>
          </Fade>
        ))}

        <div ref={messagesEndRef} />
      </Box>

      {/* 输入框 */}
      <Box sx={{ p: 2.5, borderTop: 1, borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={4}
            placeholder={company ? "输入您的问题..." : "请先选择一个企业"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!company || isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'grey.750' : 'white' },
                '&.Mui-focused': { bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'white' }
              }
            }}
          />
          <Tooltip title="发送消息 (Enter)">
            <span>
              <IconButton
                color="primary"
                onClick={() => handleSend()}
                disabled={!company || !input.trim() || isLoading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 44,
                  height: 44,
                  '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.05)' },
                  '&.Mui-disabled': { bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300', color: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.500' },
                  transition: 'all 0.2s',
                  boxShadow: 2
                }}
              >
                <SendIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
