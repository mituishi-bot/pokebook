// RadarChart.jsx
import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js のコンポーネントを登録
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function RadarChart({ stats }) {
  const data = {
    labels: ["HP", "攻撃", "防御", "特攻", "特防", "速度"],
    datasets: [
      {
        label: "種族値",
        data: [
          stats.hp,
          stats.attack,
          stats.defense,
          stats.specialAttack,
          stats.specialDefense,
          stats.speed,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 5,
        pointRadius: 10,
        pointHoverRadius: 20,
        hitRadius: 10,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: "auto",
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: true,
      },
    },
  };

  return <Radar data={data} options={options} />;
}

export default RadarChart;
