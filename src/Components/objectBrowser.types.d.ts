import type React from 'react';
import type { IobTheme, ThemeName, ThemeType, Translate } from '../types';
import type { Connection } from '../Connection';
import type { Router } from './Router';
import type { ObjectBrowserClass } from './ObjectBrowser';
import type { AdapterColumn, ObjectBrowserCustomFilter } from './objectBrowserUtils';

type ObjectEventType = 'new' | 'changed' | 'deleted';

interface ObjectEvent {
    id: string;
    obj?: ioBroker.Object;
    type: ObjectEventType;
    oldObj?: ioBroker.Object;
}

interface ObjectsWorker {
    getObjects(update?: boolean): Promise<void | Record<string, ioBroker.Object>>;
    registerHandler(cb: (events: ObjectEvent[]) => void): void;
    unregisterHandler(cb: (events: ObjectEvent[]) => void, doNotUnsubscribe?: boolean): void;
}

interface CustomAdminColumnStored {
    path: string;
    name: string;
    objTypes?: ioBroker.ObjectType[];
    width?: number;
    edit?: boolean;
    type?: ioBroker.CommonType;
}

export interface ContextMenuItem {
    /** hotkey */
    key?: string;
    visibility: boolean;
    icon: React.JSX.Element | string;
    label: string;
    onClick?: () => void;
    listItemIconStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    subMenu?: {
        label: string;
        visibility: boolean;
        icon: React.JSX.Element;
        onClick: () => void;
        iconStyle?: React.CSSProperties;
        style?: React.CSSProperties;
        listItemIconStyle?: React.CSSProperties;
    }[];
    iconStyle?: React.CSSProperties;
}

export type ioBrokerObjectForExport = ioBroker.Object & Partial<ioBroker.State>;

export interface ObjectBrowserEditRoleProps {
    roleArray: { role: string; type: ioBroker.CommonType }[];
    id: string;
    socket: Connection;
    onClose: (obj?: ioBroker.Object | null) => void;
    t: Translate;
    commonType: ioBroker.CommonType;
}

export interface ObjectViewFileDialogProps {
    t: Translate;
    socket: Connection;
    obj: ioBroker.AnyObject;
    onClose: () => void;
}

export interface InsertJsonObjectsDialogProps {
    t: Translate;
    onClose: (json?: string) => void;
    themeType: ThemeType;
    themeName: ThemeName;
}

export interface TreeItemData {
    id: string;
    name: string;
    obj?: ioBroker.Object;
    /** Object ID in lower case for filtering */
    fID?: string;
    /** translated common.name in lower case for filtering */
    fName?: string;
    /** Link to parent item */
    parent?: TreeItem;
    level?: number;
    icon?: string | React.JSX.Element | null;
    /** If the item existing object or generated folder */
    generated?: boolean;
    title?: string;
    /** if the item has "write" button (value=true, ack=false) */
    button?: boolean;
    /** If the item has read and write and is boolean */
    switch?: boolean;
    /** If the item is url linke */
    url?: boolean;
    /** if the item has custom settings in `common.custom` */
    hasCustoms?: boolean;
    /** If this item is visible */
    visible?: boolean;
    /** Is any of the children visible (not only directly children) */
    hasVisibleChildren?: boolean;
    /** Is any of the parents visible (not only directly parent) */
    hasVisibleParent?: boolean;
    /** Combination of `visible || hasVisibleChildren` */
    sumVisibility?: boolean;
    /** translated names of enumerations (functions) where this object is the member (or the parent), divided by comma */
    funcs?: string;
    /** is if the enums are from parent */
    pef?: boolean;
    /** translated names of enumerations (rooms) where this object is the member (or the parent), divided by comma */
    rooms?: string;
    /** is if the enums are from parent */
    per?: boolean;
    // language in what the rooms and functions where translated
    lang?: ioBroker.Languages;
    state?: {
        valTextRx?: React.JSX.Element[] | null;
        style?: React.CSSProperties;
    };
    aclTooltip?: null | React.JSX.Element;
}

