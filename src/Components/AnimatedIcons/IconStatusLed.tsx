/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React, { useRef, type CSSProperties } from 'react';
import { type AnimatedIconProps, play, rootProps, useAnimatedIconStyles, useChange } from './common';

/** Colors of the named states; any other CSS color can be given too */
const COLORS: Record<string, string> = {
    green: '#4CAF50',
    orange: '#FF9800',
    yellow: '#FFC107',
    red: '#F44336',
    blue: '#2196F3',
    grey: '#9E9E9E',
};

export interface IconStatusLedProps extends AnimatedIconProps {
    /** 'green', 'orange', 'yellow', 'red', 'blue', 'grey' or any CSS color */
    color: string;
    /** Every change of this value sends one pulse, e.g. the timestamp of the last `alive` update */
    beat?: string | number | boolean | null;
    /** Waiting, e.g. while the instance starts: the LED breathes */
    blink?: boolean;
    /** Own status symbol instead of the round LED. Pulse, pop and shake stay, the pulse has the size of the icon. */
    children?: React.ReactNode;
}

/**
 * Status LED. It pops when its color changes, shakes when it turns red and sends a pulse on every `beat`.
 *
 * ```tsx
 * <IconStatusLed color={alive ? 'green' : 'red'} beat={aliveState?.ts} />
 * ```
 */
export function IconStatusLed(props: IconStatusLedProps): React.JSX.Element {
    useAnimatedIconStyles();
    const root = useRef<HTMLSpanElement>(null);
    const dot = useRef<HTMLSpanElement>(null);
    const ping = useRef<HTMLSpanElement>(null);
    const color = COLORS[props.color] || props.color;

    useChange(props.beat, () =>
        play(
            ping.current,
            [
                { transform: 'scale(1)', opacity: 0.55 },
                // an own symbol fills the icon, its pulse grows less
                { transform: `scale(${props.children ? 1.7 : 2.3})`, opacity: 0 },
            ],
            { duration: 750, easing: 'cubic-bezier(0, 0, 0.2, 1)' },
        ),
    );

    useChange(color, () => {
        if (color === COLORS.red) {
            play(
                root.current,
                [
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-0.09em)' },
                    { transform: 'translateX(0.09em)' },
                    { transform: 'translateX(-0.06em)' },
                    { transform: 'translateX(0.06em)' },
                    { transform: 'translateX(0)' },
                ],
                { duration: 450, easing: 'ease-in-out' },
            );
        } else {
            play(dot.current, [{ transform: 'scale(0.55)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], {
                duration: 380,
                easing: 'ease-out',
            });
        }
    });

    const ledProps = rootProps(props, `iob-ani-led${props.blink ? ' iob-ani-led-blink' : ''}`);
    return (
        <span
            {...ledProps}
            ref={root}
            style={{ ...ledProps.style, '--iob-ani-led': color } as CSSProperties}
        >
            <span
                className={props.children ? 'iob-ani-led-ping iob-ani-led-full' : 'iob-ani-led-ping'}
                ref={ping}
            />
            {props.children ? (
                <span
                    className="iob-ani-layer iob-ani-led-own"
                    ref={dot}
                >
                    {props.children}
                </span>
            ) : (
                <span
                    className="iob-ani-led-dot"
                    ref={dot}
                />
            )}
        </span>
    );
}
