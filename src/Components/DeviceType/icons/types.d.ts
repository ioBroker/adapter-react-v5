import type { CSSProperties, MouseEventHandler } from 'react';

export interface IconPropsSVG {
    // The props are spread onto an `<svg>` element, so the handler must be compatible with
    // `IconBaseProps` of `react-icons` (SVGElement and not the generic Element)
    onClick?: MouseEventHandler<SVGElement>;
    /** Class name */
    className?: string;
    /** Style for image */
    style?: CSSProperties;
    /** Styles for mui */
    sx?: Record<string, any>;
    /** Tooltip */
    title?: string;
}
