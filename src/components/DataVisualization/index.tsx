import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  GlobalStyles,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";

import type { Company, ExcelResult } from "./types";

import CompanyList from "./CompanyList";
import CompanyInfoCard from "./CompanyInfoCard";
import ScoreChart from "./ScoreChart";
import KeyMetricsCard from "./KeyMetricsCard";
import RiskMetricsCard from "./RiskMetricsCard";
import CreditStrategyCard from "./CreditStrategyCard";

import { scrollbarStyles } from "./utils";

import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as LineChartIcon,
  Radar as RadarIcon,
  SmartToy as SmartToyIcon,
} from "@mui/icons-material";

import AIChatDrawer from "./AIChatDrawer";
import { Message } from "../AIAssistant/types";

interface Props {
  data: ExcelResult[];
}

export default function DataVisualization({ data }: Props) {
  const theme = useTheme();
  const allCompanies: Company[] = data.flatMap(result => result.companies || []);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(allCompanies[0] || null);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'radar' | 'line'>('bar');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [publicKey, setPublicKey] = useState<string>("");
  const [isSubmittingBank, setIsSubmittingBank] = useState(false);
  const [bankCreditLimit, setBankCreditLimit] = useState<number | null>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);


  useEffect(() => {
    setAiMessages([]);
    if (!selectedCompany) {
      setBankCreditLimit(null);
      return;
    }

    async function fetchBankLimit() {
      try {
        const limit: number | null = await invoke("get_bank_credit_limit", {
          companyId: selectedCompany?.company_data.company_id,
        });
        setBankCreditLimit(limit);
      } catch {
        setBankCreditLimit(null);
      }
    }

    fetchBankLimit();
  }, [selectedCompany]);

  useEffect(() => {
    async function fetchPublicKey() {
      try {
        const res: string = await invoke("get_public_key");
        setPublicKey(res);
      } catch (error) {
        // ignore
      }
    }

    fetchPublicKey();
  }, []);

  const handleSubmitToBank = async () => {
    if (!selectedCompany) {
      toast.warning("请先选择一个公司");
      return;
    }

    setIsSubmittingBank(true);
    try {
      const limit: number = await invoke("submit_to_bank", {
        companyId: selectedCompany.company_data.company_id,
        companyName: selectedCompany.company_data.company_name,
        creditScore: selectedCompany.credit_score,
        creditRating: selectedCompany.credit_rating,
        creditLimit: selectedCompany.credit_limit,
        riskLevel: selectedCompany.risk_level,
      });
      setBankCreditLimit(limit);
      toast.success(`河北银行批复额度:${limit} 万元`);
    } catch {
      toast.error("提交失败,请稍后重试");
    } finally {
      setIsSubmittingBank(false);
    }
  };

  const handleFetchBankLimit = async () => {
    if (!selectedCompany) return;

    try {
      const limit: number | null = await invoke("get_bank_credit_limit", {
        companyId: selectedCompany.company_data.company_id,
      });
      if (limit !== null) {
        setBankCreditLimit(limit);
        toast.success(`河北银行批复额度:${limit} 万元`);
      } else {
        toast.info("当前公司暂无批复额度,请先提交至河北银行");
      }
    } catch (error) {
      toast.error("获取河北银行批复额度失败");
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedCompany) {
      toast.warning("请先选择一个公司");
      return;
    }

    setIsDownloading(true);
    try {
      const filePath = await save({
        filters: [{ name: 'Excel Report', extensions: ['xlsx'] }],
        defaultPath: `${selectedCompany.company_data.company_name}_信用评估报告.xlsx`
      });

      if (!filePath) {
        toast.error("取消生成报告");
        setIsDownloading(false);
        return;
      }
      await invoke("generate_single_report", {
        filePath,
        company: selectedCompany,
      });

      toast.success("报告生成成功");
    } catch (error) {
      toast.error("生成报告失败");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUploadOnChain = async () => {
    if (!selectedCompany) {
      toast.warning("请先选择一个公司");
      return;
    }

    setIsUploading(true);
    try {
      await invoke("initialize_company", {
        companyId: selectedCompany.company_data.company_id,
        companyName: selectedCompany.company_data.company_name,
        creditScore: selectedCompany.credit_score,
        creditRating: selectedCompany.credit_rating,
        creditLimit: selectedCompany.credit_limit,
        riskLevel: selectedCompany.risk_level,
      });

      toast.success("上链成功");
    } catch (error) {
      toast.error("上链失败");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: 'background.default', overflow: 'hidden', position: 'relative' }}>
      <GlobalStyles styles={scrollbarStyles(theme)} />


      <Paper
        elevation={2}
        sx={{
          width: 280,
          flexShrink: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, flexShrink: 0 }}>
          企业列表 ({allCompanies.length})
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
          <CompanyList
            companies={allCompanies}
            selectedCompany={selectedCompany}
            onSelect={setSelectedCompany}
          />
        </Box>
      </Paper>

      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          overflowY: "auto",
          overflowX: "hidden",
          height: "100vh",
          minWidth: 0
        }}
      >
        {selectedCompany && (
          <>
            <CompanyInfoCard
              company={selectedCompany}
              isDownloading={isDownloading}
              onDownload={handleDownloadReport}
              isUploading={isUploading}
              onUpload={handleUploadOnChain}
              isSubmittingBank={isSubmittingBank}
              onSubmitToBank={handleSubmitToBank}
              bankCreditLimit={bankCreditLimit}
              onFetchBankLimit={handleFetchBankLimit}
              publikKey={publicKey}
            />

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(_e, newType) => newType && setChartType(newType)}
                aria-label="chart type"
                sx={{ flexWrap: 'wrap' }}
              >
                <ToggleButton value="bar">
                  <BarChartIcon sx={{ mr: 1 }} />维度得分
                </ToggleButton>
                <ToggleButton value="radar">
                  <RadarIcon sx={{ mr: 1 }} />能力雷达
                </ToggleButton>
                <ToggleButton value="pie">
                  <PieChartIcon sx={{ mr: 1 }} />得分构成
                </ToggleButton>
                <ToggleButton value="line">
                  <LineChartIcon sx={{ mr: 1 }} />财务数据
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Paper elevation={2} sx={{ p: { xs: 1, sm: 2, md: 3 }, height: 400, mb: 2 }}>
              <ScoreChart company={selectedCompany} chartType={chartType} />
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <KeyMetricsCard company={selectedCompany} />
              <RiskMetricsCard company={selectedCompany} />
              <CreditStrategyCard company={selectedCompany} />
            </Box>
          </>
        )}
      </Box>


      <Fab
        color="secondary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1300,
          boxShadow: 4,
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s'
          }
        }}
        onClick={() => setAiDrawerOpen(true)}
      >
        <SmartToyIcon />
      </Fab>


      <Fab
        color="secondary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1300,
          boxShadow: 4,
          '&:hover': { transform: 'scale(1.1)', transition: 'transform 0.2s' }
        }}
        onClick={() => setAiDrawerOpen(true)}
      >
        <SmartToyIcon />
      </Fab>

      <AIChatDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        company={selectedCompany}
        messages={aiMessages}
        setMessages={setAiMessages}
      />
    </Box>
  );
}