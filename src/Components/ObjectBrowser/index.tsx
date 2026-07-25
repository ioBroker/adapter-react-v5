/**
 * Copyright 2020-2026, Denis Haev <dogafox@gmail.com>
 *
 * MIT License
 *
 * Public API of the object browser. The implementation is split into:
 * - `ObjectBrowserClass.tsx` - the component itself (state, subscriptions, tree, rendering)
 * - `dialogs.tsx`            - all modal dialogs of the browser
 * - `toolbar.tsx`            - toolbar, filter fields and the table header
 * - `renderLeaf.tsx`         - rendering of one row of the table
 * - `contextMenu.tsx`        - the context menu of a row
 * - `styles.ts`              - styles of the component
 * - `constants.tsx`          - constants and the icons of the object types
 * - `utils.tsx`              - pure helper functions and small helper components
 * - `types.d.ts`             - types of the component
 */
export { ObjectBrowserClass, ObjectBrowser } from './ObjectBrowserClass';
export { ITEM_IMAGES } from './constants';
export { getSelectIdIconFromObjects, pattern2RegEx } from './utils';

export type {
    TreeItemData,
    TreeItem,
    ObjectBrowserFilter,
    ObjectBrowserCustomFilter,
    ObjectBrowserColumn,
    ObjectBrowserProps,
    ObjectBrowserNavigation,
} from './types';
