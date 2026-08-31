/**
 * Copyright 2018-2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { Component, type CSSProperties } from 'react';
import { RgbaColorPicker, RgbColorPicker, type RgbaColor } from 'react-colorful';

import { TextField, Popover, IconButton, Button, Box, Tooltip, MenuItem, Select } from '@mui/material';

import { Delete as IconDelete, Colorize as IconColorize } from '@mui/icons-material';

import { I18n } from '../i18n';

import type { IobTheme } from '../types';

/** Color in the `{ r, g, b, a }` notation. Kept for backwards compatibility with `react-color`. */
export interface RGBColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}

/** Notation used for the value that is reported via `onChange`. */
export type ColorPickerFormat = 'hex' | 'rgb' | 'hsl';

const RECENT_COLORS_KEY = 'iob-color-picker-recent';
const MAX_RECENT_COLORS = 12;

/** Small checkerboard, so a semi-transparent color is recognizable as such */
const ALPHA_BACKGROUND =
    'linear-gradient(45deg, #c0c0c0 25%, transparent 25%), linear-gradient(-45deg, #c0c0c0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #c0c0c0 75%), linear-gradient(-45deg, transparent 75%, #c0c0c0 75%)';

const ALPHA_BACKGROUND_SIZE = '8px 8px';
const ALPHA_BACKGROUND_POSITION = '0 0, 0 4px, 4px -4px, -4px 0px';

const styles: Record<string, any> = {
    swatch: {
        mt: '16px',
        p: '4px',
        backgroundColor: 'background.paper',
        borderRadius: '6px',
        boxShadow: '0 0 0 1px rgba(128,128,128,.35)',
        display: 'inline-block',
        cursor: 'pointer',
        verticalAlign: 'middle',
        transition: 'box-shadow 0.15s ease-in-out',
        '&:hover': {
            boxShadow: '0 0 0 2px rgba(128,128,128,.6)',
        },
    },
    swatchDisabled: {
        opacity: 0.5,
        cursor: 'default',
        '&:hover': {
            boxShadow: '0 0 0 1px rgba(128,128,128,.35)',
        },
    },
    color: {
        height: 14,
        borderRadius: '3px',
        backgroundImage: ALPHA_BACKGROUND,
        backgroundSize: ALPHA_BACKGROUND_SIZE,
        backgroundPosition: ALPHA_BACKGROUND_POSITION,
    },
    delButton: {
        marginTop: 16,
    },
    textDense: {
        mt: 0,
        mb: 0,
    },
    popover: {
        '& .MuiPaper-root': {
            borderRadius: '12px',
        },
    },
    // The chrome around the react-colorful area
    pickerWrapper: (theme: IobTheme) => ({
        p: '12px',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        // restyle react-colorful, so it fits into the ioBroker themes
        '& .react-colorful': {
            width: '100%',
            height: 'auto',
            gap: '10px',
        },
        '& .react-colorful__saturation': {
            borderRadius: '8px',
            border: 'none',
            height: 150,
            boxShadow: 'none',
        },
        '& .react-colorful__hue, & .react-colorful__alpha': {
            height: 14,
            borderRadius: '7px',
        },
        '& .react-colorful__alpha': {
            backgroundImage: ALPHA_BACKGROUND,
            backgroundSize: ALPHA_BACKGROUND_SIZE,
            backgroundPosition: ALPHA_BACKGROUND_POSITION,
        },
        '& .react-colorful__last-control': {
            borderRadius: '7px',
        },
        '& .react-colorful__pointer': {
            width: 18,
            height: 18,
            borderWidth: 2,
        },
        '& .react-colorful__saturation-pointer': {
            width: 20,
            height: 20,
        },
    }),
    controlRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    preview: {
        width: 28,
        height: 28,
        flexShrink: 0,
        borderRadius: '6px',
        boxShadow: '0 0 0 1px rgba(128,128,128,.35) inset',
        backgroundImage: ALPHA_BACKGROUND,
        backgroundSize: ALPHA_BACKGROUND_SIZE,
        backgroundPosition: ALPHA_BACKGROUND_POSITION,
    },
    valueInput: {
        flexGrow: 1,
        minWidth: 60,
        '& .MuiInputBase-input': {
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            textOverflow: 'ellipsis',
        },
    },
    formatSelect: {
        flexShrink: 0,
        fontSize: '0.7rem',
        opacity: 0.75,
        '& .MuiSelect-select': {
            py: '4px',
            pl: '2px',
            pr: '18px !important',
        },
        '& .MuiSelect-icon': {
            right: 0,
        },
    },
    sectionTitle: {
        fontSize: '0.7rem',
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
    },
    swatchRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        mt: '4px',
    },
    paletteItem: {
        width: 22,
        height: 22,
        p: 0,
        minWidth: 22,
        borderRadius: '5px',
        boxShadow: '0 0 0 1px rgba(128,128,128,.35) inset',
        backgroundImage: ALPHA_BACKGROUND,
        backgroundSize: ALPHA_BACKGROUND_SIZE,
        backgroundPosition: ALPHA_BACKGROUND_POSITION,
        '&:hover': {
            boxShadow: '0 0 0 2px rgba(128,128,128,.7) inset',
        },
    },
    fill: {
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
    },
};

