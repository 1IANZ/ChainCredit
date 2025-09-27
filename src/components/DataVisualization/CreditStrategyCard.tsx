import { Card, CardContent, Typography } from "@mui/material";
import type { Company } from "./types";
import { getCreditStrategy } from "./utils";

export default function CreditStrategyCard({ company }: { company: Company }) {
  const strategy = getCreditStrategy(company.credit_score, company.risk_level);

  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>授信策略建议</Typography>
        <Typography variant="body1">{strategy}</Typography>
      </CardContent>
    </Card>
  );
}
