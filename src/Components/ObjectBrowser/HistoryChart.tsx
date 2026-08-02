/**
 * Copyright 2020-2026, Denis Haev <dogafox@gmail.com>
 *
 * MIT License
 *
 * The small 24 hours chart that is shown in the value tooltip of the object browser, if the state
 * is recorded by a history adapter. It draws itself into an SVG, so no charting library is needed.
 */
import React, { type JSX, useEffect, useState } from 'react';

import type { Connection } from '../../Connection';
import type { Translate } from '../../types';

/** One point of the drawn line */
interface ChartPoint {
    ts: number;
    val: number;
}

interface HistoryChartProps {
    socket: Connection;
    /** ID of the state, the history of which is shown */
    id: string;
    /** Instance of the history adapter, e.g. `history.0` */
    instance: string;
    t: Translate;
    /** Booleans are drawn as steps and are labeled with `false`/`true` instead of `0`/`1` */
    isBoolean?: boolean;
    /** Write the decimal point as a comma */
    isFloatComma?: boolean;
    /** Current value of the state, so the line reaches the right edge even if the last record is older */
    current?: ChartPoint | null;
    /** Shown period in hours */
    hours?: number;
    /**
     * Color of the line. The tooltip has a dark background in the light theme too, so one color fits
     * both themes.
     */
    color?: string;
}

const WIDTH = 224;
const HEIGHT = 68;
/** Left border of the plot. Left of it are the min/max labels */
const PLOT_LEFT = 38;
const PLOT_RIGHT = 217;
const PLOT_TOP = 5;
const PLOT_BOTTOM = 54;
/** The values are mapped into this band, so the line does not touch the border of the plot */
const VALUE_TOP = 10;
const VALUE_BOTTOM = 50;
const FONT_SIZE = 9;
/** Number of the aggregated intervals that are requested from the history: one point every 15 minutes */
const INTERVALS = 96;
const DEFAULT_HOURS = 24;
/** Blue that stays readable on the dark tooltip background */
const DEFAULT_COLOR = '#4a93eb';

/** Every chart needs its own gradient, so the IDs must not collide */
let gradientCounter = 0;

/**
 * Format a value for the min/max label: short, but without pretending a precision that is not there.
 */
function formatValue(value: number, isFloatComma?: boolean): string {
    const abs = Math.abs(value);
    let text: string;
    if (abs >= 100_000) {
        // the label may not be wider than the space left of the plot
        text = `${Math.round(value / 1000)}k`;
    } else if (Number.isInteger(value)) {
        text = value.toString();
    } else if (abs >= 10) {
        text = value.toFixed(1);
    } else if (abs >= 1) {
        text = value.toFixed(2);
    } else {
        text = value.toFixed(3);
    }
    if (text.includes('.')) {
        text = text.replace(/0+$/, '').replace(/\.$/, '');
    }
    return isFloatComma ? text.replace('.', ',') : text;
}

/**
 * Take the numbers out of the history result: booleans become 0/1, nulls and strings are ignored.
 */
function readPoints(values: ioBroker.GetHistoryResult): ChartPoint[] {
    const points: ChartPoint[] = [];

    for (const item of values || []) {
        if (!item || typeof item.ts !== 'number' || item.val === null || item.val === undefined) {
            continue;
        }
        const val = typeof item.val === 'boolean' ? (item.val ? 1 : 0) : Number(item.val);
        if (Number.isFinite(val)) {
            points.push({ ts: item.ts, val });
        }
    }

    // The min/max aggregation delivers two points per interval, and not always in the right order
    points.sort((a, b) => a.ts - b.ts);

    return points;
}

/**
 * Build the SVG path of the line. Booleans (and everything else that is drawn as steps) keep their
 * value till the next point instead of ramping to it.
 */
function buildLine(
    points: ChartPoint[],
    x: (ts: number) => number,
    y: (val: number) => number,
    steps: boolean,
): string {
    let path = '';

    points.forEach((point, i) => {
        const px = x(point.ts).toFixed(2);
        const py = y(point.val).toFixed(2);
        if (!i) {
            path = `M${px} ${py}`;
        } else if (steps) {
            path += `H${px}V${py}`;
        } else {
            path += `L${px} ${py}`;
        }
    });

    return path;
}

/**
 * The last 24 hours of a state as a sparkline: area, line, the min/max of the period and the value
 * at the right edge. Reads the history itself as soon as it is mounted.
 */
