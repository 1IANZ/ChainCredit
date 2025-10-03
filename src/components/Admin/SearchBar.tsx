import { Box, Button, CircularProgress, InputAdornment, Paper, TextField } from "@mui/material";
import { Search as SearchIcon, Refresh as RefreshIcon } from "@mui/icons-material";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function SearchBar({ searchTerm, setSearchTerm, isRefreshing, onRefresh }: SearchBarProps) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="搜索企业ID、名称、信用评级或风险等级..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={isRefreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          刷新链上数据
        </Button>
      </Box>
    </Paper>
  );
}
