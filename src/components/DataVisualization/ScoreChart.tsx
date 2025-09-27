import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from "recharts";
import { useTheme } from "@mui/material/styles";
import { COLORS } from "./utils";
import type { Company } from "./types";
interface Props {
  company: Company;
  chartType: 'bar' | 'pie' | 'radar' | 'line';
}

export default function ScoreChart({ company, chartType }: Props) {
  const theme = useTheme();

  const scoreData = [
    { name: "财务评分", value: Number(company.score_details.financial_score.toFixed(1)) },
    { name: "创新评分", value: Number(company.score_details.innovation_score.toFixed(1)) },
    { name: "供应链评分", value: Number(company.score_details.supply_chain_score.toFixed(1)) },
    { name: "风险评分", value: Number(company.score_details.risk_score.toFixed(1)) },
  ];

  const adjustmentData = [{ name: "行业调整", value: company.score_details.industry_adjustment }];

  const financialData = [
    { name: "营收", value: company.company_data.revenue },
    { name: "净利润", value: company.company_data.net_profit },
    { name: "总资产", value: company.company_data.total_assets },
    { name: "总负债", value: company.company_data.total_liabilities },
  ];

  const tooltipStyle = {
    contentStyle: { backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, boxShadow: theme.shadows[3] },
    itemStyle: { color: theme.palette.text.primary },
    labelStyle: { color: theme.palette.text.secondary }
  };

  switch (chartType) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[...scoreData, ...adjustmentData]} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {[...scoreData, ...adjustmentData].map((entry, idx) => <Cell key={idx} fill={entry.value < 0 ? theme.palette.error.main : theme.palette.primary.main} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={scoreData} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
              {scoreData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ color: theme.palette.text.secondary }} />
          </PieChart>
        </ResponsiveContainer>
      );
    case 'radar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={scoreData}>
            <PolarGrid stroke={theme.palette.divider} />
            <PolarAngleAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={theme.palette.text.secondary} />
            <Radar name="评分" dataKey="value" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
            <Tooltip {...tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} tickFormatter={(val) => val.toLocaleString()} />
            <Tooltip {...tooltipStyle} formatter={(val: number) => `${val.toLocaleString()} 万元`} />
            <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 6 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
}
