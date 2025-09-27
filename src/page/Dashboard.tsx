import { useEffect } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router";
import DataVisualization from "../components/DataVisualization";
import { DataAtom } from "../utils/store";
import TitleBar from "../components/TitleBar";

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

  return <>
    <TitleBar title="Main" />
    <DataVisualization data={processedData} />
  </>;
}
