import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";

import { Radar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useState, useEffect } from "react";
import { useMemo } from "react";

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
);

interface RadarItem {
    topic: string;
    score: number;
}

export default function RadarChart({ radarData }: { radarData: RadarItem[] }) {
    const labels = radarData.map((item) => item.topic);

    const data = {
        labels,
        datasets: [
            {
                label: "Your Performance",
                data: radarData.map((item) => item.score),
                backgroundColor: "rgba(168, 85, 247, 0.2)", // purple glow
                borderColor: "#a855f7",
                borderWidth: 2,
                pointBackgroundColor: "#fff",
                pointBorderColor: "#a855f7",
            },

            {
                label: "Target",
                data: radarData.map(() => 80),
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                borderColor: "#22c55e",
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
            },
        ],
    };


    const [theme, setTheme] = useState("");
    useEffect(() => {
        const updateTheme = () => {
            setTheme(document.documentElement.className);
        };

        updateTheme(); // run once

        const observer = new MutationObserver(updateTheme);

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const themeColors = {
    label: "#9b86c7",   
    ticks: "#d7a487",   // medium gray
    grid: "rgba(148,163,184,0.25)", // subtle grid
};

    const options: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,

    animation: {
        duration: 1000,
        easing: "easeOutCubic",
    },

    animations: {
        r: {
            from: 0,
        },
        rotation: {
            duration: 1200,
            easing: "easeOutCubic",
        },
    },

    plugins: {
        legend: {
            position: "top",
            labels: {
                color: themeColors.label,
                boxWidth: 12,
                boxHeight: 12,
            },
        },
    },

    scales: {
        r: {
            min: 0,
            max: 100,
            beginAtZero: true,

            ticks: {
                stepSize: 20,
                color: themeColors.ticks,
                backdropColor: "transparent",
                padding: 10,
            },

            grid: {
                color: themeColors.grid,
            },

            angleLines: {
                color: themeColors.grid,
            },

            pointLabels: {
                color: themeColors.label,
                font: {
                    size: 12,
                },
            },
        },
    },
};

    return <Radar key={theme + JSON.stringify(radarData)} data={data} options={options} />
}
