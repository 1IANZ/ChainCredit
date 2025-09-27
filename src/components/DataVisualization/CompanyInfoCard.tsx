import {
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Box
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getRatingColor, getRiskLevelColor } from "./utils";
import type { Company } from "./types";

interface Props {
  company: Company;
  isDownloading: boolean;
  onDownload: () => void;
  isUploading?: boolean;
  onUpload?: () => void;
}

export default function CompanyInfoCard({
  company,
  isDownloading,
  onDownload,
  isUploading = false,
  onUpload
}: Props) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">{company.company_data.company_name}</Typography>
            <Typography variant="body2" color="text.secondary">行业: {company.company_data.industry}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>

            <Button
              variant="outlined"
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
              onClick={onUpload}
              disabled={isUploading}
            >
              {isUploading ? "上链中..." : "上链存证"}
            </Button>


            <Button
              variant="contained"
              startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={onDownload}
              disabled={isDownloading}
            >
              {isDownloading ? "生成中..." : "下载报告"}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="body2" color="text.secondary">信用评分</Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">{company.credit_score.toFixed(1)}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="body2" color="text.secondary">信用评级</Typography>
            <Typography>
              <Box
                component="span"
                sx={{
                  mt: 0.5,
                  px: 1,
                  py: 0.25,
                  bgcolor: getRatingColor(company.credit_rating),
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '4px'
                }}
              >
                {company.credit_rating}
              </Box>
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="body2" color="text.secondary">信用额度</Typography>
            <Typography variant="h6" fontWeight="bold">{company.credit_limit}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="body2" color="text.secondary">风险等级</Typography>
            <Typography>
              <Box
                component="span"
                sx={{
                  mt: 0.5,
                  px: 1,
                  py: 0.25,
                  bgcolor: getRiskLevelColor(company.risk_level),
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '4px'
                }}
              >
                {company.risk_level}
              </Box>
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
