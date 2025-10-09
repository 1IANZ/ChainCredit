import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Alert
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { CompanyChainData } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  company: CompanyChainData | null;
  onUpdate: (
    companyId: string,
    companyName: string,
    creditScore: number,
    creditRating: string,
    creditLimit: string,
    riskLevel: string
  ) => Promise<void>;
}

const creditRatingOptions = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "CC", "C", "D"];
const riskLevelOptions = ["低", "中", "高", "极高"];

export default function CompanyEditDialog({ open, onClose, company, onUpdate }: Props) {
  const [formData, setFormData] = useState({
    companyName: "",
    creditScore: 0,
    creditRating: "",
    creditLimit: "",
    riskLevel: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.company_name,
        creditScore: company.credit_score,
        creditRating: company.credit_rating,
        creditLimit: company.credit_limit,
        riskLevel: company.risk_level,
      });
      setErrors({});
    }
  }, [company]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "企业名称不能为空";
    }

    if (formData.creditScore < 0 || formData.creditScore > 1000) {
      newErrors.creditScore = "信用分数必须在 0-1000 之间";
    }

    if (!formData.creditRating) {
      newErrors.creditRating = "请选择信用评级";
    }

    if (!formData.creditLimit.trim()) {
      newErrors.creditLimit = "信用额度不能为空";
    }

    if (!formData.riskLevel) {
      newErrors.riskLevel = "请选择风险等级";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!company || !validateForm()) return;

    setLoading(true);
    try {
      await onUpdate(
        company.company_id,
        formData.companyName,
        formData.creditScore,
        formData.creditRating,
        formData.creditLimit,
        formData.riskLevel
      );
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  if (!company) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EditIcon color="primary" />
          <Typography variant="h6">修改企业信息</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          企业ID: {company.company_id}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2 }}>
          <Alert severity="info">
            修改企业信息将更新区块链上的数据,请仔细核对后提交。
          </Alert>

          <TextField
            fullWidth
            label="企业名称"
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            error={!!errors.companyName}
            helperText={errors.companyName}
            disabled={loading}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="信用分数"
              type="number"
              value={formData.creditScore}
              onChange={(e) => handleChange("creditScore", Number(e.target.value))}
              error={!!errors.creditScore}
              helperText={errors.creditScore || "范围: 0-100"}
              inputProps={{ min: 0, max: 1000 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              select
              label="信用评级"
              value={formData.creditRating}
              onChange={(e) => handleChange("creditRating", e.target.value)}
              error={!!errors.creditRating}
              helperText={errors.creditRating}
              disabled={loading}
            >
              {creditRatingOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="信用额度"
              value={formData.creditLimit}
              onChange={(e) => handleChange("creditLimit", e.target.value)}
              error={!!errors.creditLimit}
              helperText={errors.creditLimit || "例如: 100-300万"}
              disabled={loading}
            />

            <TextField
              fullWidth
              select
              label="风险等级"
              value={formData.riskLevel}
              onChange={(e) => handleChange("riskLevel", e.target.value)}
              error={!!errors.riskLevel}
              helperText={errors.riskLevel}
              disabled={loading}
            >
              {riskLevelOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? "提交中..." : "确认修改"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}