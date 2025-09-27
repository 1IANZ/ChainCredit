import { useEffect } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router";
import DataVisualization from "../components/DataVisualization";
import { DataAtom } from "../utils/store";

export default function DataVisualizationPage() {
  const [processedData] = useAtom(DataAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (!processedData || processedData.length === 0) {
      navigate("/");
    }
  }, [processedData, navigate]);

  if (!processedData || processedData.length === 0) {
    return null;
  }

  return <DataVisualization data={processedData} />;
}
