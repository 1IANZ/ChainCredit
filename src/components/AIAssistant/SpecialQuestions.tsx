import { Assessment, Verified } from '@mui/icons-material';

export const specialQuestions = [
  {
    icon: <Assessment sx={{ fontSize: 18 }} />,
    text: '根据原始数据分析信贷',
    color: 'primary' as const,
    type: 'credit_analysis' as const
  },
  {
    icon: <Verified sx={{ fontSize: 18 }} />,
    text: '验证算法准确性',
    color: 'success' as const,
    type: 'algorithm_check' as const
  },
];
