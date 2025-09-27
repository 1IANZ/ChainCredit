import { Box } from "@mui/material";
import { useAtomValue } from "jotai";
import { Outlet } from "react-router";
import { titleAtom } from "../utils/store";
import TitleBar from "../components/TitleBar";
export default function AppLayout() {
  const title = useAtomValue(titleAtom);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TitleBar title={title} />
      <Outlet />
    </Box >
  );
}
