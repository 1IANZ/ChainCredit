import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  companyName: string;
  companyId: string;
  loading?: boolean;
}

export default function CompanyDeleteDialog({
  open,
  onClose,
  onConfirm,
  companyName,
  companyId,
  loading = false
}: Props) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="error" />
          <Typography variant="h6">确认删除</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography>
            确定要删除以下企业吗？
          </Typography>

          <Box
            sx={{
              p: 2,

              borderRadius: 1,
              borderLeft: 3,
              borderColor: "error.main"
            }}
          >
            <Typography variant="body2" color="text.secondary">
              企业名称
            </Typography>
            <Typography variant="h6" gutterBottom>
              {companyName}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              企业ID
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {companyId}
            </Typography>
          </Box>

          <Alert severity="error" icon={<WarningIcon />}>
            此操作将从区块链上删除该企业的所有数据，<strong>不可恢复</strong>！
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading ? "删除中..." : "确认删除"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}