const DEFAULT_COLOR: RgbaColor = { r: 0, g: 0, b: 0, a: 1 };

let canvasContext: CanvasRenderingContext2D | null | undefined;

/**
 * Normalize any CSS color notation (color names, `color()`, ...) with the help of a canvas.
 *
 * @param color The color string to normalize.
 * @returns the normalized color as `#rrggbb`/`rgba(...)` string or null if the string is no valid color.
 */
function normalizeCssColor(color: string): string | null {
    if (canvasContext === undefined) {
        canvasContext = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
    }
    if (!canvasContext) {
        return null;
    }
    // `fillStyle` keeps its previous value if the assigned string is no valid color,
    // so it must be probed with two different defaults
    canvasContext.fillStyle = '#000000';
    canvasContext.fillStyle = color;
    const first = canvasContext.fillStyle;
    canvasContext.fillStyle = '#ffffff';
    canvasContext.fillStyle = color;

    return first === canvasContext.fillStyle ? first : null;
}

/**
 * Convert h, s, l (0..1) to r, g, b (0..255).
 *
 * @param h The hue in the range 0..1.
 * @param s The saturation in the range 0..1.
 * @param l The lightness in the range 0..1.
 */
function hsl2rgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    if (!s) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v };
    }

    const hue2rgb = (p: number, q: number, t: number): number => {
        let _t = t;
        if (_t < 0) {
            _t += 1;
        }
        if (_t > 1) {
            _t -= 1;
        }
        if (_t < 1 / 6) {
            return p + (q - p) * 6 * _t;
        }
        if (_t < 1 / 2) {
            return q;
        }
        if (_t < 2 / 3) {
            return p + (q - p) * (2 / 3 - _t) * 6;
        }
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
}

/**
 * Convert r, g, b (0..255) to h (0..360), s, l (0..100).
 *
 * @param color The color to convert.
 */
