import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

interface StatsProps {
  stats: {
    totalCompanies: number;
    avgCreditScore: number;
    highRiskCount: number;
    totalCreditLimit: number;
    excellentRating: number;
  };
}

export default function StatsCards({ stats }: StatsProps) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
      <Card sx={{ flex: "1 1 220px", minWidth: "220px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography color="text.secondary" variant="body2">
                链上企业总数
              </Typography>
              <Typography variant="h4">{stats.totalCompanies}</Typography>
            </Box>
            <BusinessIcon color="primary" sx={{ fontSize: 48, opacity: 0.3 }} />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ flex: "1 1 220px", minWidth: "220px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography color="text.secondary" variant="body2">
                平均信用分
              </Typography>
              <Typography variant="h4">{stats.avgCreditScore}</Typography>
            </Box>
            <AssessmentIcon color="success" sx={{ fontSize: 48, opacity: 0.3 }} />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ flex: "1 1 220px", minWidth: "220px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography color="text.secondary" variant="body2">
                优质企业(AA级以上)
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.excellentRating}
              </Typography>
            </Box>
            <TrendingUpIcon color="success" sx={{ fontSize: 48, opacity: 0.3 }} />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ flex: "1 1 220px", minWidth: "220px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography color="text.secondary" variant="body2">
                高风险企业
              </Typography>
              <Typography variant="h4" color="error">
                {stats.highRiskCount}
              </Typography>
            </Box>
            <WarningIcon color="error" sx={{ fontSize: 48, opacity: 0.3 }} />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ flex: "1 1 220px", minWidth: "220px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography color="text.secondary" variant="body2">
                总信用额度(万元)
              </Typography>
              <Typography variant="h4">{(stats.totalCreditLimit / 10000).toFixed(0)}</Typography>
            </Box>
            <TrendingUpIcon color="info" sx={{ fontSize: 48, opacity: 0.3 }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
