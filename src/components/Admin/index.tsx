import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAtom } from "jotai";
import { titleAtom } from "../../utils/store";
import { invoke } from "@tauri-apps/api/core";
import {
  Box, AppBar, Toolbar, Typography, Button, Chip, Tooltip, Container, CircularProgress,
  useTheme,
  GlobalStyles,
  IconButton,
  Stack
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon
} from "@mui/icons-material";
import { toast } from "sonner";
import { scrollbarStyles } from "../../components/DataVisualization/utils";

import { CompanyChainData, SortOrder } from "./types";
import StatsCards from "./StatsCards";
import SearchBar from "./SearchBar";
import CompanyTable from "./CompanyTable";
import CompanyDetailDialog from "./CompanyDetailDialog";
import CompanyEditDialog from "./CompanyEditDialog";
import CompanyDeleteDialog from "./CompanyDeleteDialog";

export default function Admin() {
  const theme = useTheme();
  const [_title, setTitle] = useAtom(titleAtom);
  const navigate = useNavigate();

  const [publicKey, setPublicKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyChainData[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyChainData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 详情对话框
  const [selectedCompany, setSelectedCompany] = useState<CompanyChainData | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // 编辑对话框
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyChainData | null>(null);

  // 删除确认对话框
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 初始化
  useEffect(() => {
    async function initialize() {
      try {
        const res: string = await invoke("get_public_key");
        if (!res) {
          toast.error("请先登录");
          navigate("/login", { replace: true });
          return;
        }
        setPublicKey(res);
        await fetchCompaniesData();
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        navigate("/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    }
    setTitle("Admin");
    initialize();
    return () => setTitle("");
  }, [setTitle, navigate]);

  // 获取链上企业数据
  const fetchCompaniesData = async () => {
    setIsRefreshing(true);
    try {
      const data: CompanyChainData[] = await invoke("get_all_companies");
      setCompanies(data);
      setFilteredCompanies(data);
      toast.success(`成功获取 ${data.length} 条链上数据`);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      toast.error("获取链上数据失败");
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 搜索过滤
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies);
      return;
    }
    const filtered = companies.filter(
      (c) =>
        c.company_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.credit_rating.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.risk_level.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  // 排序 - 只按信用分数排序
  const handleSort = () => {
    const sorted = [...filteredCompanies].sort((a, b) => {
      return sortOrder === "asc"
        ? a.credit_score - b.credit_score
        : b.credit_score - a.credit_score;
    });
    setFilteredCompanies(sorted);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // 返回上一页
  const handleGoBack = () => {
    navigate(-1);
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      await invoke("clear_private_key");
      toast.success("已退出登录");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("退出登录失败");
    }
  };

  // 复制公钥
  const handleCopyPublicKey = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
      toast.success("公钥已复制到剪贴板");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("复制失败");
    }
  };

  // 查看详情
  const handleViewDetail = (c: CompanyChainData) => {
    setSelectedCompany(c);
    setDetailDialogOpen(true);
  };

  // 编辑企业
  const handleEdit = (company: CompanyChainData) => {
    setEditingCompany(company);
    setEditDialogOpen(true);
  };

  // 更新企业
  const handleUpdateCompany = async (
    companyId: string,
    companyName: string,
    creditScore: number,
    creditRating: string,
    creditLimit: string,
    riskLevel: string
  ) => {
    await invoke("update_company", {
      companyId,
      companyName,
      creditScore,
      creditRating,
      creditLimit,
      riskLevel,
    });
    toast.success("企业信息更新成功");
    await fetchCompaniesData();
  };

  // 删除点击
  const handleDeleteClick = (company: CompanyChainData) => {
    setDeleteTarget({ id: company.company_id, name: company.company_name });
    setDeleteConfirmOpen(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await invoke("delete_company", { companyId: deleteTarget.id });
      toast.success("企业删除成功");
      await fetchCompaniesData();
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("删除失败,请重试");
    } finally {
      setIsDeleting(false);
    }
  };

  const truncateAddress = (address: string, start = 6, end = 6) => {
    if (!address) return "";
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  // 统计数据
  const stats = {
    totalCompanies: companies.length,
    avgCreditScore: companies.length > 0
      ? Math.round(companies.reduce((sum, c) => sum + c.credit_score, 0) / companies.length)
      : 0,
    highRiskCount: companies.filter((c) => c.risk_level === "高" || c.risk_level === "极高").length,
    excellentRating: companies.filter((c) => c.credit_rating === "AAA" || c.credit_rating === "AA").length,
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 32px)" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 48px)", ...scrollbarStyles }}>
      <GlobalStyles styles={scrollbarStyles(theme)} />
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleGoBack}
            sx={{ mr: 1 }}
            aria-label="返回"
          >
            <ArrowBackIcon />
          </IconButton>

          <BusinessIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            企业信用评估链上数据系统
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip
              title={
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    完整公钥地址:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      maxWidth: 400
                    }}
                  >
                    {publicKey}
                  </Typography>
                </Box>
              }
              arrow
              placement="bottom"
            >
              <Chip
                label={truncateAddress(publicKey)}
                size="medium"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                  cursor: 'pointer',
                }}
                onClick={handleCopyPublicKey}
                deleteIcon={
                  <ContentCopyIcon
                    sx={{
                      color: 'white !important',
                      fontSize: '1rem'
                    }}
                  />
                }
                onDelete={handleCopyPublicKey}
              />
            </Tooltip>

            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              退出
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, flexGrow: 1, overflow: "auto" }}>
        <StatsCards stats={stats} />
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isRefreshing={isRefreshing}
          onRefresh={fetchCompaniesData}
        />
        <CompanyTable
          companies={companies}
          filteredCompanies={filteredCompanies}
          sortOrder={sortOrder}
          onSort={handleSort}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          searchTerm={searchTerm}
        />
      </Container>

      {/* 详情对话框 */}
      <CompanyDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        company={selectedCompany}
      />

      {/* 编辑对话框 */}
      <CompanyEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        company={editingCompany}
        onUpdate={handleUpdateCompany}
      />

      {/* 删除确认对话框 */}
      <CompanyDeleteDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        companyName={deleteTarget?.name || ""}
        companyId={deleteTarget?.id || ""}
        loading={isDeleting}
      />
    </Box>
  );
}