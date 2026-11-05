/**
 * Copyright 2018-2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 *
 * Loader of the community edition: the ioBroker mark is a power button, so the loader switches ioBroker on.
 * 1. Switch on: the top of the "i" lights up, the ring draws itself from there to both sides, the stem grows.
 * 2. Wait: light runs through the ring, devices on an orbit send data packets into it.
 * 3. Open (only with `done`): the devices gather in the ring, the ring flashes and a circle opens from the centre.
 * Only SVG and CSS, no JavaScript timer. The previous loader is `LoaderCommunityLegacy`.
 */
import React, { useEffect, useRef, useState } from 'react';
import type { ThemeName, ThemeType } from '../../types';
import { MODERN_DARK, MODERN_LIGHT } from '../../ThemeModern';

declare global {
    interface Window {
        loadingBackgroundImage: undefined | string;
        loadingBackgroundColor: undefined | string;
        loadingHideLogo: undefined | 'true';
    }
}

/** The ring of the mark (img/logo.svg), used as mask for the light running through it */
const RING_PATH =
    'M386,91v68.6c68.2,25.1,117,90.5,117,167c0,98.1-80.2,177.9-178.7,177.9s-178.7-79.8-178.7-177.9c0-76.5,48.8-141.9,117-167V91C159.2,118.5,83.1,213.5,83.1,326.5c0,134.6,107.9,243.7,241.1,243.7s241.1-109.1,241.1-243.7C565.3,213.5,489.2,118.5,386,91z';
const CAP_PATH =
    'M324.2,148.6c12.4,0,24.5,1.3,36.3,3.7V85.6c-11.8-1.8-23.9-2.7-36.3-2.7s-24.4,0.9-36.3,2.7v66.7C299.7,149.9,311.8,148.6,324.2,148.6z';
const STEM_PATH =
    'M324.2,175.3c-12.5,0-24.6,1.5-36.2,4.4v291c11.6,2.9,23.8,4.4,36.2,4.4c12.5,0,24.6-1.5,36.3-4.4v-291C348.9,176.9,336.7,175.3,324.2,175.3z';
const RING_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 648.5 652.8'%3E%3Cpath d='${RING_PATH}'/%3E%3C/svg%3E") center / 100% 100% no-repeat`;

/** Devices on the orbit: angle in degrees, radius of the dot, delay of its packet in seconds */
const NODES: [number, number, number][] = [
    [14, 10, 0],
    [66, 7, 1.9],
    [117, 12, 0.7],
    [163, 8, 3.1],
    [208, 10, 1.3],
    [259, 7, 2.5],
    [312, 9, 3.7],
];

/** Duration of the closing animation in ms (reduced motion: crossfade) */
const OPEN_DURATION = 1150;
const OPEN_DURATION_REDUCED = 350;

