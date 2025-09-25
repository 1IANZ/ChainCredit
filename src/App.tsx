
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./page/login";
import Main from "./page/main";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}
