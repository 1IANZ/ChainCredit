import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { useTheme } from "@mui/material";
import Upload from "./page/Upload";
import AppLayout from "./page/AppLayout";
import Dashboard from "./page/Dashboard";
import Login from "./page/Login";
import Admin from "./page/Admin";
export default function App() {
  const theme = useTheme();
  return (
    <BrowserRouter>
      <Routes >
        <Route path="/" element={<AppLayout />} >
          <Route index element={<Upload />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
      <Toaster theme={theme.palette.mode} />
    </BrowserRouter>
  );
}
