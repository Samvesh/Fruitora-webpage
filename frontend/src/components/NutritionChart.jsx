import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, RadialLinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, RadialLinearScale, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { labels: { color: "rgba(255,255,255,.7)" } }
  },
  scales: {
    r: {
      grid: { color: "rgba(255,255,255,.1)" },
      angleLines: { color: "rgba(255,255,255,.1)" },
      pointLabels: { color: "rgba(255,255,255,.7)" },
      ticks: { display: false }
    },
    x: { ticks: { color: "rgba(255,255,255,.55)" }, grid: { display: false } },
    y: { ticks: { color: "rgba(255,255,255,.55)" }, grid: { color: "rgba(255,255,255,.08)" } }
  }
};

export function MacroRadar({ nutrition, color = "#ffb703" }) {
  const entries = Object.entries(nutrition || {}).filter(([, value]) => typeof value === "number");
  const max = Math.max(...entries.map(([, value]) => value), 1);
  return (
    <div className="grid h-full content-center gap-4">
      {entries.map(([label, value]) => (
        <div key={label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="capitalize text-white/62">{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: `${Math.max(6, (value / max) * 100)}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductionBars({ data }) {
  return (
    <Bar
      options={chartOptions}
      data={{
        labels: data.map((item) => item.country),
        datasets: [
          {
            label: "Production tons",
            data: data.map((item) => item.tons),
            backgroundColor: data.map((item) => item.color || "#ffb703"),
            borderRadius: 16
          }
        ]
      }}
    />
  );
}
