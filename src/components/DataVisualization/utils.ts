export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const getRiskLevelColor = (level: string) => {
  switch (level) {
    case '低': return '#4caf50';
    case '中': return '#ff9800';
    case '高': return '#f44336';
    case '极高': return '#b71c1c';
    default: return '#757575';
  }
};

export const getRatingColor = (rating: string) => {
  if (rating.startsWith('AAA')) return '#1976d2';
  if (rating.startsWith('AA')) return '#2196f3';
  if (rating.startsWith('A')) return '#03a9f4';
  if (rating.startsWith('BBB')) return '#00bcd4';
  if (rating.startsWith('BB')) return '#ff9800';
  if (rating.startsWith('B')) return '#ff5722';
  if (rating.startsWith('CCC')) return '#d32f2f';
  if (rating.startsWith('CC')) return '#b71c1c';
  return '#f44336';
};
export const scrollbarStyles = (theme: any) => ({
  '*::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '*::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.mode === 'dark' ? '#2b2b2b' : '#f1f1f1',
  },
  '*::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#6b6b6b' : '#888',
    borderRadius: '4px',
  },
  '*::-webkit-scrollbar-thumb:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#959595' : '#555',
  },
  '*': {
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.palette.mode === 'dark' ? '#6b6b6b' : '#888'} ${theme.palette.mode === 'dark' ? '#2b2b2b' : '#f1f1f1'}`
  }
});
export function getCreditStrategy(score: number, riskLevel: string): string {
  if (riskLevel === "低" && score >= 85) {
    return "高额度、低利率、长期还款";
  }
  if ((riskLevel === "低" && score < 85) || (riskLevel === "中" && score >= 70)) {
    return "中额度、标准利率、分阶段还款";
  }
  if ((riskLevel === "中" && score < 70) || riskLevel === "高") {
    return "低额度、加息、短期还款或担保";
  }
  return "不授信或仅提供融资担保";
}