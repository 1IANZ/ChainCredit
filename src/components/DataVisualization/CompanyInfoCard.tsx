import {
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Box,
  Stack,
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
  isSubmittingBank?: boolean;
  onSubmitToBank?: () => void;
  bankCreditLimit?: number | null;
  onFetchBankLimit?: () => void;
  publikKey?: string;
}

export default function CompanyInfoCard({
  company,
  isDownloading,
  onDownload,
  isUploading = false,
  onUpload,
  isSubmittingBank = false,
  onSubmitToBank,
  bankCreditLimit,
  publikKey
}: Props) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'flex-start' }}
          spacing={2}
          sx={{ mb: 3 }}
        >

          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {company.company_data.company_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              行业: {company.company_data.industry}
            </Typography>
          </Box>


          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{
              minWidth: { sm: 'auto' },
              alignItems: 'stretch'
            }}
          >

            {bankCreditLimit == null ? (
              <Button
                variant="contained"
                color="success"
                disabled={isSubmittingBank}
                onClick={onSubmitToBank}
                sx={{ minWidth: 140 }}
              >
                {isSubmittingBank ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "提交至河北银行"
                )}
              </Button>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  minWidth: 140,
                  boxShadow: 1
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  银行额度:{bankCreditLimit}万元
                </Typography>
              </Box>
            )}

            {publikKey && (
              <Button
                variant="contained"
                startIcon={!isUploading && <CloudUploadIcon />}
                onClick={onUpload}
                disabled={isUploading}
                sx={{ minWidth: 120 }}
              >
                {isUploading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "数据上链"
                )}
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={!isDownloading && <DownloadIcon />}
              onClick={onDownload}
              disabled={isDownloading}
              sx={{ minWidth: 120 }}
            >
              {isDownloading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "下载报告"
              )}
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(4, 1fr)'
            },
            gap: 3
          }}
        >

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              信用评分
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {company.credit_score.toFixed(1)}
            </Typography>
          </Box>


          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              信用评级
            </Typography>
            <Box
              component="span"
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: getRatingColor(company.credit_rating),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                borderRadius: 1,
                display: 'inline-block'
              }}
            >
              {company.credit_rating}
            </Box>
          </Box>


          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              信用额度
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {company.credit_limit}
            </Typography>
          </Box>


          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              风险等级
            </Typography>
            <Box
              component="span"
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: getRiskLevelColor(company.risk_level),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                borderRadius: 1,
                display: 'inline-block'
              }}
            >
              {company.risk_level}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}