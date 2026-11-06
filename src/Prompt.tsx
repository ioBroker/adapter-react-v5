import { CAP_PATH, RING_PATH, STEM_PATH } from './Components/Loaders/logo';

/** The colors of the ioBroker logo */
const DARK_BLUE = '#164477';
const LIGHT_BLUE = '#3399cc';
/** Chips with white text: darker than the light blue, so the text stays readable */
const CHIP_BLUE = '#1f6fa8';
/** Secondary text, readable on the light and on the dark console */
const MUTED = '#8a96a8';
const HEART = '#e5484d';

const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/**
 * The white mark as data URL. The consoles load no other URLs, and Firefox drops every value
 * containing "http://" (the namespace of the SVG), therefore it is percent-encoded.
 */
const LOGO = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 80 488 494" fill="#fff"><path d="${RING_PATH}"/><path d="${CAP_PATH}"/><path d="${STEM_PATH}"/></svg>`,
)}")`;

/**
 * Banner with the logo. Chrome allows no `display` in the console, so the height comes from
 * the line height (padding of an inline element does not enlarge the line).
 * `background-color` is the fallback if a browser drops the image.
 */
const BANNER = [
    `font: 700 26px/60px ${SANS}`,
    'color: #fff',
    'padding: 12px 24px 12px 66px',
    'border-radius: 14px',
    `background-color: ${DARK_BLUE}`,
    `background-image: ${LOGO}, linear-gradient(120deg, #0d2a4d 0%, ${DARK_BLUE} 40%, ${LIGHT_BLUE} 100%)`,
    'background-repeat: no-repeat',
    'background-position: 22px 50%, 0 0',
    'background-size: 32px 32px, 100% 100%',
    'text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35)',
].join(';');

const GREETING = `font: 600 15px ${SANS}`;
const SECONDARY = `font: 400 13px ${SANS}; color: ${MUTED}`;
const CHIP = `color: #fff; background: ${CHIP_BLUE}; padding: 2px 4px; border-radius: 6px; font-weight: 600; line-height: 26px`;
/** Resets the style, so the consoles render the URLs as normal links */
const PLAIN = '';

const LINKS: [label: string, url: string][] = [
    ['GitHub', 'https://github.com/ioBroker/ioBroker'],
    ['Community adapters', 'https://github.com/iobroker-community-adapters'],
    ['Forum', 'https://forum.iobroker.net'],
];

/**
 * Print the ioBroker welcome message to the developer console.
 */
export function printPrompt(): void {
    // The chips have the same width, so the URLs are aligned (the console font is monospace)
    const width = Math.max(...LINKS.map(([label]) => label.length));

    const parts: [text: string, style: string][] = [
        ['ioBroker', BANNER],
        ['   Nice to see you here! :)', GREETING],
        ['\n\n', PLAIN],
        ['Join our dev community:\n', SECONDARY],
    ];
    for (const [label, url] of LINKS) {
        parts.push([` ${label.padEnd(width)} `, CHIP], [`  ${url}\n`, PLAIN]);
    }
    parts.push(
        ['\n♥', `color: ${HEART}; font-size: 14px`],
        [' Help us to create open source projects with React. See you :)', SECONDARY],
    );

    console.log(parts.map(([text]) => `%c${text}`).join(''), ...parts.map(([, style]) => style));
}

export default printPrompt;