const loaderStyles = `
@property --iob-ld-hole { syntax: '<length>'; inherits: false; initial-value: 0px; }
.iob-ld {
    --iob-ld-mark: min(210px, 30vmin);
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;
    background-color: var(--iob-ld-bg); background-size: cover; background-position: center;
}
.iob-ld-dark { --iob-ld-bg: #121212; --iob-ld-orbit: rgba(126, 195, 243, 0.16); --iob-ld-node: #1D90CA; --iob-ld-packet: #7EC3F3; --iob-ld-label: #1D90CA; --iob-ld-flash: #E8F6FF; }
.iob-ld-blue { --iob-ld-bg: #031D38; --iob-ld-orbit: rgba(126, 195, 243, 0.22); --iob-ld-node: #7EC3F3; --iob-ld-packet: #E8F6FF; --iob-ld-label: #7EC3F3; --iob-ld-flash: #E8F6FF; }
.iob-ld-light { --iob-ld-bg: #FFFFFF; --iob-ld-orbit: rgba(0, 88, 148, 0.14); --iob-ld-node: #1D90CA; --iob-ld-packet: #1D90CA; --iob-ld-label: #005894; --iob-ld-flash: #FFFFFF; }
.iob-ld-colored { --iob-ld-bg: #E6EEF7; --iob-ld-orbit: rgba(0, 88, 148, 0.16); --iob-ld-node: #005894; --iob-ld-packet: #1D90CA; --iob-ld-label: #005894; --iob-ld-flash: #FFFFFF; }

.iob-ld-orbit {
    position: absolute; left: 50%; top: 50%; width: calc(var(--iob-ld-mark) * 1.8505); height: calc(var(--iob-ld-mark) * 1.8505);
    transform: translate(-50%, -50%); overflow: visible; opacity: 0;
    animation: iob-ld-fade-in 0.9s 0.95s forwards;
}
.iob-ld-orbit-line { fill: none; stroke: var(--iob-ld-orbit); stroke-width: 2; stroke-dasharray: 2 12; }
.iob-ld-gather, .iob-ld-nodes { transform-box: view-box; transform-origin: 0 0; }
.iob-ld-nodes { animation: iob-ld-spin 90s linear infinite; }
.iob-ld-dot { fill: var(--iob-ld-node); transform-box: fill-box; transform-origin: center; animation: iob-ld-send 4.2s ease-out infinite; }
.iob-ld-packet { fill: var(--iob-ld-packet); opacity: 0; animation: iob-ld-travel 4.2s infinite; }
.iob-ld-splash { fill: none; stroke: var(--iob-ld-packet); stroke-width: 3; opacity: 0; transform-box: fill-box; transform-origin: center; animation: iob-ld-splash 4.2s infinite; }

.iob-ld-mark { position: absolute; left: 50%; top: 50%; width: var(--iob-ld-mark); aspect-ratio: 648.5 / 652.8; transform: translate(-50%, -50%); }
.iob-ld-mark svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: visible; }
.iob-ld-draw { fill: none; stroke: #FFFFFF; stroke-width: 90; stroke-dasharray: 1 1; stroke-dashoffset: 1; animation: iob-ld-draw 0.62s cubic-bezier(0.6, 0, 0.2, 1) 0.3s forwards; }
.iob-ld-cap { transform-box: fill-box; transform-origin: center; animation: iob-ld-pop 0.42s cubic-bezier(0.3, 1.7, 0.5, 1) both; }
.iob-ld-stem { transform-box: fill-box; transform-origin: 50% 100%; animation: iob-ld-grow 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) 0.8s both; }
.iob-ld-flash { fill: var(--iob-ld-flash); opacity: 0; }
.iob-ld-current { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; animation: iob-ld-fade-in 0.5s 1.15s forwards; -webkit-mask: ${RING_MASK}; mask: ${RING_MASK}; }
.iob-ld-current > div {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: conic-gradient(from 0deg, transparent 0turn 0.68turn, rgba(126, 195, 243, 0.55) 0.95turn, rgba(232, 246, 255, 0.95) 1turn);
    animation: iob-ld-spin 1.9s linear infinite;
}
.iob-ld-status {
    position: absolute; left: 0; right: 0; top: calc(50% + var(--iob-ld-mark) * 0.86);
    text-align: center; padding: 0 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    font: 500 13px/1.5 Roboto, Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: var(--iob-ld-label);
    opacity: 0; animation: iob-ld-fade-in 0.5s 1s forwards;
}
.iob-ld-status::before { content: '// '; }

.iob-ld-done {
    -webkit-mask-image: radial-gradient(circle at 50% 50%, transparent var(--iob-ld-hole), #000 calc(var(--iob-ld-hole) + 1px));
    mask-image: radial-gradient(circle at 50% 50%, transparent var(--iob-ld-hole), #000 calc(var(--iob-ld-hole) + 1px));
    animation: iob-ld-open 0.75s 0.3s cubic-bezier(0.6, 0, 0.4, 1) forwards;
}
.iob-ld-done .iob-ld-gather { animation: iob-ld-gather 0.45s cubic-bezier(0.5, 0, 0.9, 0.4) forwards; }
.iob-ld-done .iob-ld-flash { animation: iob-ld-flash 0.5s 0.12s ease-out; }
.iob-ld-done .iob-ld-mark { animation: iob-ld-mark-out 0.6s 0.35s cubic-bezier(0.5, 0, 0.75, 0) forwards; }
.iob-ld-done .iob-ld-status { animation: none; opacity: 0; transition: opacity 0.2s; }

@keyframes iob-ld-fade-in { to { opacity: 1; } }
@keyframes iob-ld-fade-out { to { opacity: 0; } }
@keyframes iob-ld-spin { to { transform: rotate(360deg); } }
@keyframes iob-ld-draw { to { stroke-dashoffset: 0; } }
@keyframes iob-ld-pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes iob-ld-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes iob-ld-send { 0% { transform: scale(1.5); } 12%, 100% { transform: scale(1); } }
@keyframes iob-ld-travel {
    0% { transform: translateY(0); opacity: 0; animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.6); }
    6% { opacity: 1; }
    36% { transform: translateY(176px); opacity: 1; }
    38%, 100% { transform: translateY(176px); opacity: 0; }
}
@keyframes iob-ld-splash {
    0%, 35% { transform: scale(0.2); opacity: 0; }
    38% { transform: scale(0.5); opacity: 0.9; }
    58%, 100% { transform: scale(2); opacity: 0; }
}
@keyframes iob-ld-gather { to { transform: scale(0.5); opacity: 0; } }
@keyframes iob-ld-flash { 0% { opacity: 0; } 35% { opacity: 0.85; } 100% { opacity: 0; } }
@keyframes iob-ld-mark-out { to { transform: translate(-50%, -50%) scale(1.4); opacity: 0; } }
@keyframes iob-ld-open { to { --iob-ld-hole: 120vmax; } }

@media (prefers-reduced-motion: reduce) {
    .iob-ld-orbit, .iob-ld-current { display: none; }
    .iob-ld-draw { animation: none; stroke-dashoffset: 0; }
    .iob-ld-cap, .iob-ld-stem { animation: none; }
    .iob-ld-mark { opacity: 0; animation: iob-ld-fade-in 0.3s forwards; }
    .iob-ld-status { animation: iob-ld-fade-in 0.3s forwards; }
    .iob-ld-done { -webkit-mask-image: none; mask-image: none; animation: iob-ld-fade-out 0.3s forwards; }
    .iob-ld-done .iob-ld-mark { animation: none; opacity: 1; }
}
`;

