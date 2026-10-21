import { useEffect, useRef } from 'react';
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip);
Chart.defaults.font.family = 'Inter, Helvetica, Arial, sans-serif';

const GREEN = '#2F9338';

/**
 * Grafik bergaya Material Dashboard (pengaturan disalin dari demo referensi):
 * tooltip mode indeks yang bergeser halus antar titik, sorotan batang saat hover, animasi saat dimuat.
 * `titles` (opsional) = judul tooltip per titik, mis. nama hari lengkap.
 */
export default function MaterialChart({ type = 'bar', labels, data, label, titles, color = GREEN, height = 170, className = '', ariaLabel }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const titlesRef = useRef(titles);
    titlesRef.current = titles;

    useEffect(() => {
        const chart = new Chart(canvasRef.current, {
            type,
            data: {
                labels,
                datasets: [type === 'bar' ? {
                    label,
                    data,
                    borderWidth: 0,
                    borderRadius: 4,
                    borderSkipped: false,
                    backgroundColor: color,
                    maxBarThickness: 44,
                } : {
                    label,
                    data,
                    tension: 0,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 4,
                    pointBackgroundColor: color,
                    pointBorderColor: 'transparent',
                    borderColor: color,
                    backgroundColor: 'transparent',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (items) => titlesRef.current?.[items[0].dataIndex] ?? items[0].label,
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: 4,
                        border: { display: false, dash: [5, 5] },
                        grid: { display: true, drawOnChartArea: true, drawTicks: false, color: '#e5e5e5' },
                        ticks: { precision: 0, padding: 10, color: '#737373', font: { size: 12, lineHeight: 2 } },
                    },
                    x: {
                        border: { display: false },
                        grid: { display: false, drawOnChartArea: false, drawTicks: false },
                        ticks: { display: true, padding: 10, color: '#737373', font: { size: 12, lineHeight: 2 } },
                    },
                },
            },
        });
        chartRef.current = chart;

        return () => chart.destroy();
        // Grafik dibuat sekali; perubahan data ditangani efek di bawah agar animasinya mulus.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    // Data baru dari pembaruan latar belakang: animasikan ke nilai baru tanpa membuat ulang grafik.
    const signature = JSON.stringify([labels, data]);
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature]);

    return (
        // `className` dapat menggantikan tinggi tetap, mis. agar grafik mengisi sisa tinggi kartu.
        <div className={`relative ${className}`} style={className ? undefined : { height }}>
            <canvas ref={canvasRef} role="img" aria-label={ariaLabel ?? label} />
        </div>
    );
}