export function HistoryChart(props: HistoryChartProps): JSX.Element {
    const { socket, id, instance, t, isBoolean, isFloatComma, current, hours = DEFAULT_HOURS } = props;
    const color = props.color || DEFAULT_COLOR;
    const [gradientId] = useState(() => `iob-history-chart-${++gradientCounter}`);
    const [data, setData] = useState<{ points: ChartPoint[]; from: number; to: number } | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let mounted = true;
        const to = Date.now();
        const from = to - hours * 3_600_000;

        socket
            .getHistory(id, {
                instance,
                start: from,
                end: to,
                step: Math.round((to - from) / INTERVALS),
                from: false,
                ack: false,
                q: false,
                addId: false,
                aggregate: 'minmax',
            })
            .then(values => {
                if (mounted) {
                    setData({ points: readPoints(values), from, to });
                }
            })
            .catch(e => {
                console.warn(`Cannot read history of ${id}: ${e}`);
                if (mounted) {
                    setFailed(true);
                }
            });

        return () => {
            mounted = false;
        };
    }, [socket, id, instance, hours]);

    let content: JSX.Element;

    if (failed || (data && !data.points.length)) {
        content = (
            <text
                x={WIDTH / 2}
                y={(PLOT_TOP + PLOT_BOTTOM) / 2 + 3}
                textAnchor="middle"
                fill="currentColor"
                fillOpacity={0.5}
                fontSize={11}
            >
                {t('ra_No data')}
            </text>
        );
    } else if (!data) {
        content = (
            <line
                x1={PLOT_LEFT + 6}
                x2={PLOT_RIGHT - 6}
                y1={(PLOT_TOP + PLOT_BOTTOM) / 2}
                y2={(PLOT_TOP + PLOT_BOTTOM) / 2}
                stroke="currentColor"
                strokeOpacity={0.25}
                strokeWidth={1.5}
                strokeDasharray="3 4"
                strokeLinecap="round"
            >
                <animate
                    attributeName="stroke-opacity"
                    values="0.3;0.1;0.3"
                    dur="1.4s"
                    repeatCount="indefinite"
                />
            </line>
        );
    } else {
        const points = data.points.slice();
        // Let the line reach "now": a state that was not written since an hour still has its value
        if (current && Number.isFinite(current.val) && (!points.length || current.ts >= points[points.length - 1].ts)) {
            points.push({ ts: Math.min(current.ts, data.to), val: current.val });
        }

        let min = points[0].val;
        let max = points[0].val;
        for (const point of points) {
            if (point.val < min) {
                min = point.val;
            }
            if (point.val > max) {
                max = point.val;
            }
        }

        // The drawn range is a bit larger than the values, so the line has some air above and below
        let low: number;
        let high: number;
        if (isBoolean) {
            low = 0;
            high = 1;
        } else if (min === max) {
            // a constant value is drawn in the middle
            low = min - 1;
            high = max + 1;
        } else {
            const air = (max - min) * 0.1;
            low = min - air;
            high = max + air;
        }

        const scaleX = (PLOT_RIGHT - PLOT_LEFT) / (data.to - data.from || 1);
        const x = (ts: number): number =>
            Math.min(PLOT_RIGHT, Math.max(PLOT_LEFT, PLOT_LEFT + (ts - data.from) * scaleX));
        const y = (val: number): number => VALUE_BOTTOM - ((val - low) / (high - low)) * (VALUE_BOTTOM - VALUE_TOP);

        const steps = !!isBoolean;
        const line = buildLine(points, x, y, steps);
        const lastX = x(points[points.length - 1].ts);
        const lastY = y(points[points.length - 1].val);
        // the area is closed against the bottom of the plot, and not against the lowest value
        const area = `${line}V${PLOT_BOTTOM}H${x(points[0].ts).toFixed(2)}Z`;
        const zeroY = low < 0 && high > 0 ? y(0) : null;

        content = (
            <>
                <path
                    d={area}
                    fill={`url(#${gradientId})`}
                />
                {zeroY !== null ? (
                    <line
                        x1={PLOT_LEFT}
                        x2={PLOT_RIGHT}
                        y1={zeroY}
                        y2={zeroY}
                        stroke="currentColor"
                        strokeOpacity={0.25}
                        strokeWidth={1}
                        strokeDasharray="2 3"
                    />
                ) : null}
                <path
                    d={line}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle
                    cx={lastX}
                    cy={lastY}
                    r={5}
                    fill={color}
                    fillOpacity={0.25}
                />
                <circle
                    cx={lastX}
                    cy={lastY}
                    r={2.4}
                    fill={color}
                />
                <text
                    x={PLOT_LEFT - 5}
                    y={y(isBoolean ? 1 : max) + 3}
                    textAnchor="end"
                    fill="currentColor"
                    fillOpacity={0.55}
                    fontSize={FONT_SIZE}
                >
                    {isBoolean ? 'true' : formatValue(max, isFloatComma)}
                </text>
                {isBoolean || min !== max ? (
                    <text
                        x={PLOT_LEFT - 5}
                        y={y(isBoolean ? 0 : min) + 3}
                        textAnchor="end"
                        fill="currentColor"
                        fillOpacity={0.55}
                        fontSize={FONT_SIZE}
                    >
                        {isBoolean ? 'false' : formatValue(min, isFloatComma)}
                    </text>
                ) : null}
            </>
        );
    }

    return (
        <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            style={{ width: '100%', height: 'auto', display: 'block', marginTop: 4 }}
        >
            <defs>
                <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="0%"
                        stopColor={color}
                        stopOpacity={0.35}
                    />
                    <stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity={0}
                    />
                </linearGradient>
            </defs>
            <rect
                x={PLOT_LEFT}
                y={PLOT_TOP}
                width={PLOT_RIGHT - PLOT_LEFT}
                height={PLOT_BOTTOM - PLOT_TOP}
                rx={4}
                fill="currentColor"
                fillOpacity={0.07}
            />
            {content}
            <text
                x={PLOT_LEFT}
                y={HEIGHT - 3}
                fill="currentColor"
                fillOpacity={0.45}
                fontSize={FONT_SIZE}
            >
                {`-${hours} h`}
            </text>
            <text
                x={PLOT_RIGHT}
                y={HEIGHT - 3}
                textAnchor="end"
                fill="currentColor"
                fillOpacity={0.45}
                fontSize={FONT_SIZE}
            >
                {t('ra_now')}
            </text>
        </svg>
    );
}