interface LoaderProps {
    /** Width of the mark in pixels (default 210); on small screens it shrinks to 30% of the shorter side. */
    size?: number;
    /** The chosen theme type. */
    themeType?: ThemeType;
    /** Theme name */
    themeName?: ThemeName;
    /** @deprecated Theme name. use themeName instead */
    theme?: ThemeName;
    /** Background color */
    backgroundColor?: string;
    /** Background image URL */
    backgroundImage?: string;
    /** Optional line below the mark, e.g. the current loading step. Shown in capitals with a leading "//". */
    status?: string;
    /** Play the closing animation: the loader opens and shows what is rendered below it. */
    done?: boolean;
    /** Called when the closing animation is over, so the loader can be removed. */
    onFinished?: () => void;
}

let maskCounter = 0;

export function LoaderCommunity(props: LoaderProps): React.JSX.Element {
    // Every instance needs its own mask id, there may be more than one loader on a page
    const [maskId] = useState(() => `iob-ld-draw-${++maskCounter}`);

    useEffect(() => {
        if (!window.document.getElementById('loader-iobroker-community')) {
            const style = window.document.createElement('style');
            style.setAttribute('id', 'loader-iobroker-community');
            style.innerHTML = loaderStyles;
            window.document.head.appendChild(style);
        }
    }, []);

    // Kept in a ref, so a new callback on every render of the parent does not restart the timer
    const onFinished = useRef(props.onFinished);
    useEffect(() => {
        onFinished.current = props.onFinished;
    }, [props.onFinished]);

    const { done } = props;
    useEffect(() => {
        if (!done) {
            return undefined;
        }
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const timer = setTimeout(() => onFinished.current?.(), reduced ? OPEN_DURATION_REDUCED : OPEN_DURATION);
        return () => clearTimeout(timer);
    }, [done]);

    // "blue" and "colored" have own looks; "modernDark" is dark; other names (PT, DX...) follow themeType
    const themeName = props.themeName || props.theme;
    let theme: 'dark' | 'light' | 'blue' | 'colored';
    if (themeName === 'blue' || themeName === 'colored') {
        theme = themeName;
    } else if (themeName === 'dark' || themeName === 'modernDark') {
        theme = 'dark';
    } else if (themeName === 'light' || themeName === 'modernLight') {
        theme = 'light';
    } else {
        theme = props.themeType === 'dark' ? 'dark' : 'light';
    }

    const backgroundImage =
        props.backgroundImage && props.backgroundImage !== '@@loginBackgroundImage@@'
            ? props.backgroundImage
            : window.loadingBackgroundImage && window.loadingBackgroundImage !== '@@loginBackgroundImage@@'
              ? `url(${window.loadingBackgroundImage})`
              : undefined;
    const backgroundColor =
        props.backgroundColor && props.backgroundColor !== '@@loginBackgroundColor@@'
            ? props.backgroundColor
            : window.loadingBackgroundColor && window.loadingBackgroundColor !== '@@loginBackgroundColor@@'
              ? window.loadingBackgroundColor
              : undefined;

    const style: React.CSSProperties & Record<string, string | undefined> = { backgroundImage, backgroundColor };
    // The modern themes have an own page background: the loader must not bring one more color into play
    if (themeName === 'modernDark') {
        style['--iob-ld-bg'] = MODERN_DARK.background;
    } else if (themeName === 'modernLight') {
        style['--iob-ld-bg'] = MODERN_LIGHT.background;
    }
    if (props.size) {
        style['--iob-ld-mark'] = `min(${props.size}px, 30vmin)`;
    }

    return (
        <div
            className={`iob-ld iob-ld-${theme}${done ? ' iob-ld-done' : ''}`}
            style={style}
            aria-busy={!done}
        >
            <svg
                className="iob-ld-orbit"
                viewBox="-600 -600 1200 1200"
                aria-hidden="true"
            >
                <circle
                    className="iob-ld-orbit-line"
                    r="430"
                />
                <g className="iob-ld-gather">
                    <g className="iob-ld-nodes">
                        {NODES.map(([angle, radius, delay]) => {
                            const animationDelay = `${delay}s`;
                            return (
                                <g
                                    key={angle}
                                    transform={`rotate(${angle})`}
                                >
                                    <circle
                                        className="iob-ld-splash"
                                        cy="-252"
                                        r="16"
                                        style={{ animationDelay }}
                                    />
                                    <circle
                                        className="iob-ld-packet"
                                        cy="-430"
                                        r="7"
                                        style={{ animationDelay }}
                                    />
                                    <circle
                                        className="iob-ld-dot"
                                        cy="-430"
                                        r={radius}
                                        style={{ animationDelay }}
                                    />
                                </g>
                            );
                        })}
                    </g>
                </g>
            </svg>
            {window.loadingHideLogo === 'true' ? null : (
                <div
                    className="iob-ld-mark"
                    aria-hidden="true"
                >
                    <svg viewBox="0 0 648.5 652.8">
                        <defs>
                            <mask
                                id={maskId}
                                maskUnits="userSpaceOnUse"
                                x="0"
                                y="0"
                                width="648.5"
                                height="652.8"
                            >
                                <path
                                    className="iob-ld-draw"
                                    pathLength={1}
                                    d="M324.2,116.5A210,210 0 0 1 324.2,536.5"
                                />
                                <path
                                    className="iob-ld-draw"
                                    pathLength={1}
                                    d="M324.2,116.5A210,210 0 0 0 324.2,536.5"
                                />
                            </mask>
                        </defs>
                        <path
                            mask={`url(#${maskId})`}
                            fill="#164477"
                            d={RING_PATH}
                        />
                        <path
                            className="iob-ld-cap"
                            fill="#3399CC"
                            d={CAP_PATH}
                        />
                        <path
                            className="iob-ld-stem"
                            fill="#3399CC"
                            d={STEM_PATH}
                        />
                        <path
                            className="iob-ld-flash"
                            d={RING_PATH}
                        />
                    </svg>
                    <div className="iob-ld-current">
                        <div />
                    </div>
                </div>
            )}
            {props.status ? (
                <div
                    className="iob-ld-status"
                    role="status"
                >
                    {props.status}
                </div>
            ) : null}
        </div>
    );
}
