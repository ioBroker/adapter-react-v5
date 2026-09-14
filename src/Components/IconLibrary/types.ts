export interface IconLibraryCategory {
    id: string;
    name: ioBroker.Translated;
    /** The icons of this category are the classic room and device icons, not icons of the library */
    builtin?: boolean;
}

export interface IconLibraryItem {
    /** ID of the category */
    c: string;
    /** Unique ID of the icon */
    id: string;
    /** Name in every language */
    n: ioBroker.Translated;
    /** SVG path of the icon with the view box 0 0 24 24 */
    p: string;
}
