/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 */
import React, { useEffect, useRef } from 'react';
import { type AnimatedIconProps, prefersReducedMotion, rootProps, useAnimatedIconStyles, useChange } from './common';

const DURATION = 1600;

export interface IconCopyToClipboardProps extends AnimatedIconProps {
    /** Every change of this value shows the check mark, e.g. a counter of the copies */
    copied?: string | number | boolean | null;
    /** Click on the icon, e.g. to copy the text. The check mark is shown after it. */
    onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

/**
 * Copy symbol, which confirms the copy: the copy slides out of the original, and a check mark is drawn in it.
 *
 * The check mark is shown after a click on the icon (with `onClick`), on every change of `copied`, or - if
 * neither is given - after a click on the button around the icon, e.g. on a `Button` with this icon as `startIcon`.
 *
 * ```tsx
 * <IconCopyToClipboard onClick={() => Utils.copyToClipboard(text)} />
 * <Button startIcon={<IconCopyToClipboard />} onClick={() => Utils.copyToClipboard(text)}>Copy</Button>
 * ```
 */
export function IconCopyToClipboard(props: IconCopyToClipboardProps): React.JSX.Element {
    useAnimatedIconStyles();
    const root = useRef<HTMLSpanElement>(null);
    const back = useRef<SVGPathElement>(null);
    const front = useRef<SVGPathElement>(null);
    const check = useRef<SVGPathElement>(null);
    const animations = useRef<(Animation | undefined)[]>([]);

    const showCopied = (): void => {
        animations.current.forEach(a => a?.cancel());
        if (!check.current?.animate) {
            return;
        }
        // with less motion, the check mark only fades in and out
        const reduced = prefersReducedMotion();
        const draw = reduced ? 0 : 1;
        animations.current = [
            reduced
                ? undefined
                : front.current?.animate([{ transform: 'translate(-5px, -5px)' }, { transform: 'translate(0, 0)' }], {
                      duration: 320,
                      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
                  }),
            back.current?.animate(
                [{ opacity: 1 }, { opacity: 0, offset: 0.15 }, { opacity: 0, offset: 0.85 }, { opacity: 1 }],
                { duration: DURATION },
            ),
            check.current.animate(
                [
                    { opacity: 0, strokeDashoffset: draw },
                    { opacity: 1, strokeDashoffset: draw, offset: 0.12 },
                    { opacity: 1, strokeDashoffset: 0, offset: 0.3 },
                    { opacity: 1, strokeDashoffset: 0, offset: 0.85 },
                    { opacity: 0, strokeDashoffset: 0 },
                ],
                { duration: DURATION },
            ),
        ];
    };
    const showCopiedRef = useRef(showCopied);
    useEffect(() => {
        showCopiedRef.current = showCopied;
    });

    useChange(props.copied, showCopied);

    // neither own click nor `copied`: the click on the button around the icon copies
    const listenToButton = !props.onClick && props.copied === undefined;
    useEffect(() => {
        if (!listenToButton) {
            return undefined;
        }
        const button = root.current?.parentElement?.closest('button, a, [role="button"], [role="menuitem"]');
        if (!button) {
            return undefined;
        }
        const onClick = (): void => showCopiedRef.current();
        button.addEventListener('click', onClick);
        return () => button.removeEventListener('click', onClick);
    }, [listenToButton]);

    useEffect(() => () => animations.current.forEach(a => a?.cancel()), []);

    const { onClick } = props;
    return (
        <span
            {...rootProps(props, `iob-ani-copy${onClick ? ' iob-ani-click' : ''}`)}
            ref={root}
            onClick={
                onClick
                    ? e => {
                          onClick(e);
                          showCopied();
                      }
                    : undefined
            }
        >
            <svg viewBox="0 0 24 24">
                <path
                    ref={back}
                    d="M6.5 16H5.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
                />
                {/* a path and not a rect: a CSS `width` (e.g. `* { width: initial }`) would change a rect */}
                <path
                    ref={front}
                    d="M10.5 8h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"
                />
                <path
                    ref={check}
                    className="iob-ani-copy-check"
                    d="M11.5 14.6l2.2 2.2 4-4.4"
                    pathLength={1}
                />
            </svg>
        </span>
    );
}
