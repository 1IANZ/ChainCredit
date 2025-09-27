import { Card, CardContent, Typography, Box } from "@mui/material";
import type { Company } from "./types";

interface Props {
  company: Company;
}

export default function RiskMetricsCard({ company }: Props) {
  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>经营风险指标</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">历史逾期次数</Typography>
          <Typography variant="body2" fontWeight="bold" color={company.company_data.overdue_count > 0 ? 'error' : 'success.main'}>
            {company.company_data.overdue_count}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">法律诉讼次数</Typography>
          <Typography variant="body2" fontWeight="bold" color={company.company_data.legal_disputes_count > 0 ? 'error' : 'success.main'}>
            {company.company_data.legal_disputes_count}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