function rgb2hsl(color: RgbaColor): { h: number; s: number; l: number } {
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
        return { h: 0, s: 0, l: Math.round(l * 100) };
    }
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h: number;
    if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
        h = (b - r) / d + 2;
    } else {
        h = (r - g) / d + 4;
    }

    return { h: Math.round((h / 6) * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Clamp a number into the given range.
 *
 * @param value The value to clamp.
 * @param min The lower limit.
 * @param max The upper limit.
 */
function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/**
 * Read a color channel that may be given as `128` or as `50%`.
 *
 * @param value The channel as string.
 * @param max The maximal value of this channel.
 */
function readChannel(value: string, max: number): number {
    const trimmed = value.trim();
    const parsed = parseFloat(trimmed);
    if (Number.isNaN(parsed)) {
        return 0;
    }
    return clamp(Math.round(trimmed.endsWith('%') ? (parsed / 100) * max : parsed), 0, max);
}

/**
 * Read the alpha channel that may be given as `0.5` or as `50%`.
 *
 * @param value The alpha channel as string or undefined if it is not given.
 */
function readAlpha(value: string | undefined): number {
    if (value === undefined || value === '') {
        return 1;
    }
    const trimmed = value.trim();
    const parsed = trimmed.endsWith('%') ? parseFloat(trimmed) / 100 : parseFloat(trimmed);

    return Number.isNaN(parsed) ? 1 : clamp(parsed, 0, 1);
}

/**
 * Parse any CSS color notation into `{ r, g, b, a }`.
 *
 * Supported are `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`, `hsl()`, `hsla()` (comma or space
 * separated, with or without the `/ alpha` part) and every color name the browser knows.
 *
 * @param color The color string to parse.
 * @returns the parsed color or null if the string could not be interpreted.
 */
export function parseColor(color: string): RgbaColor | null {
    if (!color || typeof color !== 'string') {
        return null;
    }
    const str = color.trim().toLowerCase();
    if (!str) {
        return null;
    }
    if (str === 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0 };
    }

    const hex = /^#([\da-f]{3,8})$/.exec(str);
    if (hex) {
        const h = hex[1];
        if (h.length === 3 || h.length === 4) {
            return {
                r: parseInt(h[0] + h[0], 16),
                g: parseInt(h[1] + h[1], 16),
                b: parseInt(h[2] + h[2], 16),
                a: h.length === 4 ? Math.round((parseInt(h[3] + h[3], 16) / 255) * 100) / 100 : 1,
            };
        }
        if (h.length === 6 || h.length === 8) {
            return {
                r: parseInt(h.substring(0, 2), 16),
                g: parseInt(h.substring(2, 4), 16),
                b: parseInt(h.substring(4, 6), 16),
                a: h.length === 8 ? Math.round((parseInt(h.substring(6, 8), 16) / 255) * 100) / 100 : 1,
            };
        }
        return null;
    }

    const func = /^(rgba?|hsla?)\(([^)]*)\)$/.exec(str);
    if (func) {
        // both `1, 2, 3, 0.5` and `1 2 3 / 50%` are valid
        const parts = func[2]
            .replace('/', ',')
            .split(/[\s,]+/)
            .filter(part => part !== '');

        if (parts.length < 3) {
            return null;
        }
        if (func[1].startsWith('rgb')) {
            return {
                r: readChannel(parts[0], 255),
                g: readChannel(parts[1], 255),
                b: readChannel(parts[2], 255),
                a: readAlpha(parts[3]),
            };
        }
        const hue = ((parseFloat(parts[0]) % 360) + 360) % 360;
        const rgb = hsl2rgb(
            hue / 360,
            clamp(parseFloat(parts[1]) / 100, 0, 1),
            clamp(parseFloat(parts[2]) / 100, 0, 1),
        );

        return { ...rgb, a: readAlpha(parts[3]) };
    }

    // color names and everything else the browser understands
    const normalized = normalizeCssColor(str);

    return normalized && normalized !== str ? parseColor(normalized) : null;
}

/**
 * Render `{ r, g, b, a }` in the requested notation.
 *
 * @param color The color to render.
 * @param format The desired notation.
 * @param noAlpha If true, the alpha channel is dropped.
 * @returns the color as CSS string.
 */
export function formatColor(color: RgbaColor, format: ColorPickerFormat, noAlpha?: boolean): string {
    const alpha = noAlpha ? 1 : (color.a ?? 1);
    const opaque = alpha >= 1;
    const rounded = Math.round(alpha * 100) / 100;

    if (format === 'hex') {
        const hex = `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
        const hexAlpha = Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0');

        return opaque ? hex : `${hex}${hexAlpha}`;
    }
    if (format === 'hsl') {
        const { h, s, l } = rgb2hsl(color);

        return opaque ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${rounded})`;
    }

    return opaque ? `rgb(${color.r}, ${color.g}, ${color.b})` : `rgba(${color.r}, ${color.g}, ${color.b}, ${rounded})`;
}

/**
 * Guess the notation of the given color string.
 *
 * @param color The color string.
 */
function detectFormat(color: string): ColorPickerFormat | null {
    const str = (color || '').trim().toLowerCase();
    if (str.startsWith('#')) {
        return 'hex';
    }
    if (str.startsWith('rgb')) {
        return 'rgb';
    }
    if (str.startsWith('hsl')) {
        return 'hsl';
    }
    return null;
}

interface EyeDropperInstance {
    open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>;
}

/**
 * Read the `EyeDropper` constructor, which is not part of the DOM types yet.
 */
function getEyeDropper(): (new () => EyeDropperInstance) | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }
    return (window as unknown as Record<string, unknown>).EyeDropper as (new () => EyeDropperInstance) | undefined;
}

