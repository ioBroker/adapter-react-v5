/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React from 'react';
import { type AnimatedIconProps, rootProps, useAnimatedIconStyles, useSvgId } from './common';

export interface IconUploadProps extends AnimatedIconProps {
    /** Files are being uploaded: the arrow moves up into the bar again and again */
    uploading?: boolean;
    /** Files are dragged over the drop area: the arrow bobs up and down */
    ready?: boolean;
}

/**
 * Upload symbol (arrow up to a bar, like the MUI icon `Publish`). The arrow lifts on hover of its button,
 * bobs while files are dragged over the drop area and moves up into the bar while they are uploaded.
 *
 * ```tsx
 * <IconButton onClick={() => this.setState({ showUpload: true })}>
 *     <IconUpload uploading={this.state.uploading} />
 * </IconButton>
 * ```
 */
export function IconUpload(props: IconUploadProps): React.JSX.Element {
    useAnimatedIconStyles();
    const clipId = useSvgId('upload');
    let className = 'iob-ani-up';
    if (props.uploading) {
        className += ' iob-ani-up-uploading';
    } else if (props.ready) {
        className += ' iob-ani-up-ready';
    }
    return (
        <span {...rootProps(props, className)}>
            <svg viewBox="0 0 24 24">
                <defs>
                    {/* the arrow disappears in the bar and appears from below */}
                    <clipPath id={clipId}>
                        {/* a path and not a rect: a CSS `width` (e.g. `* { width: initial }`) would change a rect */}
                        <path d="M0 6.5h24v15h-24z" />
                    </clipPath>
                </defs>
                <path
                    className="iob-ani-up-bar"
                    d="M5 4v2h14V4H5z"
                />
                <g clipPath={`url(#${clipId})`}>
                    <path
                        className="iob-ani-up-arrow"
                        d="M5 14h4v6h6v-6h4l-7-7-7 7z"
                    />
                </g>
            </svg>
        </span>
    );
}
