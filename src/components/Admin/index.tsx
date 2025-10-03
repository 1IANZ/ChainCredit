import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAtom } from "jotai";
import { titleAtom } from "../../utils/store";
import { invoke } from "@tauri-apps/api/core";
import {
  Box, AppBar, Toolbar, Typography, Button, Chip, Tooltip, Container, CircularProgress,
  useTheme,
  GlobalStyles
} from "@mui/material";
import { Logout as LogoutIcon, Business as BusinessIcon } from "@mui/icons-material";
import { toast } from "sonner";
import { scrollbarStyles } from "../../components/DataVisualization/utils";

import { CompanyChainData, SortField, SortOrder } from "./types";
import StatsCards from "./StatsCards";
import SearchBar from "./SearchBar";
import CompanyTable from "./CompanyTable";
import CompanyDetailDialog from "./CompanyDetailDialog";
export default function Admin() {
  const theme = useTheme();
  const [_title, setTitle] = useAtom(titleAtom);
  const navigate = useNavigate();

  const [publicKey, setPublicKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyChainData[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyChainData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("credit_score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyChainData | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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
      const data: CompanyChainData[] = await invoke("get_all_companies_from_chain");
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

  // 排序
  const handleSort = (field: SortField) => {
    const sorted = [...filteredCompanies].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comp = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortOrder === "asc" ? comp : -comp;
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    setFilteredCompanies(sorted);
    setSortField(field);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
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

  // 查看详情
  const handleViewDetail = (c: CompanyChainData) => {
    setSelectedCompany(c);
    setDetailDialogOpen(true);
  };

  // 删除
  const handleDelete = async (companyId: string) => {
    try {
      await invoke("delete_company_from_chain", { companyId });
      toast.success("企业删除成功");
      await fetchCompaniesData();
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("删除失败，请重试");
    }
  };

  const truncateAddress = (address: string, start = 8, end = 8) => {
    if (!address) return "";
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  // 统计数据
  const stats = {
    totalCompanies: companies.length,
    avgCreditScore: companies.length > 0 ? Math.round(companies.reduce((sum, c) => sum + c.credit_score, 0) / companies.length) : 0,
    highRiskCount: companies.filter((c) => c.risk_level === "高" || c.risk_level === "极高").length,
    totalCreditLimit: companies.reduce((sum, c) => sum + c.credit_limit, 0),
    excellentRating: companies.filter((c) => c.credit_rating.startsWith("AAA") || c.credit_rating.startsWith("AA")).length,
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
      <AppBar position="static">
        <Toolbar>
          <BusinessIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            企业信用评估链上数据系统
          </Typography>
          <Tooltip title={publicKey}>
            <Chip label={truncateAddress(publicKey)} color="secondary" sx={{ mr: 2 }} />
          </Tooltip>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            退出
          </Button>
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
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onViewDetail={handleViewDetail}
          onDelete={handleDelete}
          searchTerm={searchTerm}
        />
      </Container>


      <CompanyDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        company={selectedCompany}
      />
    </Box>
  );
}
