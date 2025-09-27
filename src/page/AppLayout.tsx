import { Box } from "@mui/material";
import TitleBar from "../components/TitleBar";
import { Outlet } from "react-router";
export default function AppLayout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TitleBar title="企业信用评估系统" />
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
