import { Box } from "@mui/material";
import { Outlet } from "react-router";
export default function AppLayout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Outlet />
    </Box >
  );
}
