
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./page/login";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
