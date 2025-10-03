import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Button, Card, CardContent, Divider, Chip, Tooltip, Alert
} from "@mui/material";
import { Business as BusinessIcon, Warning as WarningIcon } from "@mui/icons-material";
import { toast } from "sonner";
import { CompanyChainData } from "./types";
import { getRatingColor, getRiskLevelColor, getCreditStrategy } from "../../components/DataVisualization/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  company: CompanyChainData | null;
}

export default function CompanyDetailDialog({ open, onClose, company }: Props) {
  if (!company) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <BusinessIcon color="primary" />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{company.company_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              企业ID: {company.company_id}
            </Typography>
          </Box>
          <Chip
            label={company.credit_rating}
            sx={{
              backgroundColor: getRatingColor(company.credit_rating),
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* 信用评分卡片 */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                信用评分
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography variant="h3" color="primary">
                  {company.credit_score}
                </Typography>
                <Box>
                  <Chip
                    label={company.credit_rating}
                    sx={{
                      backgroundColor: getRatingColor(company.credit_rating),
                      color: "white",
                      fontWeight: "bold",
                      mb: 1,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    信用评级
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    信用额度
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ¥{(company.credit_limit / 10000).toFixed(2)} 万元
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" color="text.secondary">
                    风险等级
                  </Typography>
                  <Chip
                    label={company.risk_level}
                    size="small"
                    sx={{
                      backgroundColor: getRiskLevelColor(company.risk_level),
                      color: "white",
                      fontWeight: "bold",
                      mt: 0.5,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* 授信策略 */}
          <Card
            variant="outlined"
            sx={{
              backgroundColor: "info.lighter",
              borderColor: "info.main",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom color="info.main">
                建议授信策略
              </Typography>
              <Typography variant="body1">
                {getCreditStrategy(company.credit_score, company.risk_level)}
              </Typography>
            </CardContent>
          </Card>

          {/* 链上信息 */}
          {(company.timestamp || company.transaction_hash) && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  链上信息
                </Typography>
                {company.timestamp && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      上链时间
                    </Typography>
                    <Typography variant="body1">
                      {new Date(company.timestamp * 1000).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </Typography>
                  </Box>
                )}
                {company.transaction_hash && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      交易哈希
                    </Typography>
                    <Tooltip title="点击复制">
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                          backgroundColor: "action.hover",
                          p: 1,
                          borderRadius: 1,
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "action.selected" },
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(company.transaction_hash || "");
                          toast.success("交易哈希已复制");
                        }}
                      >
                        {company.transaction_hash}
                      </Typography>
                    </Tooltip>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* 风险提示 */}
          {(company.risk_level === "高" || company.risk_level === "极高") && (
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="body2">
                该企业风险等级为 <strong>{company.risk_level}</strong>，建议谨慎授信，
                {company.credit_score < 60 && "信用分数低于60分，"}
                建议采取保守的授信策略或要求额外担保。
              </Typography>
            </Alert>
          )}

          {company.credit_score >= 85 && company.risk_level === "低" && (
            <Alert severity="success">
              <Typography variant="body2">
                该企业信用状况优秀，风险等级低，可以提供优惠的授信条件。
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
        <Button
          variant="contained"
          onClick={() => {
            toast.info("导出功能开发中");
          }}
        >
          导出报告
        </Button>
      </DialogActions>
    </Dialog>
  );
}
