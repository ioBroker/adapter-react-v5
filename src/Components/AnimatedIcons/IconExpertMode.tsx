/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React, { useRef } from 'react';
import { type AnimatedIconProps, play, rootProps, useAnimatedIconStyles, useChange } from './common';

const rotate = (deg: number): Keyframe => ({ transform: `rotate(${deg}deg)` });

export interface IconExpertModeProps extends AnimatedIconProps {
    /** The expert mode is on: the hat is filled. Switching it on lets the hat fly up. */
    active: boolean;
}

/**
 * Expert mode symbol: a mortarboard. Off it is only outlined, on it is filled, so both states differ also
 * without color. When the expert mode is switched on, the hat flies up a little and the tassel swings.
 *
 * ```tsx
 * <IconButton onClick={() => this.toggleExpertMode()}>
 *     <IconExpertMode active={this.state.expertMode} />
 * </IconButton>
 * ```
 */
export function IconExpertMode(props: IconExpertModeProps): React.JSX.Element {
    useAnimatedIconStyles();
    const hat = useRef<SVGGElement>(null);
    const tassel = useRef<SVGGElement>(null);

    useChange(props.active, active => {
        if (active) {
            play(
                hat.current,
                [
                    { transform: 'translateY(0) rotate(0deg)' },
                    { transform: 'translateY(-3.5px) rotate(-10deg)', offset: 0.38 },
                    { transform: 'translateY(0.6px) rotate(2deg)', offset: 0.72 },
                    { transform: 'translateY(0) rotate(0deg)' },
                ],
                { duration: 700, easing: 'ease-out' },
            );
            play(tassel.current, [0, -40, 16, -8, 3, 0].map(rotate), { duration: 1100, easing: 'ease-out' });
        } else {
            play(
                hat.current,
                [{ transform: 'translateY(0)' }, { transform: 'translateY(0.8px)' }, { transform: 'translateY(0)' }],
                { duration: 260 },
            );
            play(tassel.current, [0, -12, 5, 0].map(rotate), { duration: 600, easing: 'ease-out' });
        }
    });

    return (
        <span {...rootProps(props, `iob-ani-expert${props.active ? ' iob-ani-expert-on' : ''}`)}>
            <svg viewBox="0 0 24 24">
                <g
                    ref={hat}
                    className="iob-ani-expert-hat"
                >
                    <path
                        className="iob-ani-expert-shape"
                        d="M12 3.5L22.5 8.5L12 13.5L1.5 8.5Z"
                    />
                    <path
                        className="iob-ani-expert-shape"
                        d="M5.5 13.7L12 16.8L18.5 13.7V17.1C18.5 19 15.6 20.5 12 20.5S5.5 19 5.5 17.1Z"
                    />
                    <g
                        ref={tassel}
                        className="iob-ani-expert-tassel"
                    >
                        <path
                            className="iob-ani-expert-cord"
                            d="M21.2 9.1V15.2"
                        />
                        <path
                            className="iob-ani-expert-tuft"
                            d="M21.2 14.6L22.45 18.4H19.95Z"
                        />
                    </g>
                </g>
            </svg>
        </span>
    );
}
