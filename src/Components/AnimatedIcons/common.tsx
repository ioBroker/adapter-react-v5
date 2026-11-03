/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 *
 * Shared parts of the animated icons: props, size, the style sheet and helpers.
 * The icons are plain CSS/SVG (no animation library). They use `currentColor`, so they take the color of the
 * surrounding text or button, and they have the size of the MUI icons.
 */
import type React from 'react';
import { useEffect, useInsertionEffect, useRef, type CSSProperties } from 'react';

export interface AnimatedIconProps {
    /** Size like the MUI icons: 'small' (20 px), 'medium' (24 px, default), 'large' (35 px), 'inherit', pixels or e.g. '2em' */
    fontSize?: 'inherit' | 'small' | 'medium' | 'large' | number | `${number}${'px' | 'em' | 'rem' | '%'}`;
    /** Class name for the root element */
    className?: string;
    /** Styles for the root element, e.g. `color` */
    style?: CSSProperties;
    /** Accessible name. Without it, the icon is decorative and hidden from screen readers. */
    ariaLabel?: string;
}

const SIZES: Record<string, string> = {
    small: '1.25rem',
    medium: '1.5rem',
    large: '2.1875rem',
    inherit: 'inherit',
};

const STYLE_ID = 'iob-animated-icons';

const styles = `
/* zero specificity: MUI may set the size, e.g. 20 px for the start icon of a Button, like for its own icons */
:where(.iob-ani) { font-size: 1.5rem; }
.iob-ani { display: inline-block; position: relative; width: 1em; height: 1em; flex-shrink: 0; vertical-align: middle; line-height: 0; user-select: none; }
.iob-ani > svg, .iob-ani-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: visible; }

/* Play / pause: two halves of the triangle become the two bars */
.iob-ani-pp-a, .iob-ani-pp-b { position: absolute; inset: 0; background: currentColor; transition: clip-path 0.32s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease; }
.iob-ani-pp-a { clip-path: polygon(33.33% 20.83%, 56.25% 35.42%, 56.25% 64.58%, 33.33% 79.17%); }
.iob-ani-pp-b { clip-path: polygon(56.25% 35.42%, 79.17% 50%, 79.17% 50%, 56.25% 64.58%); }
.iob-ani-on .iob-ani-pp-a { clip-path: polygon(25% 20.83%, 41.67% 20.83%, 41.67% 79.17%, 25% 79.17%); }
.iob-ani-on .iob-ani-pp-b { clip-path: polygon(58.33% 20.83%, 75% 20.83%, 75% 79.17%, 58.33% 79.17%); }
.iob-ani-pp-ring { opacity: 0; transition: opacity 0.2s; }
.iob-ani-pp-ring circle { fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-dasharray: 0.22 0.78; }
.iob-ani-pp-pending .iob-ani-pp-ring { opacity: 1; animation: iob-ani-spin 0.9s linear infinite; }
.iob-ani-pp-pending .iob-ani-pp-a, .iob-ani-pp-pending .iob-ani-pp-b { transform: scale(0.72); }

/* Status LED */
.iob-ani-led-dot, .iob-ani-led-ping { position: absolute; left: 20%; top: 20%; width: 60%; height: 60%; border-radius: 50%; background-color: var(--iob-ani-led); }
.iob-ani-led-dot { transition: background-color 0.3s; box-shadow: inset 0 -0.05em 0.1em rgba(0, 0, 0, 0.28); }
.iob-ani-led-ping { opacity: 0; }
.iob-ani-led-blink .iob-ani-led-dot, .iob-ani-led-blink .iob-ani-led-own { animation: iob-ani-breathe 1.6s ease-in-out infinite; }
.iob-ani-led-ping.iob-ani-led-full { left: 0; top: 0; width: 100%; height: 100%; }
.iob-ani-led-own { display: flex; align-items: center; justify-content: center; line-height: normal; }

/* Result: circle and mark draw themselves */
:where(.iob-ani-res-success) { color: #4CAF50; }
:where(.iob-ani-res-warning) { color: #FF9800; }
:where(.iob-ani-res-error) { color: #F44336; }
.iob-ani-res svg * { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1 1; stroke-dashoffset: 1; }
.iob-ani-res-circle { transform: rotate(-90deg); transform-origin: 12px 12px; animation: iob-ani-draw 0.45s cubic-bezier(0.65, 0, 0.35, 1) forwards; }
.iob-ani-res-mark { animation: iob-ani-draw 0.3s cubic-bezier(0.65, 0, 0.35, 1) 0.35s forwards; }
.iob-ani-res-mark2 { animation: iob-ani-draw 0.3s cubic-bezier(0.65, 0, 0.35, 1) 0.5s forwards; }
.iob-ani-res-error svg, .iob-ani-res-warning svg { animation: iob-ani-shake 0.4s 0.75s; }

/* Refresh */
.iob-ani-rf-done { opacity: 0; }
.iob-ani-rf-done path { fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1 1; stroke-dashoffset: 1; }

/* Bell */
.iob-ani-bell-body { transform-origin: 12px 3px; }

/* Menu / arrow: three bars, the icon turns by 180 degrees */
.iob-ani-menu-rot { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.iob-ani-menu-open .iob-ani-menu-rot { transform: rotate(180deg); }
.iob-ani-menu-right .iob-ani-menu-flip { transform: scaleX(-1); }
.iob-ani-menu-bar { position: absolute; left: 0.125em; width: 0.75em; height: 0.0834em; margin-top: -0.0417em; border-radius: 0.02em; background: currentColor; transform-origin: 100% 50%; transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.iob-ani-menu-b1 { top: 0.2917em; }
.iob-ani-menu-b2 { top: 0.5em; }
.iob-ani-menu-b3 { top: 0.7083em; }
.iob-ani-menu-open .iob-ani-menu-b1 { transform: translate(-0.0417em, 0.2083em) rotate(45deg) scaleX(0.63); }
.iob-ani-menu-open .iob-ani-menu-b2 { transform: translateX(-0.0417em) scaleX(0.889); }
.iob-ani-menu-open .iob-ani-menu-b3 { transform: translate(-0.0417em, -0.2083em) rotate(-45deg) scaleX(0.63); }

/* Trash: the lid opens on hover of the icon or of its button */
.iob-ani-trash-lid { transform-origin: 5px 6px; transition: transform 0.25s cubic-bezier(0.3, 1.5, 0.6, 1); }
.iob-ani-trash-open .iob-ani-trash-lid,
.iob-ani-trash:hover .iob-ani-trash-lid,
:is(button, a, [role="button"]):hover .iob-ani-trash .iob-ani-trash-lid,
:is(button, a, [role="button"]):focus-visible .iob-ani-trash .iob-ani-trash-lid { transform: translateY(-1.5px) rotate(-18deg); }

/* Expert mode: mortarboard, outlined when off and filled when on */
.iob-ani-expert-hat { transform-origin: 12px 12px; }
.iob-ani-expert-shape { fill: currentColor; fill-opacity: 0; stroke: currentColor; stroke-width: 1.6; stroke-linejoin: round; transition: fill-opacity 0.18s ease; }
.iob-ani-expert-on .iob-ani-expert-shape { fill-opacity: 1; transition-delay: 0.12s; }
.iob-ani-expert-tassel { transform-origin: 21.2px 9.1px; }
.iob-ani-expert-cord { fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.iob-ani-expert-tuft { fill: currentColor; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: round; }

/* Folder: closed, the front flap lies on the back like a closed folder; open, it folds down. The closed
   shape covers both until the flap starts to move, so the closed folder looks exactly like IconClosed */
.iob-ani-folder path { fill: currentColor; }
.iob-ani-folder-front { transform-origin: 104px 448px; transform: scaleY(1.1667) skewX(29.1deg); transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1); }
.iob-ani-folder-open .iob-ani-folder-front { transform: none; transition: transform 0.32s cubic-bezier(0.3, 1.35, 0.5, 1); }
.iob-ani-folder-closed { transition: opacity 0.06s linear 0.18s; }
.iob-ani-folder-open .iob-ani-folder-closed { opacity: 0; transition-delay: 0s; }

/* Connection */
.iob-ani-wifi path { fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; transition: opacity 0.3s; }
.iob-ani-wifi circle { fill: currentColor; transition: opacity 0.3s; }
.iob-ani-wifi .iob-ani-wifi-slash { stroke-dasharray: 1 1; stroke-dashoffset: 1; transition: stroke-dashoffset 0.35s cubic-bezier(0.65, 0, 0.35, 1); }
.iob-ani-wifi-disconnected .iob-ani-wifi-slash { stroke-dashoffset: 0; }
.iob-ani-wifi-disconnected .iob-ani-wifi-w { opacity: 0.35; }
.iob-ani-wifi-connecting .iob-ani-wifi-w { animation: iob-ani-wave 1.5s ease-in-out infinite; }
.iob-ani-wifi-connecting .iob-ani-wifi-w1 { animation-delay: 0.18s; }
.iob-ani-wifi-connecting .iob-ani-wifi-w2 { animation-delay: 0.36s; }
.iob-ani-wifi-connecting .iob-ani-wifi-w3 { animation-delay: 0.54s; }

@keyframes iob-ani-spin { to { transform: rotate(360deg); } }
@keyframes iob-ani-draw { to { stroke-dashoffset: 0; } }
@keyframes iob-ani-breathe { 50% { opacity: 0.35; } }
@keyframes iob-ani-wave { 0%, 100% { opacity: 0.25; } 30% { opacity: 1; } }
@keyframes iob-ani-shake { 20% { transform: translateX(-1.5px); } 40% { transform: translateX(1.5px); } 60% { transform: translateX(-1px); } 80% { transform: translateX(1px); } }

@media (prefers-reduced-motion: reduce) {
    .iob-ani-pp-a, .iob-ani-pp-b, .iob-ani-menu-rot, .iob-ani-menu-bar, .iob-ani-trash-lid, .iob-ani-expert-shape, .iob-ani-folder-front, .iob-ani-folder-closed { transition-duration: 0.01ms; transition-delay: 0s; }
    .iob-ani-pp-pending .iob-ani-pp-ring { animation: iob-ani-breathe 1.2s ease-in-out infinite; }
    .iob-ani-res svg, .iob-ani-res svg * { animation: none !important; stroke-dashoffset: 0; }
}
`;

