import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel,
  Typography, Box, Button, Alert, Chip, Paper
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from "@mui/icons-material";
import { CompanyChainData, SortField, SortOrder } from "./types";
import { getRatingColor, getRiskLevelColor } from "../../components/DataVisualization/utils";

interface Props {
  companies: CompanyChainData[];
  filteredCompanies: CompanyChainData[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onViewDetail: (c: CompanyChainData) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
}

export default function CompanyTable({
  companies,
  filteredCompanies,
  sortField,
  sortOrder,
  onSort,
  onViewDetail,
  onDelete,
  searchTerm
}: Props) {
  const getRiskChipColor = (risk: string): "success" | "warning" | "error" | "default" => {
    if (risk === "低") return "success";
    if (risk === "中") return "warning";
    return "error";
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === "company_id"}
                  direction={sortField === "company_id" ? sortOrder : "asc"}
                  onClick={() => onSort("company_id")}
                >
                  企业ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "company_name"}
                  direction={sortField === "company_name" ? sortOrder : "asc"}
                  onClick={() => onSort("company_name")}
                >
                  企业名称
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "credit_score"}
                  direction={sortField === "credit_score" ? sortOrder : "asc"}
                  onClick={() => onSort("credit_score")}
                >
                  信用分数
                </TableSortLabel>
              </TableCell>
              <TableCell>信用评级</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "credit_limit"}
                  direction={sortField === "credit_limit" ? sortOrder : "asc"}
                  onClick={() => onSort("credit_limit")}
                >
                  信用额度(万元)
                </TableSortLabel>
              </TableCell>
              <TableCell>风险等级</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">暂无链上数据</Alert>
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                      {company.company_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {company.company_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6" color="primary">
                        {company.credit_score}
                      </Typography>
                      {company.credit_score >= 700 ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.credit_rating}
                      size="small"
                      sx={{
                        backgroundColor: getRatingColor(company.credit_rating),
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      ¥{(company.credit_limit / 10000).toFixed(2)}万
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.risk_level}
                      color={getRiskChipColor(company.risk_level)}
                      size="small"
                      sx={{
                        backgroundColor: getRiskLevelColor(company.risk_level),
                        color: "white",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => onViewDetail(company)}
                      sx={{ mr: 1 }}
                    >
                      详情
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={() => onDelete(company.company_id)}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          共 {filteredCompanies.length} 条记录
          {searchTerm && ` (从 ${companies.length} 条中筛选)`}
        </Typography>
      </Box>
    </>
  );
}
