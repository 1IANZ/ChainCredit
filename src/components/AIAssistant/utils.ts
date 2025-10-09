import { Company } from "../DataVisualization/types";


export function buildCreditAnalysisText(company: Company): string {
  const data = company.company_data;
  const profitMargin = data.revenue > 0 ? ((data.net_profit / data.revenue) * 100).toFixed(2) : '0.00';
  const netAssets = (data.total_assets - data.total_liabilities).toFixed(2);
  const netAssetRatio = data.total_assets > 0 ? (((data.total_assets - data.total_liabilities) / data.total_assets) * 100).toFixed(2) : '0.00';

  return `请基于以下企业原始数据进行信贷分析:

【企业基本信息】
企业名称:${data.company_name}
企业ID:${data.company_id}
所属行业:${data.industry}

【财务数据】（单位:万元）
营业收入:${data.revenue.toLocaleString()} 万元
净利润:${data.net_profit.toLocaleString()} 万元
利润率:${profitMargin}%
资产总额:${data.total_assets.toLocaleString()} 万元
负债总额:${data.total_liabilities.toLocaleString()} 万元
净资产:${parseFloat(netAssets).toLocaleString()} 万元
资产负债率:${data.debt_to_asset_ratio}%
净资产占比:${netAssetRatio}%

【创新与研发】
研发投入占比:${data.r_and_d_ratio}%
专利数量:${data.patent_count} 项

【供应链关系】
上游核心企业数量:${data.upstream_core_companies} 家
下游客户数量:${data.downstream_customers} 家

【风险指标】
历史逾期次数:${data.overdue_count} 次
法律诉讼次数:${data.legal_disputes_count} 起`;
}

export function buildAlgorithmCheckText(company: Company): string {
  const data = company.company_data;

  return `请对比以下原始数据与算法计算结果,验证算法的准确性:

【第一部分:原始数据】
企业:${data.company_name}（${data.industry}）

财务数据:
• 营业收入:${data.revenue.toLocaleString()} 万元
• 净利润:${data.net_profit.toLocaleString()} 万元
• 利润率:${data.revenue > 0 ? ((data.net_profit / data.revenue) * 100).toFixed(2) : '0.00'}%
• 资产总额:${data.total_assets.toLocaleString()} 万元
• 负债总额:${data.total_liabilities.toLocaleString()} 万元
• 资产负债率:${data.debt_to_asset_ratio}%

创新能力:
• 研发投入占比:${data.r_and_d_ratio}%
• 专利数量:${data.patent_count} 项

供应链:
• 上游核心企业:${data.upstream_core_companies} 家
• 下游客户:${data.downstream_customers} 家

风险记录:
• 历史逾期:${data.overdue_count} 次
• 法律诉讼:${data.legal_disputes_count} 起

【第二部分:算法计算结果】
• 信用评分:${company.credit_score.toFixed(1)} 分
• 信用评级:${company.credit_rating}
• 授信额度:${company.credit_limit}
• 风险等级:${company.risk_level}`;
}
