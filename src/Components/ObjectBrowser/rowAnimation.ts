/**
 * Copyright 2026 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 *
 * Unfolding and folding of a node in the table: the children slide out from under the row of the node
 * (or back under it), and the rows below them move along. Only `transform` and `clip-path` are animated,
 * so the layout is the final one from the start, and `measureRenderedRows` still reads the real heights.
 */
import { prefersReducedMotion } from '../AnimatedIcons/common';

const EASING = 'cubic-bezier(0.2, 0, 0, 1)';

interface RowParts {
    /** Lower edge of the row of the node (and of its details panel) */
    top: number;
    /** The rendered rows of the children (and of their children) */
    block: HTMLElement[];
    /** The rendered rows below the children */
    below: HTMLElement[];
    /** How far the rows move: the height of the children, at most down to the end of the visible area */
    distance: number;
}

/** The row a child of the table container belongs to (rows in a drag-and-drop wrapper too) */
function rowIdOf(element: HTMLElement): string | undefined {
    if (element.dataset.detailsOf) {
        return element.dataset.detailsOf;
    }
    const row = (element.id ? element : element.firstElementChild) as HTMLElement | null;
    return row?.id || undefined;
}

function collectParts(container: HTMLElement | null, id: string): RowParts | null {
    if (!container || !id || typeof Element === 'undefined' || !Element.prototype.animate || prefersReducedMotion()) {
        return null;
    }
    const prefix = `${id}.`;
    let top: number | null = null;
    const block: HTMLElement[] = [];
    const below: HTMLElement[] = [];
    for (const child of Array.from(container.children) as HTMLElement[]) {
        const rowId = rowIdOf(child);
        if (!rowId) {
            // the spacers above and below the rendered rows
            continue;
        }
        if (rowId === id) {
            top = child.getBoundingClientRect().bottom;
        } else if (top !== null) {
            if (!below.length && rowId.startsWith(prefix)) {
                block.push(child);
            } else {
                below.push(child);
            }
        }
    }
    if (top === null || !block.length) {
        return null;
    }
    const blockBottom = below.length
        ? below[0].getBoundingClientRect().top
        : block[block.length - 1].getBoundingClientRect().bottom;
    const distance = Math.min(blockBottom, container.getBoundingClientRect().bottom) - top;
    if (distance < 2) {
        return null;
    }
    return { top, block, below, distance };
}

/**
 * Key frames of a row of the children: it moves down from under the row of the node and is cut off,
 * as long as it is still under it
 */
function childFrames(element: HTMLElement, top: number, distance: number): Keyframe[] {
    const rect = element.getBoundingClientRect();
    const y = rect.top - top;
    const height = rect.height;
    const from = `translateY(${-distance}px)`;
    if (y >= distance || !height) {
        return [{ transform: from }, { transform: 'translateY(0)' }];
    }
    // the part above the lower edge of the node row is hidden: distance * (1 - progress) - y
    const frames: Keyframe[] = [
        { offset: 0, transform: from, clipPath: `inset(${Math.min(height, distance - y)}px 0 0 0)` },
    ];
    const startsToShow = 1 - (y + height) / distance;
    if (startsToShow > 0) {
        frames.push({ offset: startsToShow, clipPath: `inset(${height}px 0 0 0)` });
    }
    const fullyShown = 1 - y / distance;
    if (fullyShown < 1) {
        frames.push({ offset: fullyShown, clipPath: 'inset(0px 0 0 0)' });
    }
    frames.push({ offset: 1, transform: 'translateY(0)', clipPath: 'inset(0px 0 0 0)' });
    return frames;
}

function animate(parts: RowParts, options: KeyframeAnimationOptions): Animation[] {
    const animations = parts.block.map(element =>
        element.animate(childFrames(element, parts.top, parts.distance), options),
    );
    const frames: Keyframe[] = [{ transform: `translateY(${-parts.distance}px)` }, { transform: 'translateY(0)' }];
    parts.below.forEach(element => animations.push(element.animate(frames, options)));
    return animations;
}

function duration(distance: number): number {
    return Math.round(Math.min(340, 140 + distance * 0.4));
}

/** The node was unfolded and its children are rendered: let them slide out from under its row */
export function unfold(container: HTMLElement | null, id: string): Animation[] {
    const parts = collectParts(container, id);
    if (!parts) {
        return [];
    }
    return animate(parts, { duration: duration(parts.distance), easing: EASING });
}

/**
 * The node is about to be folded: its children slide back under its row. The rows stay in their end
 * position until `onFinished` removed them and canceled the animations.
 *
 * @returns null if nothing can be animated, then fold at once
 */
export function fold(container: HTMLElement | null, id: string, onFinished: () => void): Animation[] | null {
    const parts = collectParts(container, id);
    if (!parts) {
        return null;
    }
    const animations = animate(parts, {
        duration: Math.round(duration(parts.distance) * 0.8),
        easing: EASING,
        direction: 'reverse',
        fill: 'forwards',
    });
    animations[0].onfinish = onFinished;
    return animations;
}
