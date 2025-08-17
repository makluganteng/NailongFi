'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PortfolioChartProps {
    totalValue: number;
    walletAddress?: `0x${string}`;
}

interface ChartPoint {
    x: number;
    y: number;
    value: number;
    date: string;
}

export function PortfolioChart({ totalValue, walletAddress }: PortfolioChartProps) {
    const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Generate sample data points for the last 7 days with APY growth
    // In a real app, this would come from your backend/API
    const generateChartData = (): ChartPoint[] => {
        const points: ChartPoint[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            let value = totalValue;

            if (totalValue > 0) {
                // Calculate days ago from today
                const daysAgo = 6 - i;

                // Apply 30% APY compounded daily
                // Formula: Future Value = Present Value * (1 + r/n)^(n*t)
                // Where: r = 0.30 (30% APY), n = 365 (daily compounding), t = days/365
                const dailyRate = 0.30 / 365;
                const daysElapsed = daysAgo;

                // Calculate the projected value with APY
                value = totalValue * Math.pow(1 + dailyRate, daysElapsed);

                // Add some realistic market volatility (±2% daily variation)
                const volatility = (Math.random() - 0.5) * 0.04;
                value = value * (1 + volatility);
            }

            points.push({
                x: i,
                y: value,
                value: value,
                date: date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })
            });
        }

        return points;
    };

    const chartData = generateChartData();

    // Chart dimensions
    const width = 600;
    const height = 200;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Find min/max values for scaling
    const minValue = Math.min(...chartData.map(p => p.y));
    const maxValue = Math.max(...chartData.map(p => p.y));
    const valueRange = maxValue - minValue || 1;

    // Convert data points to SVG coordinates
    const getSVGPoint = (point: ChartPoint) => {
        const x = padding + (point.x / 6) * chartWidth;
        const y = padding + chartHeight - ((point.y - minValue) / valueRange) * chartHeight;
        return { x, y };
    };

    // Generate SVG path for the line with smooth curves
    const generatePath = () => {
        if (chartData.length === 0) return '';

        const points = chartData.map(getSVGPoint);
        let path = `M ${points[0].x} ${points[0].y}`;

        // Use cubic Bézier curves for very smooth lines
        for (let i = 1; i < points.length; i++) {
            const prevPoint = points[i - 1];
            const currentPoint = points[i];

            // Calculate control points for smooth curve
            const dx = currentPoint.x - prevPoint.x;
            const control1X = prevPoint.x + dx * 0.25;
            const control1Y = prevPoint.y;
            const control2X = currentPoint.x - dx * 0.25;
            const control2Y = currentPoint.y;

            path += ` C ${control1X} ${control1Y} ${control2X} ${control2Y} ${currentPoint.x} ${currentPoint.y}`;
        }

        return path;
    };

    const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Only update if mouse is within chart bounds
        if (mouseX < padding || mouseX > width - padding || mouseY < padding || mouseY > height - padding) {
            setHoveredPoint(null);
            return;
        }

        // Find the closest data point with throttling
        const chartX = mouseX - padding;
        const dataIndex = Math.round((chartX / chartWidth) * 6);

        if (dataIndex >= 0 && dataIndex < chartData.length) {
            const closestPoint = chartData[dataIndex];
            setHoveredPoint(closestPoint);
            setMousePosition({ x: mouseX, y: mouseY });
        }
    }, [chartData, chartWidth, padding, width, height]);

    const handleMouseLeave = () => {
        setHoveredPoint(null);
    };

    return (
        <Card className="rounded-3xl shadow-lg border-gray-200/50 dark:border-gray-800/50">
            <CardHeader>
                <CardTitle className="text-xl">Portfolio Growth (30% APY)</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                    Historical portfolio value with projected 30% APY growth
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-60 w-full">
                    <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${width} ${height}`}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="cursor-crosshair"
                    >
                        {/* Grid lines */}
                        <defs>
                            <pattern id="grid" width="60" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.3" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Y-axis labels */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                            const value = minValue + ratio * valueRange;
                            const y = padding + chartHeight - ratio * chartHeight;
                            return (
                                <g key={index}>
                                    <line
                                        x1={padding - 5}
                                        y1={y}
                                        x2={padding}
                                        y2={y}
                                        stroke="#888888"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={padding - 10}
                                        y={y + 4}
                                        textAnchor="end"
                                        fontSize="12"
                                        fill="#888888"
                                    >
                                        ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </text>
                                </g>
                            );
                        })}

                        {/* X-axis labels */}
                        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                            const x = padding + (day / 6) * chartWidth;
                            return (
                                <g key={day}>
                                    <line
                                        x1={x}
                                        y1={padding + chartHeight}
                                        x2={x}
                                        y2={padding + chartHeight + 5}
                                        stroke="#888888"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={x}
                                        y={padding + chartHeight + 20}
                                        textAnchor="middle"
                                        fontSize="12"
                                        fill="#888888"
                                    >
                                        {chartData[day]?.date}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Chart area fill with better gradient */}
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {/* Filled area under the line */}
                        <path
                            d={`${generatePath()} L ${getSVGPoint(chartData[chartData.length - 1]).x} ${padding + chartHeight} L ${getSVGPoint(chartData[0]).x} ${padding + chartHeight} Z`}
                            fill="url(#areaGradient)"
                        />

                        {/* Chart line */}
                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Data points */}
                        {chartData.map((point, index) => {
                            const svgPoint = getSVGPoint(point);
                            return (
                                <circle
                                    key={index}
                                    cx={svgPoint.x}
                                    cy={svgPoint.y}
                                    r="2"
                                    fill="hsl(var(--chart-1))"
                                    opacity="0.8"
                                />
                            );
                        })}

                        {/* Hover indicator */}
                        {hoveredPoint && (
                            <g>
                                <line
                                    x1={mousePosition.x}
                                    y1={padding}
                                    x2={mousePosition.x}
                                    y2={padding + chartHeight}
                                    stroke="#888888"
                                    strokeWidth="1"
                                    strokeDasharray="5,5"
                                />
                                <circle
                                    cx={getSVGPoint(hoveredPoint).x}
                                    cy={getSVGPoint(hoveredPoint).y}
                                    r="4"
                                    fill="hsl(var(--chart-1))"
                                    stroke="white"
                                    strokeWidth="2"
                                />
                                {/* Enhanced tooltip matching vault page style */}
                                <rect
                                    x={Math.min(mousePosition.x + 10, width - 140)}
                                    y={Math.max(mousePosition.y - 30, padding + 10)}
                                    width="130"
                                    height="50"
                                    fill="white"
                                    stroke="#e5e7eb"
                                    rx="8"
                                    filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                                />
                                <text
                                    x={Math.min(mousePosition.x + 20, width - 130)}
                                    y={Math.max(mousePosition.y - 15, padding + 20)}
                                    fontSize="12"
                                    fontWeight="600"
                                    fill="#111827"
                                >
                                    {hoveredPoint.date}
                                </text>
                                <text
                                    x={Math.min(mousePosition.x + 20, width - 130)}
                                    y={Math.max(mousePosition.y + 5, padding + 35)}
                                    fontSize="12"
                                    fill="#6b7280"
                                >
                                    ${hoveredPoint.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </text>
                            </g>
                        )}
                    </svg>
                </div>

                {/* Chart legend */}
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {totalValue > 0 ? (
                        <span>This week with 30% APY • Hover to see projected growth</span>
                    ) : (
                        <span>No portfolio data yet • Start by depositing assets to earn 30% APY</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 