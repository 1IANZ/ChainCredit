import { Card, CardContent, Typography, Box } from "@mui/material";
import type { Company } from "./types";
interface Props {
  company: Company;
}

export default function KeyMetricsCard({ company }: Props) {
  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>关键财务指标</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">资产负债率</Typography>
          <Typography variant="body2" fontWeight="bold">{company.company_data.debt_to_asset_ratio.toFixed(2)}%</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">研发投入占比</Typography>
          <Typography variant="body2" fontWeight="bold">{company.company_data.r_and_d_ratio.toFixed(2)}%</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
