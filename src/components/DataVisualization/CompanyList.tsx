import { useState, useMemo, useEffect } from "react";
import {
  List, ListItemButton, Typography, Chip, Box,
  Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { getRatingColor } from "./utils";
import type { Company } from "./types";

interface Props {
  companies: Company[];
  selectedCompany: Company | null;
  onSelect: (company: Company) => void;
}

export default function CompanyList({ companies, selectedCompany, onSelect }: Props) {
  const [sortBy, setSortBy] = useState<"none" | "scoreDesc" | "scoreAsc" | "rating">("none");
  const [filter, setFilter] = useState<"all" | "highCredit" | "highRisk">("all");

  const visibleCompanies = useMemo(() => {
    let filtered = companies;

    if (filter === "highCredit") {
      filtered = filtered.filter(c => ["AAA", "AA", "A", "BBB"].includes(c.credit_rating));
    } else if (filter === "highRisk") {
      filtered = filtered.filter(c => c.risk_level === "高");
    }

    if (sortBy === "scoreDesc") return [...filtered].sort((a, b) => b.credit_score - a.credit_score);
    if (sortBy === "scoreAsc") return [...filtered].sort((a, b) => a.credit_score - b.credit_score);
    if (sortBy === "rating") return [...filtered].sort((a, b) => a.credit_rating.localeCompare(b.credit_rating));


    return filtered;
  }, [companies, sortBy, filter]);


  useEffect(() => {
    if (!selectedCompany && visibleCompanies.length > 0) {
      onSelect(visibleCompanies[0]);
    }
  }, [visibleCompanies, selectedCompany, onSelect]);


  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ display: "flex", gap: 1, p: 1, flexShrink: 0 }}>
        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>排序</InputLabel>
          <Select value={sortBy} label="排序" onChange={(e) => setSortBy(e.target.value as any)}>
            <MenuItem value="none">默认</MenuItem>
            <MenuItem value="scoreDesc">评分 ↓</MenuItem>
            <MenuItem value="scoreAsc">评分 ↑</MenuItem>
            <MenuItem value="rating">信用评级</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>筛选</InputLabel>
          <Select value={filter} label="筛选" onChange={(e) => setFilter(e.target.value as any)}>
            <MenuItem value="all">全部</MenuItem>
            <MenuItem value="highCredit">高信用</MenuItem>
            <MenuItem value="highRisk">高风险</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <List sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
        {visibleCompanies.map((company) => (
          <ListItemButton
            key={company.company_data.company_id}
            selected={selectedCompany?.company_data.company_id === company.company_data.company_id}
            onClick={() => onSelect(company)}
            sx={{
              borderBottom: '1px solid',
              borderBottomColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
            }}
          >
            <Typography variant="subtitle2" noWrap sx={{ maxWidth: 140, flexShrink: 0 }}>
              {company.company_data.company_name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {company.credit_score.toFixed(1)}
              </Typography>
              <Chip
                label={company.credit_rating}
                size="small"
                sx={{ bgcolor: getRatingColor(company.credit_rating), color: 'white', height: 22 }}
              />
            </Box>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
