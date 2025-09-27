import { useEffect } from "react";
import { useNavigate } from "react-router";

import { DataAtom, titleAtom } from "../utils/store";
import { useAtom } from "jotai";
import DataVisualization from "../components/DataVisualization";

export default function Dashboard() {
  const [_title, setTitle] = useAtom(titleAtom);
  const [processedData] = useAtom(DataAtom);
  const navigate = useNavigate();

  useEffect(() => {
    setTitle("Main");
    if (!processedData || processedData.length === 0) {
      navigate("/");
    }
  }, [setTitle, processedData, navigate]);

  if (!processedData || processedData.length === 0) return null;

  return <DataVisualization data={processedData} />;
}