/** Puts the style sheet of the animated icons into the page, once and before the first paint */
export function useAnimatedIconStyles(): void {
    useInsertionEffect(() => {
        if (!window.document.getElementById(STYLE_ID)) {
            const style = window.document.createElement('style');
            style.setAttribute('id', STYLE_ID);
            style.innerHTML = styles;
            window.document.head.appendChild(style);
        }
    }, []);
}

/** Properties of the root element: class, size and accessibility */
export function rootProps(props: AnimatedIconProps, className: string): React.HTMLAttributes<HTMLSpanElement> {
    // Without fontSize the size comes from the style sheet (24 px), so that MUI can change it like for its own icons
    let fontSize: string | number | undefined;
    if (typeof props.fontSize === 'number') {
        fontSize = props.fontSize;
    } else if (props.fontSize) {
        fontSize = SIZES[props.fontSize] || props.fontSize;
    }
    return {
        className: `iob-ani ${className}${props.className ? ` ${props.className}` : ''}`,
        style: fontSize === undefined ? props.style : { fontSize, ...props.style },
        role: props.ariaLabel ? 'img' : undefined,
        'aria-label': props.ariaLabel,
        'aria-hidden': props.ariaLabel ? undefined : true,
    };
}

/** True if the user asked the system for less motion */
export function prefersReducedMotion(): boolean {
    return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Plays a one-time animation (Web Animations API), unless the user wants less motion */
export function play(
    element: Element | null | undefined,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
): Animation | null {
    if (!element?.animate || prefersReducedMotion()) {
        return null;
    }
    return element.animate(keyframes, options);
}

/** Calls `onChange` when `value` changes, but not on the first render */
export function useChange<T>(value: T, onChange: (value: T, previous: T) => void): void {
    const previous = useRef(value);
    const callback = useRef(onChange);
    useEffect(() => {
        callback.current = onChange;
    });
    useEffect(() => {
        if (!Object.is(previous.current, value)) {
            const old = previous.current;
            previous.current = value;
            callback.current(value, old);
        }
    }, [value]);
}
