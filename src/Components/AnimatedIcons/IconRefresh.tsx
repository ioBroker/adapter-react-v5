/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React, { useEffect, useRef } from 'react';
import { type AnimatedIconProps, play, prefersReducedMotion, rootProps, useAnimatedIconStyles } from './common';

const TURN = 900;

export interface IconRefreshProps extends AnimatedIconProps {
    /** Turns while true. When it becomes false, the turn ends smoothly. */
    loading?: boolean;
    /** After loading, a check mark appears for a moment (default: true) */
    showDone?: boolean;
}

/**
 * Refresh symbol for reload buttons. It turns while the data loads and confirms the end with a check mark.
 *
 * ```tsx
 * <IconButton onClick={() => this.reload()} disabled={this.state.loading}>
 *     <IconRefresh loading={this.state.loading} />
 * </IconButton>
 * ```
 */
export function IconRefresh(props: IconRefreshProps): React.JSX.Element {
    useAnimatedIconStyles();
    const spin = useRef<HTMLSpanElement>(null);
    const check = useRef<SVGSVGElement>(null);
    const animations = useRef<(Animation | null)[]>([]);
    const turning = useRef<Animation | null>(null);
    const { loading } = props;
    const showDone = props.showDone !== false;

    useEffect(() => {
        const element = spin.current;
        if (!element?.animate) {
            return;
        }
        if (loading) {
            animations.current.forEach(a => a?.cancel());
            animations.current = [];
            turning.current = prefersReducedMotion()
                ? element.animate([{ opacity: 1 }, { opacity: 0.4 }, { opacity: 1 }], {
                      duration: 1200,
                      iterations: Infinity,
                  })
                : element.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
                      duration: TURN,
                      iterations: Infinity,
                  });
        } else if (turning.current) {
            // finish the current turn instead of jumping back to 0 degrees
            const time = Number(turning.current.currentTime) || 0;
            const angle = ((time % TURN) / TURN) * 360;
            turning.current.cancel();
            turning.current = null;
            const rest = 250 + ((360 - angle) / 360) * 350;
            animations.current.push(
                play(element, [{ transform: `rotate(${angle}deg)` }, { transform: 'rotate(360deg)' }], {
                    duration: rest,
                    easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
                }),
            );
            if (showDone) {
                animations.current.push(
                    play(
                        element,
                        [
                            { opacity: 1, transform: 'scale(1)' },
                            { opacity: 0, transform: 'scale(0.6)', offset: 0.12 },
                            { opacity: 0, transform: 'scale(0.6)', offset: 0.85 },
                            { opacity: 1, transform: 'scale(1)' },
                        ],
                        { duration: 1500, delay: rest },
                    ),
                );
                animations.current.push(
                    play(
                        check.current,
                        [{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }],
                        {
                            duration: 1500,
                            delay: rest,
                        },
                    ),
                );
                animations.current.push(
                    play(
                        check.current?.querySelector('path'),
                        [
                            { strokeDashoffset: 1 },
                            { strokeDashoffset: 1, offset: 0.1 },
                            { strokeDashoffset: 0, offset: 0.35 },
                            { strokeDashoffset: 0 },
                        ],
                        { duration: 1500, delay: rest },
                    ),
                );
            }
        }
    }, [loading, showDone]);

    useEffect(
        () => () => {
            turning.current?.cancel();
            animations.current.forEach(a => a?.cancel());
        },
        [],
    );

    return (
        <span {...rootProps(props, 'iob-ani-rf')}>
            <span
                className="iob-ani-layer"
                ref={spin}
            >
                <svg
                    viewBox="0 0 24 24"
                    width="100%"
                    height="100%"
                >
                    <path
                        fill="currentColor"
                        d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                    />
                </svg>
            </span>
            <svg
                className="iob-ani-rf-done"
                viewBox="0 0 24 24"
                ref={check}
            >
                <path
                    d="M5.5 12.5l4.5 4.5 8.5-9"
                    pathLength={1}
                />
            </svg>
        </span>
    );
}
