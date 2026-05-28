import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { ScriptableContext } from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);
interface TrendItem {
    accuracy: number;
    createdAt: string;
}

export default function TrendLineChart({ data }: { data: TrendItem[] }) {
    const labels = data.map((item) =>
        new Date(item.createdAt).toLocaleDateString()
    );

    const chartData = {
        labels,
        datasets: [
            {
                label: "Score Trend",
                data: data.map((item) => item.accuracy),
                borderColor: "#c52294",
                tension: 0.4, 
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                animation: {
                    duration: 1200,
                },
                backgroundColor: (context: ScriptableContext<"line">) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;

                    if (!chartArea) return "rgba(33, 38, 35, 0.2)"; // fallback

                    const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
                    gradient.addColorStop(0, "#cf6cb1");
                    gradient.addColorStop(1, "#c522942f");

                    return gradient;
                },
            },

        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,

        animation: {
            duration: 1200,
            easing: "easeOutQuart",
        },
        transitions: {
            show: {
                animations: {
                    x: {
                        from: 0,
                    },
                    y: {
                        from: 0,
                    },
                },
            },
        },

        plugins: {
            legend: {
                display: false,
                labels: {
                    color: "rgb(218, 83, 200)",
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: "rgba(217, 133, 206, 0.733)",
                },
                grid: {
                    color: "rgba(244, 151, 232, 0.386)",
                },
            },
            y: {
                min: 0,
                max: 2,

                title: {
                    display: true,
                    text: "Score Trend", 
                    color: "rgb(218, 83, 200)",
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                },

                ticks: {
                    stepSize: 0.1,
                    color: "rgba(217, 133, 206, 0.733)",
                },

                grid: {
                    color: "rgba(244, 151, 232, 0.386)",
                },
            },
        },
    };

    return <Line key={JSON.stringify(data)} data={chartData} options={options} />;
}