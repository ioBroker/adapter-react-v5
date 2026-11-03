/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React from 'react';
import { type AnimatedIconProps, rootProps, useAnimatedIconStyles } from './common';

// The shapes of `IconClosed` and `IconOpen` (Font Awesome, regular): the closed folder, and the open one
// split into its back with the tab and its front flap
const CLOSED =
    'M524,128 l-192,0 l-64,-64 l-160,0 c-26.51,0 -48,21.49 -48,48 l0,288 c0,26.51 21.49,48 48,48 l416,0 c26.51,0 48,-21.49 48,-48 l0,-224 c0,-26.51 -21.49,-48 -48,-48 z';
const BACK =
    'M211.062,224 l328,0 l0,-48 c0,-26.51 -21.49,-48 -48,-48 l-160,0 l-64,-64 l-160,0 c-26.51,0 -48,21.49 -48,48 l0,278.046 l69.077,-118.418 c17.137,-29.378 48.912,-47.628 82.923,-47.628 z';
const FRONT =
    'M631.756,292.093 l-72.424,124.155 a63.997,63.997 0 0 1 -55.281,31.752 l-399.964,0 c-18.523,0 -30.064,-20.093 -20.731,-36.093 l72.424,-124.155 a64,64 0 0 1 55.282,-31.752 l399.964,0 c18.523,0 30.064,20.093 20.73,36.093 z';

export interface IconFolderProps extends AnimatedIconProps {
    /** The folder is open: its front flap folds down */
    open: boolean;
    /** Click on the icon, e.g. to open or close the folder */
    onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

/**
 * Folder that opens and closes: the front flap folds down and back up. In both end states it looks
 * like `IconClosed` and `IconOpen`.
 *
 * ```tsx
 * <IconFolder open={expanded} onClick={() => toggle(id)} />
 * ```
 */
export function IconFolder(props: IconFolderProps): React.JSX.Element {
    useAnimatedIconStyles();
    return (
        <span
            {...rootProps(props, `iob-ani-folder${props.open ? ' iob-ani-folder-open' : ''}`)}
            onClick={props.onClick}
        >
            <svg viewBox="0 0 650 512">
                <path d={BACK} />
                <path
                    className="iob-ani-folder-front"
                    d={FRONT}
                />
                <path
                    className="iob-ani-folder-closed"
                    d={CLOSED}
                />
            </svg>
        </span>
    );
}
