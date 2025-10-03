import { useState, useEffect } from "react";
import { Box, Paper, GlobalStyles, ToggleButton, ToggleButtonGroup } from "@mui/material";
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
import { scrollbarStyles } from "./utils";

import { BarChart as BarChartIcon, PieChart as PieChartIcon, Timeline as LineChartIcon, Radar as RadarIcon } from "@mui/icons-material";
import CreditStrategyCard from "./CreditStrategyCard";

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

  useEffect(() => {
    async function fetchPublicKey() {
      try {
        const res: string = await invoke("get_public_key");
        setPublicKey(res);
        console.log(publicKey)
      } catch (error) {
        console.error("Failed to fetch public key:", error);
      }
    }

    fetchPublicKey();
  }, []);

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
      console.log(error);
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
      await invoke("upload_on_chain", {
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
    <Box sx={{ display: "flex", height: "100vh", bgcolor: 'background.default', overflow: 'hidden' }}>
      <GlobalStyles styles={scrollbarStyles(theme)} />

      <Paper
        elevation={2}
        sx={{
          width: 280,
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

      <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto", height: "calc(100vh - 36px)" }}>
        {selectedCompany && (
          <>
            <CompanyInfoCard
              company={selectedCompany}
              isDownloading={isDownloading}
              onDownload={handleDownloadReport}
              isUploading={isUploading}
              onUpload={handleUploadOnChain}
              publikKey={publicKey}
            />

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(_e, newType) => newType && setChartType(newType)}
                aria-label="chart type"
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
    </Box>
  );
}