interface ColorPickerProps {
    /** Set to true to disable the color picker. */
    disabled?: boolean;
    /** The currently selected color. */
    value?: string;
    /** @deprecated The currently selected color use value */
    color?: string;
    /** The color change callback. */
    onChange: (rgba: string) => void;
    /** Label of the color picker. */
    label?: string;
    /** @deprecated TLabel of the color picker use label */
    name?: string;
    /** Additional styling for this component. */
    style?: CSSProperties;
    /** The CSS class name. */
    className?: string;
    /** Predefined colors that are offered below the picker. */
    customPalette?: string[];
    /** Do not show the text field with the color value, only the color bar. */
    noInputField?: boolean;
    /** Width of the color bar. */
    barWidth?: number;
    sx?: Record<string, any>;
    /** @deprecated the theme is taken from the MUI context */
    theme?: IobTheme;
    /** Hide the alpha slider and always report a fully opaque color. */
    noAlpha?: boolean;
    /** Notation of the reported value. If not set, it is taken from the incoming value and defaults to `rgb`. */
    format?: ColorPickerFormat;
    /** Do not offer the recently used colors. */
    noRecentColors?: boolean;
    /** Width of the picker popup in pixels. Default 280. */
    pickerWidth?: number;
    /** ID of the text field. Must be set if more than one color picker is rendered at the same time. */
    id?: string;
}

interface ColorPickerState {
    displayColorPicker: boolean;
    /** The working color of the picker. Always valid, even if no color is selected. */
    rgba: RgbaColor;
    /** The text shown in the input field. An empty string means "no color selected". */
    textValue: string;
    format: ColorPickerFormat;
    anchorEl: HTMLDivElement | null;
    recentColors: string[];
}

/**
 * A color picker component with alpha channel, eye dropper and HEX/RGB/HSL notations.
 */
export class ColorPicker extends Component<ColorPickerProps, ColorPickerState> {
    /**
     * Constructor for the color picker.
     *
     * @param props The properties.
     */
    constructor(props: ColorPickerProps) {
        super(props);
        const value = props.value || props.color || '';

        this.state = {
            displayColorPicker: false,
            rgba: parseColor(value) || { ...DEFAULT_COLOR },
            textValue: value,
            format: props.format || detectFormat(value) || 'rgb',
            anchorEl: null,
            recentColors: [],
        };
    }

    /**
     * If the props are updated from outside, they should override the state
     *
     * @param prevProps The previous properties.
     */
    componentDidUpdate(prevProps: ColorPickerProps): void {
        const prevValue = prevProps.value ?? prevProps.color ?? '';
        const value = this.props.value ?? this.props.color ?? '';

        // React only on real changes from outside. If the value equals what is shown, it is the own echo.
        if (prevValue !== value && value !== this.state.textValue) {
            this.setState({
                rgba: parseColor(value) || { ...DEFAULT_COLOR },
                textValue: value,
                format: this.props.format || detectFormat(value) || this.state.format,
            });
        } else if (this.props.format && this.props.format !== prevProps.format) {
            this.setState({ format: this.props.format });
        }
    }

    /**
     * Convert the given color to hex ('#rrggbb') or rgba ('rgba(r,g,b,a)') format.
     *
     * @param color The color to convert.
     * @param isHex If true, the color will be converted to hex format.
     * @returns the hex or rgba representation of the given color.
     */
    static getColor(color: string | { rgb: RGBColor } | RGBColor, isHex?: boolean): string {
        if (color && typeof color === 'object') {
            const oColor = color as { rgb: RGBColor };
            const rColor: RGBColor = oColor.rgb ? oColor.rgb : (color as RGBColor);

            if (isHex) {
                return `#${rColor.r.toString(16).padStart(2, '0')}${rColor.g.toString(16).padStart(2, '0')}${rColor.b.toString(16).padStart(2, '0')}`;
            }
            return `rgba(${rColor.r},${rColor.g},${rColor.b},${rColor.a ?? 1})`;
        }
        if (typeof color === 'string') {
            return isHex ? ColorPicker.rgb2hex(color || '') : color || '';
        }
        return '';
    }

    /**
     * Convert rgb() or rgba() format to hex format #rrggbb.
     *
     * @param rgb The color in rgb() or rgba() format. if not in this format, the color will be returned as is.
     */
    static rgb2hex(rgb: string): string {
        const m = /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i.exec(rgb);

        if (m) {
            const r = parseInt(m[1], 10).toString(16).padStart(2, '0');
            const g = parseInt(m[2], 10).toString(16).padStart(2, '0');
            const b = parseInt(m[3], 10).toString(16).padStart(2, '0');

            return m?.length === 4 ? `#${r}${g}${b}` : rgb;
        }
        return rgb;
    }

