import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";

import type { Plugin, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { useRef, useEffect, useState, useMemo } from "react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const easeInOutQuad = (t: number) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const computeRollingAccuracy = (history: boolean[], windowSize = 5) => {
    const numeric = history.map(v => (v ? 1 : 0));
    const result: number[] = [];

    for (let i = 0; i < numeric.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const slice = numeric.slice(start, i + 1);
        result.push(slice.reduce((a, b) => a + b, 0 as number) / slice.length);
    }

    return result;
};

const heartbeatPlugin: Plugin<"line"> = {
    id: "heartbeatRAC",

    beforeDatasetsDraw(chart, _args, opts: any) {
        const p = opts._progress ?? null;
        if (p === null || p >= 1) return;

        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        ctx.save();
        ctx.beginPath();
        ctx.rect(
            chartArea.left,
            chartArea.top - 10,
            (chartArea.right - chartArea.left) * p,
            chartArea.bottom - chartArea.top + 20
        );
        ctx.clip();
    },

    afterDatasetsDraw(chart, _args, opts: any) {
        const p = opts._progress ?? null;
        if (p === null || p >= 1) return;

        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const x = chartArea.left + (chartArea.right - chartArea.left) * p;

        ctx.strokeStyle = "rgba(59,130,246,0.5)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);

        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.restore();
    },
};

ChartJS.register(heartbeatPlugin);

interface Props {
    history: boolean[];
}

export default function RollingAccuracyChart({ history }: Props) {
    const chartRef = useRef<any>(null);
    const rafRef = useRef<number>(0);
    const DURATION = 1800;

    const [isDark] = useState(() =>
        document.documentElement.classList.contains("dark")
    );

    const colors = useMemo(
        () => ({
            text: "#72a4bde2",
            ticks: "#72a4bde2",
            grid: "#b4d6e970",
            line: "#3b82f6",
            mean: "#ef4444",
        }),
        []
    );

    const rolling = useMemo(
        () => computeRollingAccuracy(history, 5),
        [history]
    );

    const mean =
        rolling.length > 0
            ? rolling.reduce((a, b) => a + b, 0) / rolling.length
            : 0;

    const runAnimation = () => {
        cancelAnimationFrame(rafRef.current);

        const start = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - start) / DURATION, 1);
            const eased = easeInOutQuad(progress);

            const chart = chartRef.current;

            if (chart) {
                chart.options.plugins.heartbeatRAC._progress = eased;
                chart.update("none");
            }

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);
    };

    useEffect(() => {
        let f1: number, f2: number;

        f1 = requestAnimationFrame(() => {
            f2 = requestAnimationFrame(runAnimation);
        });

        return () => {
            cancelAnimationFrame(f1);
            cancelAnimationFrame(f2);
            cancelAnimationFrame(rafRef.current);
        };
    }, [history]);

    const labels = rolling.map((_, i) => `Q${i + 1}`);

    const chartData = useMemo(
        () => ({
            labels,
            datasets: [
                {
                    label: "Rolling Accuracy",
                    data: rolling,
                    borderColor: colors.line,
                    borderWidth: 2,
                    tension: 0,
                    fill: false,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: "Mean Accuracy",
                    data: new Array(rolling.length).fill(mean),
                    borderColor: colors.mean,
                    borderDash: [8, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                },
            ],
        }),
        [rolling, mean, colors, labels]
    );

    const options: ChartOptions<"line"> = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,

            animation: { duration: 0 },

            plugins: {
                legend: {
                    display: true,
                    position: "top",
                },
                heartbeatRAC: { _progress: null } as any,
            },

            scales: {
                x: {
                    ticks: { color: colors.text },
                    grid: { color: colors.grid },
                },
                y: {
                    min: 0,
                    max: 1,
                    ticks: { color: colors.ticks },
                    grid: { color: colors.grid },
                },
            },
        }),
        [colors]
    );

    return (
        <Line
            key={String(isDark)}
            ref={chartRef}
            data={chartData}
            options={options}
        />
    );
}