export interface TreeItem {
    id?: string;
    data: TreeItemData;
    children?: TreeItem[];
}

interface DragWrapperProps {
    item: TreeItem;
    className?: string;
    style?: React.CSSProperties;
    children: React.JSX.Element | null;
}

export interface ObjectCustomDialogProps {
    allVisibleObjects: boolean;
    customsInstances: string[];
    expertMode?: boolean;
    isFloatComma: boolean;
    lang: ioBroker.Languages;
    objectIDs: string[];
    objects: Record<string, ioBroker.Object>;
    onClose: () => void;
    reportChangedIds: (ids: string[]) => void;
    socket: Connection;
    systemConfig: ioBroker.SystemConfigObject;
    t: Translate;
    theme: IobTheme;
    themeName: ThemeName;
    themeType: ThemeType;
}

export interface ObjectMoveRenameDialogProps {
    childrenIds: string[];
    expertMode: boolean;
    id: string;
    objectType: ioBroker.ObjectType | undefined;
    onClose: () => void;
    socket: Connection;
    t: Translate;
    theme: IobTheme;
}

export interface ObjectBrowserValueProps {
    /** State type */
    type: 'states' | 'string' | 'number' | 'boolean' | 'json';
    /** State role */
    role: string;
    /** common.states */
    states: Record<string, string> | null;
    /** The state value */
    value: string | number | boolean | null;
    /** If expert mode is enabled */
    expertMode: boolean;
    onClose: (newValue?: {
        val: ioBroker.StateValue;
        ack: boolean;
        q: ioBroker.STATE_QUALITY[keyof ioBroker.STATE_QUALITY];
        expire: number | undefined;
    }) => void;
    /** Configured theme */
    themeType: ThemeType;
    theme: IobTheme;
    socket: Connection;
    defaultHistory: string;
    dateFormat: string;
    object: ioBroker.StateObject;
    isFloatComma: boolean;
    t: Translate;
    lang: ioBroker.Languages;
    width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface ObjectBrowserEditObjectProps {
    socket: Connection;
    obj: ioBroker.AnyObject;
    roleArray: { role: string; type: ioBroker.CommonType }[];
    expertMode: boolean;
    themeType: ThemeType;
    theme: IobTheme;
    aliasTab: boolean;
    onClose: (obj?: ioBroker.AnyObject) => void;
    dialogName?: string;
    objects: Record<string, ioBroker.AnyObject>;
    dateFormat: string;
    isFloatComma: boolean;
    onNewObject: (obj: ioBroker.AnyObject) => void;
    t: Translate;
    width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface ObjectAliasEditorProps {
    t: Translate;
    roleArray: { role: string; type: ioBroker.CommonType }[];
    socket: Connection;
    objects: Record<string, ioBroker.AnyObject>;
    onRedirect: (id: string, delay?: number) => void;
    obj: ioBroker.AnyObject;
    onClose: () => void;
}

export type ObjectBrowserColumn = 'name' | 'type' | 'role' | 'room' | 'func' | 'val' | 'buttons';

export type ObjectBrowserPossibleColumns =
    | 'name'
    | 'type'
    | 'role'
    | 'room'
    | 'func'
    | 'val'
    | 'buttons'
    | 'changedFrom'
    | 'qualityCode'
    | 'timestamp'
    | 'lastChange'
    | 'id';

export interface FormatValueOptions {
    state: ioBroker.State;
    obj: ioBroker.StateObject;
    texts: Record<string, string>;
    dateFormat: string;
    isFloatComma: boolean;
    full?: boolean;
}

export interface TreeInfo {
    funcEnums: string[];
    roomEnums: string[];
    roles: { role: string; type: ioBroker.CommonType }[];
    ids: string[];
    types: string[];
    objects: Record<string, ioBroker.Object>;
    customs: string[];
    enums: string[];
    hasSomeCustoms: boolean;
    // List of all aliases that shows to this state
    aliasesMap: { [stateId: string]: string[] };
}

export interface GetValueStyleOptions {
    state: ioBroker.State;
    isExpertMode?: boolean;
    isButton?: boolean;
}

export interface ObjectBrowserCustomFilter {
    type?: ioBroker.ObjectType | ioBroker.ObjectType[];
    common?: {
        type?: ioBroker.CommonType | ioBroker.CommonType[];
        role?: string | string[];
        // If "_" - no custom set
        // If "_dataSources" - only data sources (history, sql, influxdb, ...)
        // Else "telegram." or something like this
        // `true` - If common.custom not empty
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        custom?: '_' | '_dataSources' | true | string | string[];
    };
}

export interface InputSelectItem {
    value: string;
    name: string;
    icon?: null | React.JSX.Element;
}

export interface AdapterColumn {
    adapter: string;
    id: string;
    name: string;
    path: string[];
    pathText: string;
    edit?: boolean;
    type?: 'boolean' | 'string' | 'number';
    objTypes?: ioBroker.ObjectType[];
    align?: 'center' | 'left' | 'right';
}

export interface ObjectBrowserFilter {
    id?: string;
    name?: string;
    room?: string[];
    func?: string[];
    role?: string[];
    type?: string[];
    custom?: string[];
    expertMode?: boolean;
}

export interface ObjectBrowserProps {
    /** where to store settings in localStorage */
    dialogName?: string;
    defaultFilters?: ObjectBrowserFilter;
    selected?: string | string[];
    onSelect?: (selected: string | string[], name: string | null, isDouble?: boolean) => void;
    onFilterChanged?: (newFilter: ObjectBrowserFilter) => void;
    socket: Connection;
    showExpertButton?: boolean;
    expertMode?: boolean;
    imagePrefix?: string;
    themeName: ThemeName;
    themeType: ThemeType;
    /** will be filled by withWidth */
    width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    theme: IobTheme;
    t: Translate;
    lang: ioBroker.Languages;
    multiSelect?: boolean;
    notEditable?: boolean;
    foldersFirst?: boolean;
    disableColumnSelector?: boolean;
    isFloatComma?: boolean;
    dateFormat?: string;
    levelPadding?: number;
    /** Allow selection of non-objects (virtual branches) */
    allowNonObjects?: boolean;
    /** Called when all objects are loaded */
    onAllLoaded?: () => void;

    // components
    objectCustomDialog?: React.FC<ObjectCustomDialogProps>;
    objectMoveRenameDialog?: React.FC<ObjectMoveRenameDialogProps>;
    objectAddBoolean?: boolean; // optional toolbar button
    objectEditBoolean?: boolean; // optional toolbar button
    objectStatesView?: boolean; // optional toolbar button
    objectImportExport?: boolean; // optional toolbar button
    objectEditOfAccessControl?: boolean; // Access Control
    /** modal add object */
    modalNewObject?: (oBrowser: ObjectBrowserClass) => React.JSX.Element;
    /** modal Edit Of Access Control */
    modalEditOfAccessControl: (oBrowser: ObjectBrowserClass, data: TreeItemData) => React.JSX.Element;
    onObjectDelete?: (id: string, hasChildren: boolean, objectExists: boolean, childrenCount: number) => void;

    /**
     * Optional filter
     *   `{common: {custom: true}}` - show only objects with some custom settings
     *   `{common: {custom: 'sql.0'}}` - show only objects with `sql.0` custom settings (only of the specific instance)
     *   `{common: {custom: '_dataSources'}}` - show only objects of adapters `influxdb' or 'sql' or 'history'
     *   `{common: {custom: 'adapterName.'}}` - show only objects of custom settings of specific adapter (all instances)
     *   `{type: 'channel'}` - show only channels
     *   `{type: ['channel', 'device']}` - show only channels and devices
     *   `{common: {type: 'number'}` - show only states of type 'number
     *   `{common: {type: ['number', 'string']}` - show only states of type 'number and string
     *   `{common: {role: ['switch']}` - show only states with roles starting from switch
     *   `{common: {role: ['switch', 'button']}` - show only states with roles starting from `switch` and `button`
     */
    customFilter: ObjectBrowserCustomFilter;
    objectBrowserValue?: React.FC<ObjectBrowserValueProps>;
    objectBrowserEditObject?: React.FC<ObjectBrowserEditObjectProps>;
    /** on edit alias */
    objectBrowserAliasEditor?: React.FC<ObjectAliasEditorProps>;
    /** on Edit role */
    objectBrowserEditRole?: React.FC<ObjectBrowserEditRoleProps>;
    /** on view file state */
    objectBrowserViewFile?: React.FC<ObjectViewFileDialogProps>;
    objectBrowserInsertJsonObjects?: React.FC<InsertJsonObjectsDialogProps>;
    router?: typeof Router;
    types?: ioBroker.ObjectType[];
    /** Possible columns: ['name', 'type', 'role', 'room', 'func', 'val', 'buttons'] */
    columns?: ObjectBrowserColumn[];
    /** Shows only elements of this root */
    root?: string;

    /** cache of objects */
    objectsWorker?: ObjectsWorker;
    /**
     * function to filter out all unnecessary objects. It cannot be used together with "types"
     * Example for function: `obj => obj.common?.type === 'boolean'` to show only boolean states
     */
    filterFunc?: (obj: ioBroker.Object) => boolean;
    /** Used for enums dragging */
    DragWrapper?: React.FC<DragWrapperProps>;
    /** let DragWrapper know about objects to get the icons */
    setObjectsReference?: (objects: Record<string, ioBroker.Object>) => void;
    dragEnabled?: boolean;
}

export interface ObjectBrowserState {
    loaded: boolean;
    foldersFirst: boolean;
    selected: string[];
    focused: string;
    selectedNonObject: string;
    filter: ObjectBrowserFilter;
    filterKey: number;
    depth: number;
    expandAllVisible: boolean;
    expanded: string[];
    toast: string;
    scrollBarWidth: number;
    customDialog: null | string[];
    customDialogAll?: boolean;
    editObjectDialog: string;
    editObjectAlias: boolean; // open the edit object dialog on alias tab
    viewFileDialog: string;
    showAliasEditor: string;
    enumDialog: null | {
        item: TreeItem;
        type: 'room' | 'func';
        enumsOriginal: string;
    };
    enumDialogEnums?: null | string[];
    roleDialog: null | string;
    statesView: boolean;
    /** ['name', 'type', 'role', 'room', 'func', 'val', 'buttons'] */
    columns: ObjectBrowserPossibleColumns[] | null;
    columnsForAdmin: Record<string, CustomAdminColumnStored[]> | null;
    columnsSelectorShow: boolean;
    columnsAuto: boolean;
    columnsWidths: Record<string, number>;
    columnsDialogTransparent: number;
    columnsEditCustomDialog: null | {
        obj: ioBroker.Object;
        item: TreeItem;
        it: AdapterColumn;
    };
    customColumnDialogValueChanged: boolean;
    showExportDialog: false | number;
    showImportDialog: boolean;
    showAllExportOptions: boolean;
    linesEnabled: boolean;
    showDescription: boolean;
    showContextMenu: {
        item: TreeItem;
        position: { left: number; top: number };
        subItem?: string;
        subAnchor?: HTMLLIElement;
    } | null;
    noStatesByExportImport: boolean;
    beautifyJsonExport: boolean;
    excludeSystemRepositoriesFromExport: boolean;
    excludeTranslations: boolean;
    updating?: boolean;
    modalNewObj?: null | { id: string; initialType?: ioBroker.ObjectType; initialStateType?: ioBroker.CommonType };
    error?: any;
    modalEditOfAccess?: boolean;
    modalEditOfAccessObjData?: TreeItemData;
    updateOpened?: boolean;
    tooltipInfo: null | { el: React.JSX.Element[]; id: string };
    /** Show the menu with aliases for state */
    aliasMenu: string;
    /** Show rename dialog */
    showRenameDialog: {
        id: string;
        childrenIds: string[];
    } | null;
    showImportMenu: HTMLButtonElement | null;
}
