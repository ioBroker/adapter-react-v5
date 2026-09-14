import type { IconLibraryCategory, IconLibraryItem } from './types';

export interface IconLibrary {
    categories: IconLibraryCategory[];
    icons: IconLibraryItem[];
}

let loading: Promise<IconLibrary> | null = null;

/**
 * Load the icon library.
 * The icon data is a separate chunk, which is fetched only on the first call.
 */
export function loadIconLibrary(): Promise<IconLibrary> {
    loading ||= import('./iconLibraryData')
        .then(data => ({ categories: data.ICON_LIBRARY_CATEGORIES, icons: data.ICON_LIBRARY }))
        .catch((error: unknown) => {
            // allow the next call to try again
            loading = null;
            throw error;
        });
    return loading;
}

/**
 * Convert an icon of the library to an SVG data URL, as it is stored in `common.icon`.
 * The icon is painted with `currentColor`, so it follows the text color of the theme.
 *
 * @param icon icon of the library or its SVG path
 */
export function getIconLibrarySvg(icon: IconLibraryItem | string): string {
    const path = typeof icon === 'string' ? icon : icon.p;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="${path}"/></svg>`;
    return `data:image/svg+xml;base64,${window.btoa(svg)}`;
}

/**
 * Get the name of an icon or a category in the given language
 *
 * @param item icon or category
 * @param lang language
 */
export function getIconLibraryName(item: IconLibraryItem | IconLibraryCategory, lang: ioBroker.Languages): string {
    const name = 'n' in item ? item.n : item.name;
    return name[lang] || name.en;
}

/**
 * Check if the icon matches the search text: in the given language, in English or by its ID
 *
 * @param icon icon of the library
 * @param search search text in lower case
 * @param lang language
 */
export function isIconLibraryMatch(icon: IconLibraryItem, search: string, lang: ioBroker.Languages): boolean {
    return (
        (icon.n[lang] || '').toLowerCase().includes(search) ||
        icon.n.en.toLowerCase().includes(search) ||
        icon.id.replace(/-/g, ' ').includes(search)
    );
}
