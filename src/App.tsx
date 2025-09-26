
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import Login from "./page/login";
import Main from "./page/main";
import { useTheme } from "@mui/material";
export default function App() {
  const theme = useTheme();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />

      </Routes>
      <Toaster theme={theme.palette.mode} />
    </BrowserRouter>
  );
}