    /**
     * Read the recently used colors from the local storage.
     */
    static readRecentColors(): string[] {
        try {
            const stored = window.localStorage.getItem(RECENT_COLORS_KEY);
            const parsed: unknown = stored ? JSON.parse(stored) : null;

            if (Array.isArray(parsed)) {
                return parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT_COLORS);
            }
        } catch {
            // ignore a broken or unavailable local storage
        }
        return [];
    }

    /**
     * Remember the given color as recently used.
     *
     * @param color The color to remember.
     */
    storeRecentColor(color: string): void {
        if (this.props.noRecentColors || !color || this.state.recentColors[0] === color) {
            return;
        }
        const recentColors = [color, ...this.state.recentColors.filter(item => item !== color)].slice(
            0,
            MAX_RECENT_COLORS,
        );

        this.setState({ recentColors });

        try {
            window.localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(recentColors));
        } catch {
            // ignore an unavailable local storage
        }
    }

    private handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        const open = !this.state.displayColorPicker;

        this.setState({
            displayColorPicker: open,
            anchorEl: open ? e.currentTarget : null,
            // read the recent colors on every open, so colors picked in another instance show up too
            recentColors: open && !this.props.noRecentColors ? ColorPicker.readRecentColors() : this.state.recentColors,
        });
    };

    private handleClose = (): void => {
        this.storeRecentColor(this.state.textValue);
        this.setState({ displayColorPicker: false, anchorEl: null });
    };

    /**
     * The user moved a slider, clicked a swatch or used the eye dropper.
     *
     * @param rgba The new color.
     */
    private handleColorChange = (rgba: RgbaColor): void => {
        const textValue = formatColor(rgba, this.state.format, this.props.noAlpha);

        this.setState({ rgba, textValue }, () => this.props.onChange?.(textValue));
    };

    /**
     * The user typed into the input field. The text is taken as it is and only parsed for the preview.
     *
     * @param textValue The entered text.
     */
    private handleTextChange = (textValue: string): void => {
        const rgba = parseColor(textValue);

        this.setState({ textValue, rgba: rgba || this.state.rgba }, () => this.props.onChange?.(textValue));
    };

    /**
     * Switch between the #rrggbb, rgba() and hsla() notations.
     *
     * @param format The new notation.
     */
    private handleFormatChange = (format: ColorPickerFormat): void => {
        if (!this.state.textValue) {
            this.setState({ format });
            return;
        }
        const textValue = formatColor(this.state.rgba, format, this.props.noAlpha);

        this.setState({ format, textValue }, () => this.props.onChange?.(textValue));
    };

    private handleClear = (): void => {
        this.setState({ textValue: '', rgba: { ...DEFAULT_COLOR } }, () => this.props.onChange?.(''));
    };

    private handleEyeDropper = (): void => {
        const EyeDropper = getEyeDropper();
        if (!EyeDropper) {
            return;
        }

        void new EyeDropper()
            .open()
            .then(result => {
                const rgba = parseColor(result.sRGBHex);
                if (rgba) {
                    // the eye dropper always returns an opaque color, so the current alpha is kept
                    this.handleColorChange({ ...rgba, a: this.props.noAlpha ? 1 : (this.state.rgba.a ?? 1) });
                }
            })
            .catch(() => {
                // the user aborted the selection with ESC
            });
    };

    /**
     * Render a row of predefined colors.
     *
     * @param colors The colors to show.
     * @param title The title above the row.
     */
    renderSwatches(colors: string[], title: string): React.JSX.Element | null {
        if (!colors.length) {
            return null;
        }
        return (
            <Box component="div">
                <Box
                    component="div"
                    sx={styles.sectionTitle}
                >
                    {title}
                </Box>
                <Box
                    component="div"
                    sx={styles.swatchRow}
                >
                    {colors.map((color, i) => (
                        <Button
                            sx={styles.paletteItem}
                            key={`${color}_${i}`}
                            title={color}
                            onClick={() => {
                                const rgba = parseColor(color);
                                if (rgba) {
                                    this.handleColorChange(rgba);
                                } else {
                                    this.handleTextChange(color);
                                }
                            }}
                        >
                            <Box
                                component="div"
                                sx={styles.fill}
                                style={{ background: color }}
                            />
                        </Button>
                    ))}
                </Box>
            </Box>
        );
    }

    renderPicker(): React.JSX.Element {
        const { rgba, textValue, format } = this.state;
        const Picker = this.props.noAlpha ? RgbColorPicker : RgbaColorPicker;

        return (
            <Box
                component="div"
                sx={styles.pickerWrapper}
                style={{ width: this.props.pickerWidth || 280 }}
            >
                <Picker
                    color={rgba}
                    onChange={(color: RgbaColor | { r: number; g: number; b: number }) =>
                        this.handleColorChange({ a: rgba.a ?? 1, ...color })
                    }
                />
                <Box
                    component="div"
                    sx={styles.controlRow}
                >
                    {getEyeDropper() ? (
                        <Tooltip title={I18n.t('ra_Pick color from screen')}>
                            <IconButton
                                size="small"
                                onClick={this.handleEyeDropper}
                            >
                                <IconColorize fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                    <Box
                        component="div"
                        sx={styles.preview}
                    >
                        <Box
                            component="div"
                            sx={styles.fill}
                            style={{ background: textValue || 'transparent' }}
                        />
                    </Box>
                    <TextField
                        variant="standard"
                        size="small"
                        sx={styles.valueInput}
                        value={textValue}
                        placeholder={I18n.t('ra_Select color')}
                        onChange={e => this.handleTextChange(e.target.value)}
                    />
                    <Select
                        variant="standard"
                        disableUnderline
                        sx={styles.formatSelect}
                        value={format}
                        onChange={e => this.handleFormatChange(e.target.value)}
                    >
                        <MenuItem value="hex">HEX</MenuItem>
                        <MenuItem value="rgb">RGB</MenuItem>
                        <MenuItem value="hsl">HSL</MenuItem>
                    </Select>
                    <Tooltip title={I18n.t('ra_Clear color')}>
                        <span>
                            <IconButton
                                size="small"
                                disabled={!textValue}
                                onClick={this.handleClear}
                            >
                                <IconDelete fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
                {this.renderSwatches(this.props.customPalette || [], I18n.t('ra_Palette'))}
                {this.renderSwatches(
                    this.props.noRecentColors ? [] : this.state.recentColors,
                    I18n.t('ra_Recently used colors'),
                )}
            </Box>
        );
    }

    render(): React.JSX.Element {
        const style = { ...(this.props.style || {}) };
        style.position = 'relative';
        const { textValue } = this.state;
        const hasLabel = !!(this.props.label || this.props.name);

        return (
            <Box
                component="div"
                style={style}
                sx={this.props.sx || undefined}
                className={this.props.className || ''}
            >
                {this.props.noInputField ? null : (
                    <TextField
                        disabled={this.props.disabled}
                        variant="standard"
                        id={this.props.id || 'ar_color_picker_name'}
                        label={this.props.label || this.props.name}
                        value={textValue}
                        margin="dense"
                        sx={{
                            '&.MuiFormControl-root': styles.textDense,
                            width: textValue ? 'calc(100% - 80px)' : 'calc(100% - 56px)',
                            mr: textValue ? undefined : 1,
                        }}
                        onChange={e => this.handleTextChange(e.target.value)}
                    />
                )}
                {!this.props.noInputField && textValue ? (
                    <IconButton
                        disabled={this.props.disabled}
                        onClick={this.handleClear}
                        size="small"
                        style={hasLabel ? styles.delButton : undefined}
                    >
                        <IconDelete />
                    </IconButton>
                ) : null}
                <Box
                    component="div"
                    onClick={e => !this.props.disabled && this.handleClick(e)}
                    title={I18n.t('ra_Select color')}
                    sx={{
                        ...styles.swatch,
                        ...(this.props.disabled ? styles.swatchDisabled : undefined),
                        marginTop: this.props.noInputField || !hasLabel ? 0 : undefined,
                    }}
                >
                    <Box
                        component="div"
                        sx={{
                            ...styles.color,
                            border: textValue ? undefined : '1px dashed #888',
                            boxSizing: 'border-box',
                        }}
                        style={{
                            width: this.props.noInputField ? this.props.barWidth || 16 : this.props.barWidth || 36,
                        }}
                    >
                        <Box
                            component="div"
                            sx={styles.fill}
                            style={{ background: textValue || 'transparent' }}
                        />
                    </Box>
                </Box>
                {this.state.displayColorPicker && !this.props.disabled ? (
                    <Popover
                        sx={styles.popover}
                        anchorEl={this.state.anchorEl}
                        open={!0}
                        onClose={this.handleClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    >
                        {this.renderPicker()}
                    </Popover>
                ) : null}
            </Box>
        );
    }
}
