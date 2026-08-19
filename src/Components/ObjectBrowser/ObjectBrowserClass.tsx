/**
 * Copyright 2020-2026, Denis Haev <dogafox@gmail.com>
 *
 * MIT License
 *
 * The object browser itself: state, socket subscriptions, the tree and the rendering.
 * The dialogs, the toolbar, the rows and the context menu live in the sibling files of this
 * directory and get this instance as the first argument. Because of that, the members of this
 * class are not private, even if they are not intended to be used outside of the object browser.
 */
/* eslint-disable react/no-unused-class-component-methods -- the members are used by the sibling modules of this directory */
import React, { Component, createRef, type JSX } from 'react';

import { Box, LinearProgress } from '@mui/material';

// own
import { Connection } from '../../Connection';
import { Utils } from '../Utils'; // @iobroker/gui-components/Components/Utils
import { TabContainer } from '../TabContainer';
import { TabContent } from '../TabContent';
import { TabHeader } from '../TabHeader';
import {
    applyFilter,
    binarySearch,
    buildTree,
    findNode,
    formatValue,
    generateFile,
    getName,
    colVar,
    widthFromContainer,
    growVar,
    getSelectIdIconFromObjects,
    setCustomValue,
} from './utils';
import { HistoryChart } from './HistoryChart';
import type { Width } from '../../types';
import type {
    ObjectBrowserProps,
    AdapterColumn,
    ObjectBrowserFilter,
    ObjectBrowserNavigation,
    ObjectBrowserPossibleColumns,
    ObjectBrowserState,
    TreeInfo,
    TreeItem,
    CustomAdminColumnStored,
    ObjectEvent,
    ioBrokerObjectForExport,
} from './types';
import { styles } from './styles';
import * as dialogs from './dialogs';
import * as toolbar from './toolbar';
import * as leaf from './renderLeaf';
import * as contextMenu from './contextMenu';
import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_FILTER,
    ITEM_LEVEL,
    MIN_COLUMN_WIDTHS,
    SCREEN_WIDTHS,
    type ScreenWidth,
    type ScreenWidthOne,
} from './constants';

export { getSelectIdIconFromObjects, type ObjectBrowserFilter };

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        grey: true;
    }
}

let objectsAlreadyLoaded = false;

export class ObjectBrowserClass extends Component<ObjectBrowserProps, ObjectBrowserState> {
    // do not define the type as null to save the performance, so we must check it every time
    info: TreeInfo = {
        funcEnums: [],
        roomEnums: [],
        roles: [],
        ids: [],
        types: [],
        objects: {},
        customs: [],
        enums: [],
        hasSomeCustoms: false,
        aliasesMap: {},
    };
    localStorage: Storage = ((window as any)._localStorage as Storage) || window.localStorage;
    /**
     * Own copy of the screen widths. The widths, that the user stored for THIS dialog, must not leak
     * into the other instances of the object browser (the constant is a module singleton).
     */
    private readonly screenWidths: ScreenWidth = JSON.parse(JSON.stringify(SCREEN_WIDTHS)) as ScreenWidth;
    private readonly tableRef: React.RefObject<HTMLDivElement | null>;
    /** Watches the width of the table container to detect the width class */
    private resizeObserver: ResizeObserver | null = null;
    private observedContainer: HTMLDivElement | null = null;
    /** Width class for which the columns were calculated the last time */
    private lastCalculatedWidth: Width | null = null;
    private pausedSubscribes: boolean = false;
    /** The tree was rebuilt while subscribes were paused, so the filter must be re-applied on resume */
    private treeRebuiltWhilePaused: boolean = false;
    private selectFirst: string;
    /** Last navigation that was applied from `navigateTo` or reported via `onNavigateTo` (loop guard). */
    private lastNav: ObjectBrowserNavigation | null = null;
    /** True while applying `navigateTo`, so the derived-state watcher does not echo it back. */
    private applyingNav: boolean = false;
    root: TreeItem | null = null;
    readonly states: Record<string, ioBroker.State> = {};
    subscribes: string[] = [];
    private unsubscribeTimer: ReturnType<typeof setTimeout> | null = null;
    private statesUpdateTimer: ReturnType<typeof setTimeout> | null = null;
    private objectsUpdateTimer: ReturnType<typeof setTimeout> | null = null;
    /** Columns that are visible in the auto mode. Depends on the width of the container */
    visibleCols: ObjectBrowserPossibleColumns[];
    readonly texts: Record<string, string>;
    readonly possibleCols: ObjectBrowserPossibleColumns[];
    readonly imagePrefix: string;
    adapterColumns: AdapterColumn[] = [];
    private styleTheme: string = '';
    edit: {
        val: string | number | boolean | null;
        q: number;
        ack: boolean;
        id: string;
    } = {
        id: '',
        val: '',
        q: 0,
        ack: false,
    };
    readonly levelPadding: number;
    private customWidth: boolean = false;
    private resizerNextName: string | null = null;
    private resizerActiveName: string | null = null;
    private resizerCurrentWidths: Record<string, number> = {};
    private resizeLeft: boolean = false;
    private resizerOldWidth: number = 0;
    private resizerMin: number = 0;
    private resizerNextMin: number = 0;
    private resizerOldWidthNext: number = 0;
    private resizerPosition: number = 0;
    private resizerActiveDiv: HTMLDivElement | null = null;
    private resizerNextDiv: HTMLDivElement | null = null;
    private storedWidths: ScreenWidthOne | null = null;
    systemConfig: ioBroker.SystemConfigObject | null = null;
    public objects!: Record<string, ioBroker.Object>;
    defaultHistory: string = '';
    private ctrlPressed = false;
    columnsVisibility: {
        id?: number | string;
        name?: number | string;
        type?: number;
        role?: number;
        room?: number;
        func?: number;
        changedFrom?: number;
        qualityCode?: number;
        timestamp?: number;
        lastChange?: number;
        val?: number;
        buttons?: number;
    } = {};
    changedIds: null | string[] = null;
    contextMenu: null | { item: any; ts: number } = null;
    recordStates: string[] = [];
    styles: {
        cellIdIconFolder?: React.CSSProperties;
        cellIdIconDocument?: React.CSSProperties;
        iconDeviceError?: React.CSSProperties;
        iconDeviceConnected?: React.CSSProperties;
        iconDeviceDisconnected?: React.CSSProperties;
        cellButtonsButtonWithCustoms?: React.CSSProperties;
        invertedBackground?: React.CSSProperties;
        invertedBackgroundFlex?: React.CSSProperties;
        contextMenuEdit?: React.CSSProperties;
        contextMenuEditValue?: React.CSSProperties;
        contextMenuView?: React.CSSProperties;
        contextMenuCustom?: React.CSSProperties;
        contextMenuACL?: React.CSSProperties;
        contextMenuRoom?: React.CSSProperties;
        contextMenuRole?: React.CSSProperties;
        contextMenuDelete?: React.CSSProperties;
        filterInput?: React.CSSProperties;
        iconCopy?: React.CSSProperties;
        aliasReadWrite?: React.CSSProperties;
        aliasAlone?: React.CSSProperties;
    } = {};
    private expertMode: boolean = false;
    customColumnDialog: null | {
        value: boolean | number | string;
        type: 'boolean' | 'number' | 'string';
        initValue: boolean | number | string;
    } = null;

    constructor(props: ObjectBrowserProps) {
        super(props);

        const lastSelectedItemStr: string =
            this.localStorage.getItem(`${props.dialogName || 'App'}.objectSelected`) || '';

        this.selectFirst = '';

        this.expertMode = !!this.props.expertMode;

        if (lastSelectedItemStr.startsWith('[')) {
            try {
                const lastSelectedItems = JSON.parse(lastSelectedItemStr) as string[];
                this.selectFirst = lastSelectedItems[0] || '';
            } catch {
                // ignore
            }
        } else {
            this.selectFirst = lastSelectedItemStr;
        }

        let expanded: string[];
        const expandedStr = this.localStorage.getItem(`${props.dialogName || 'App'}.objectExpanded`) || '[]';
        try {
            expanded = JSON.parse(expandedStr);
        } catch {
            expanded = [];
        }

        let filter: ObjectBrowserFilter;
        const filterStr: string = props.defaultFilters
            ? ''
            : this.localStorage.getItem(`${props.dialogName || 'App'}.objectFilter`) || '';
        if (filterStr) {
            try {
                filter = JSON.parse(filterStr);
            } catch {
                filter = { ...DEFAULT_FILTER };
            }
        } else if (props.defaultFilters && typeof props.defaultFilters === 'object') {
            filter = { ...props.defaultFilters };
        } else {
            filter = { ...DEFAULT_FILTER };
        }
        // Migrate old filters to new one
        if (typeof filter.room === 'string' && filter.room) {
            filter.room = [filter.room].filter(s => s);
            if (!filter.room.length) {
                delete filter.room;
            }
        }
        if (typeof filter.func === 'string' && filter.func) {
            filter.func = [filter.func].filter(s => s);
            if (!filter.func.length) {
                delete filter.func;
            }
        }
        if (typeof filter.role === 'string' && filter.role) {
            filter.role = [filter.role].filter(s => s);
            if (!filter.role.length) {
                delete filter.role;
            }
        }
        if (typeof filter.type === 'string') {
            filter.type = [filter.type].filter(s => s);
            if (!filter.type.length) {
                delete filter.type;
            }
        }
        if (typeof filter.custom === 'string') {
            filter.custom = [filter.custom].filter(s => s);
            if (!filter.custom.length) {
                delete filter.custom;
            }
        }

        filter.expertMode =
            props.expertMode !== undefined
                ? props.expertMode
                : (((window as any)._sessionStorage as Storage) || window.sessionStorage).getItem('App.expertMode') ===
                  'true';
        this.tableRef = createRef();

        this.visibleCols = props.columns || this.screenWidths[props.width || 'lg'].fields;
        // remove type column if only one type must be selected
        if (props.types && props.types.length === 1) {
            const pos = this.visibleCols.indexOf('type');
            if (pos !== -1) {
                this.visibleCols.splice(pos, 1);
            }
        }

        this.possibleCols = this.screenWidths.xl.fields;

        let customDialog = null;

        if (props.router) {
            const location = props.router.getLocation();
            if (location.id && location.dialog === 'customs') {
                customDialog = [location.id];
                this.pauseSubscribe(true);
            }
        }

        let selected: string[];
        if (!Array.isArray(props.selected)) {
            selected = [props.selected || ''];
        } else {
            selected = props.selected;
        }
        selected = selected.map(id => id.replace(/["']/g, '')).filter(id => id);

        this.selectFirst = selected.length && selected[0] ? selected[0] : this.selectFirst;

        const columnsStr = this.localStorage.getItem(`${props.dialogName || 'App'}.columns`);
        let columns: ObjectBrowserPossibleColumns[] | null;
        try {
            columns = columnsStr ? JSON.parse(columnsStr) : null;
        } catch {
            columns = null;
        }

        let columnsWidths = null; // this.localStorage.getItem(`${props.dialogName || 'App'}.columnsWidths`);
        try {
            columnsWidths = columnsWidths ? JSON.parse(columnsWidths) : {};
        } catch {
            columnsWidths = {};
        }

        this.imagePrefix = props.imagePrefix || '.';
        let foldersFirst: boolean;
        const foldersFirstStr = this.localStorage.getItem(`${props.dialogName || 'App'}.foldersFirst`);

        if (foldersFirstStr === 'false') {
            foldersFirst = false;
        } else if (foldersFirstStr === 'true') {
            foldersFirst = true;
        } else {
            foldersFirst = props.foldersFirst === undefined ? true : props.foldersFirst;
        }

        let statesView = false;
        try {
            statesView = this.props.objectStatesView
                ? JSON.parse(this.localStorage.getItem(`${props.dialogName || 'App'}.objectStatesView`) || '') || false
                : false;
        } catch {
            // ignore
        }

        this.state = {
            aliasMenu: '',
            beautifyJsonExport: true,
            columns,
            columnsAuto: this.localStorage.getItem(`${props.dialogName || 'App'}.columnsAuto`) !== 'false',
            columnsDialogTransparent: 100,
            columnsEditCustomDialog: null,
            columnsForAdmin: null,
            columnsSelectorShow: false,
            columnsWidths,
            customColumnDialogValueChanged: false,
            customDialog,
            depth: 0,
            editObjectAlias: false, // open the edit object dialog on alias tab
            editObjectDialog: '',
            enumDialog: null,
            excludeSystemRepositoriesFromExport: true,
            excludeTranslations: false,
            expandAllVisible: false,
            expanded,
            filter,
            filterKey: 0,
            containerWidth: props.width || 'lg',
            focused: this.localStorage.getItem(`${props.dialogName || 'App'}.focused`) || '',
            foldersFirst,
            linesEnabled: this.localStorage.getItem(`${props.dialogName || 'App'}.lines`) === 'true',
            loaded: false,
            noStatesByExportImport: false,
            roleDialog: null,
            selected,
            selectedNonObject: this.localStorage.getItem(`${props.dialogName || 'App'}.selectedNonObject`) || '',
            showAliasEditor: '',
            showAllExportOptions: false,
            showContextMenu: null,
            showDescription: this.localStorage.getItem(`${props.dialogName || 'App'}.desc`) !== 'false',
            showExportDialog: false,
            showImportDialog: false,
            showImportMenu: null,
            showRenameDialog: null,
            statesView,
            toast: '',
            tooltipInfo: null,
            viewFileDialog: '',
        };

        this.texts = {
            name: props.t('ra_Name'),
            categories: props.t('ra_Categories'),
            value: props.t('ra_tooltip_value'),
            ack: props.t('ra_tooltip_ack'),
            ts: props.t('ra_tooltip_ts'),
            lc: props.t('ra_tooltip_lc'),
            from: props.t('ra_tooltip_from'),
            user: props.t('ra_tooltip_user'),
            c: props.t('ra_tooltip_comment'),
            quality: props.t('ra_tooltip_quality'),
            editObject: props.t('ra_tooltip_editObject'),
            deleteObject: props.t('ra_tooltip_deleteObject'),
            customConfig: props.t('ra_tooltip_customConfig'),
            copyState: props.t('ra_tooltip_copyState'),
            editState: props.t('ra_tooltip_editState'),
            ctrlForLink: props.t('ra_tooltip_ctrlForLink'),
            close: props.t('ra_Close'),
            filter_id: props.t('ra_filter_id'),
            filter_name: props.t('ra_filter_name'),
            filter_type: props.t('ra_filter_type'),
            filter_role: props.t('ra_filter_role'),
            filter_room: props.t('ra_filter_room'),
            filter_func: props.t('ra_filter_func'),
            filter_custom: props.t('ra_filter_customs'), //
            filterCustomsWithout: props.t('ra_filter_customs_without'), //
            objectChangedByUser: props.t('ra_object_changed_by_user'), // Object last changed at
            objectChangedBy: props.t('ra_object_changed_by'), // Object changed by
            objectChangedFrom: props.t('ra_state_changed_from'), // Object changed from
            stateChangedBy: props.t('ra_state_changed_by'), // State changed by
            stateChangedFrom: props.t('ra_state_changed_from'), // State changed from
            ownerGroup: props.t('ra_Owner group'),
            ownerUser: props.t('ra_Owner user'),
            showAll: props.t('ra_show_all'),
            deviceError: props.t('ra_Error'),
            deviceDisconnected: props.t('ra_Disconnected'),
            deviceConnected: props.t('ra_Connected'),

            aclOwner_read_object: props.t('ra_aclOwner_read_object'),
            aclOwner_read_state: props.t('ra_aclOwner_read_state'),
            aclOwner_write_object: props.t('ra_aclOwner_write_object'),
            aclOwner_write_state: props.t('ra_aclOwner_write_state'),
            aclGroup_read_object: props.t('ra_aclGroup_read_object'),
            aclGroup_read_state: props.t('ra_aclGroup_read_state'),
            aclGroup_write_object: props.t('ra_aclGroup_write_object'),
            aclGroup_write_state: props.t('ra_aclGroup_write_state'),
            aclEveryone_read_object: props.t('ra_aclEveryone_read_object'),
            aclEveryone_read_state: props.t('ra_aclEveryone_read_state'),
            aclEveryone_write_object: props.t('ra_aclEveryone_write_object'),
            aclEveryone_write_state: props.t('ra_aclEveryone_write_state'),

            create: props.t('ra_Create'),
            createBooleanState: props.t('ra_create_boolean_state'),
            createNumberState: props.t('ra_create_number_state'),
            createStringState: props.t('ra_create_string_state'),
            createState: props.t('ra_create_state'),
            createChannel: props.t('ra_create_channel'),
            createDevice: props.t('ra_create_device'),
            createFolder: props.t('ra_Create folder'),
        };

        this.levelPadding = props.levelPadding || ITEM_LEVEL;

        const resizerCurrentWidthsStr = this.localStorage.getItem(`${this.props.dialogName || 'App'}.table`);
        if (resizerCurrentWidthsStr) {
            try {
                const resizerCurrentWidths = JSON.parse(resizerCurrentWidthsStr);
                const width = this.width || 'lg';
                this.storedWidths = JSON.parse(JSON.stringify(this.screenWidths[width]));
                Object.keys(resizerCurrentWidths).forEach(id => {
                    if (id === 'id') {
                        this.screenWidths[width].idWidth = resizerCurrentWidths.id;
                    } else if (id === 'nameHeader') {
                        // widths stored by an older version, where the header had an own width
                        this.screenWidths[width].widths.name = resizerCurrentWidths[id];
                    } else if ((this.screenWidths[width].widths as Record<string, number>)[id] !== undefined) {
                        (this.screenWidths[width].widths as Record<string, number>)[id] = resizerCurrentWidths[id];
                    }
                });

                this.customWidth = true;
            } catch {
                // ignore
            }
        }

        this.calculateColumnsVisibility();
    }

    async loadAllObjects(update?: boolean): Promise<void> {
        const props = this.props;

        try {
            await new Promise<void>(resolve => {
                this.setState({ updating: true }, () => resolve());
            });

            const objects =
                (props.objectsWorker
                    ? await props.objectsWorker.getObjects(update)
                    : await props.socket.getObjects(update, true)) || {};
            if (props.types && Connection.isWeb()) {
                for (let i = 0; i < props.types.length; i++) {
                    // admin has ALL objects
                    // web has only state, channel, device, enum, and system.config
                    if (
                        props.types[i] === 'state' ||
                        props.types[i] === 'channel' ||
                        props.types[i] === 'device' ||
                        props.types[i] === 'enum'
                    ) {
                        continue;
                    }
                    const moreObjects = await props.socket.getObjectViewSystem(props.types[i]);
                    Object.assign(objects || {}, moreObjects as Record<string, ioBroker.Object>);
                }
            }

            this.systemConfig ||=
                (objects?.['system.config'] as ioBroker.SystemConfigObject) ||
                (await props.socket.getObject('system.config'));

            this.systemConfig.common ||= {} as ioBroker.SystemConfigCommon;
            this.systemConfig.common.defaultNewAcl ||= {
                object: 0,
                state: 0,
                file: 0,
                owner: 'system.user.admin',
                ownerGroup: 'system.group.administrator',
            };
            this.systemConfig.common.defaultNewAcl.owner ||= 'system.user.admin';
            this.systemConfig.common.defaultNewAcl.ownerGroup ||= 'system.group.administrator';
            if (typeof this.systemConfig.common.defaultNewAcl.state !== 'number') {
                // TODO: may be convert here from string
                this.systemConfig.common.defaultNewAcl.state = 0x664;
            }
            if (typeof this.systemConfig.common.defaultNewAcl.object !== 'number') {
                // TODO: may be convert here from string
                this.systemConfig.common.defaultNewAcl.state = 0x664;
            }

            if (typeof props.filterFunc === 'function') {
                this.objects = {};
                const filterFunc: (obj: ioBroker.Object) => boolean = props.filterFunc;

                Object.keys(objects).forEach(id => {
                    try {
                        if (filterFunc(objects[id])) {
                            this.objects[id] = objects[id];
                        } else {
                            const type = objects[id] && objects[id].type;
                            // include "folder" types too for icons and names of nodes
                            if (
                                type &&
                                (type === 'channel' ||
                                    type === 'device' ||
                                    type === 'folder' ||
                                    type === 'adapter' ||
                                    type === 'instance')
                            ) {
                                this.objects[id] = objects[id];
                            }
                        }
                    } catch (e) {
                        console.log(`Error by filtering of "${id}": ${e}`);
                    }
                });
            } else if (props.types) {
                this.objects = {};
                const propsTypes = props.types;

                Object.keys(objects).forEach(id => {
                    const type = objects[id]?.type;
                    // include "folder" types too
                    if (
                        type &&
                        (type === 'channel' ||
                            type === 'device' ||
                            type === 'enum' ||
                            type === 'folder' ||
                            type === 'adapter' ||
                            type === 'instance' ||
                            propsTypes.includes(type))
                    ) {
                        this.objects[id] = objects[id];
                    }
                });
            } else {
                this.objects = objects;
            }

            if (props.setObjectsReference) {
                props.setObjectsReference(this.objects);
            }

            // read default history
            this.defaultHistory = this.systemConfig.common.defaultHistory;
            if (this.defaultHistory) {
                props.socket
                    .getState(`system.adapter.${this.defaultHistory}.alive`)
                    .then(state => {
                        if (!state?.val) {
                            this.defaultHistory = '';
                        }
                    })
                    .catch(e => window.alert(`Cannot get state: ${e}`));
            }

            const columnsForAdmin = await this.getAdditionalColumns();
            this.calculateColumnsVisibility(null, null, columnsForAdmin);

            const { info, root } = buildTree(this.objects, {
                imagePrefix: props.imagePrefix,
                root: props.root,
                lang: props.lang,
                themeType: props.themeType,
            });
            this.root = root;
            this.info = info;

            // Show first selected item
            const node = this.state.selected?.length && findNode(this.root, this.state.selected[0]);

            // If the selected ID is not visible, reset filter
            if (
                node &&
                !applyFilter(
                    node,
                    this.state.filter,
                    props.lang,
                    this.objects,
                    undefined,
                    undefined,
                    props.customFilter,
                    props.types,
                )
            ) {
                // reset filter
                this.setState({ filter: { ...DEFAULT_FILTER }, columnsForAdmin }, () => {
                    this.doFilter();
                    this.setState({ loaded: true, updating: false }, () =>
                        this.expandAllSelected(() => {
                            this.onAfterSelect();
                            this.applyInitialNavigateTo();
                        }),
                    );
                });
            } else {
                this.doFilter();
                this.setState({ loaded: true, updating: false, columnsForAdmin }, () =>
                    this.expandAllSelected(() => {
                        this.onAfterSelect();
                        this.applyInitialNavigateTo();
                    }),
                );
            }
        } catch (error) {
            this.showError(error);
        }
    }

    expandAllSelected(cb?: () => void): void {
        const expanded = [...this.state.expanded];
        let changed = false;
        this.state.selected.forEach(id => {
            const parts = id.split('.');
            const path = [];
            for (let i = 0; i < parts.length - 1; i++) {
                path.push(parts[i]);
                if (!expanded.includes(path.join('.'))) {
                    expanded.push(path.join('.'));
                    changed = true;
                }
            }
        });
        if (changed) {
            expanded.sort();
            this.localStorage.setItem(`${this.props.dialogName || 'App'}.objectExpanded`, JSON.stringify(expanded));
            this.setState({ expanded }, cb);
        } else if (cb) {
            cb();
        }
    }

    /**
     * @param isDouble is double click
     */
    private onAfterSelect(isDouble?: boolean): void {
        if (this.state.selected?.length && this.state.selected[0]) {
            this.localStorage.setItem(`${this.props.dialogName || 'App'}.objectSelected`, this.state.selected[0]);

            // remove a task to select the pre-selected item if now we want to see another object
            if (this.selectFirst && this.selectFirst !== this.state.selected[0]) {
                this.selectFirst = '';
            }

            // If the this.state.selected[0] filtered out, disable the filter
            const item = this.findItem(this.state.selected[0]);
            if (item?.data && !item.data.visible && !item.data.hasVisibleChildren) {
                // If the selected ID is not visible, reset filter
                this.clearFilter();
            }

            if (this.state.selected.length === 1 && this.objects[this.state.selected[0]]) {
                const name = Utils.getObjectName(this.objects, this.state.selected[0], null, {
                    language: this.props.lang,
                });
                this.props.onSelect?.(this.state.selected, name, isDouble);
            } else if (this.state.selected.length === 1 && this.props.allowNonObjects) {
                this.props.onSelect?.(this.state.selected, null, isDouble);
            } else {
                // we have more than one state
                // Check if all IDs are objects
                if (!this.props.allowNonObjects || !this.state.selected.find(id => !this.objects[id])) {
                    this.props.onSelect?.(this.state.selected, null, isDouble);
                }
            }
        } else {
            this.localStorage.removeItem(`${this.props.dialogName || 'App'}.objectSelected`);

            if (this.state.selected.length) {
                this.setState({ selected: [] }, () => {
                    if (this.props.onSelect) {
                        if (this.state.focused && this.props.allowNonObjects) {
                            // remove a task to select the pre-selected item if now we want to see another object
                            if (this.selectFirst && this.selectFirst !== this.state.selected[0]) {
                                this.selectFirst = '';
                            }
                            this.props.onSelect([this.state.focused], null, isDouble);
                        } else {
                            this.props.onSelect([], '');
                        }
                    }
                });
            } else if (this.props.onSelect) {
                if (this.state.focused && this.props.allowNonObjects) {
                    // remove a task to select the pre-selected item if now we want to see another object
                    if (this.selectFirst && this.selectFirst !== this.state.selected[0]) {
                        this.selectFirst = '';
                    }
                    this.props.onSelect([this.state.focused], null, isDouble);
                } else {
                    this.props.onSelect([], '');
                }
            }
        }
    }

    // This function is used
    private static getDerivedStateFromProps(
        props: ObjectBrowserProps,
        state: ObjectBrowserState,
    ): Partial<ObjectBrowserState> | null {
        const newState: Partial<ObjectBrowserState> = {};
        let changed = false;
        if (props.expertMode !== undefined && props.expertMode !== state.filter.expertMode) {
            changed = true;
            newState.filter = { ...state.filter };
            newState.filter.expertMode = props.expertMode;
        }
        return changed ? newState : null;
    }

    /**
     * Called when component is mounted.
     */
    async componentDidMount(): Promise<void> {
        await this.loadAllObjects(!objectsAlreadyLoaded);
        if (this.props.objectsWorker) {
            this.props.objectsWorker.registerHandler(this.onObjectChangeFromWorker);
        } else {
            await this.props.socket.subscribeObject('*', this.onObjectChange);
        }

        objectsAlreadyLoaded = true;

        window.addEventListener('contextmenu', this.onContextMenu, true);
        window.addEventListener('keydown', this.onKeyPress, true);
        window.addEventListener('keyup', this.onKeyPress, true);

        this.observeContainerWidth();

        // Inform dialog that all objects are loaded
        if (this.props.onAllLoaded) {
            setTimeout(() => {
                this.props.onAllLoaded?.();
            }, 100);
        }
    }

    onKeyPress = (event: KeyboardEvent): void => {
        if (event.type === 'keydown' && event.ctrlKey && !this.ctrlPressed) {
            this.ctrlPressed = true;
            if (this.tableRef.current) {
                this.tableRef.current.className = 'highlight-link';
            }
        } else if (event.type === 'keyup' && !event.ctrlKey && this.ctrlPressed) {
            this.ctrlPressed = false;
            if (this.tableRef.current) {
                this.tableRef.current.className = '';
            }
        }
    };

    /**
     * Called when component is unmounted.
     */
    componentWillUnmount(): void {
        window.removeEventListener('contextmenu', this.onContextMenu, true);
        window.removeEventListener('keydown', this.onKeyPress, true);
        window.removeEventListener('keyup', this.onKeyPress, true);

        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.observedContainer = null;

        // the timers must not fire after the component was destroyed
        if (this.unsubscribeTimer) {
            clearTimeout(this.unsubscribeTimer);
            this.unsubscribeTimer = null;
        }
        if (this.statesUpdateTimer) {
            clearTimeout(this.statesUpdateTimer);
            this.statesUpdateTimer = null;
        }
        if (this.objectsUpdateTimer) {
            clearTimeout(this.objectsUpdateTimer);
            this.objectsUpdateTimer = null;
        }

        if (this.props.objectsWorker) {
            this.props.objectsWorker.unregisterHandler(this.onObjectChangeFromWorker, true);
        } else {
            void this.props.socket
                .unsubscribeObject('*', this.onObjectChange)
                .catch(e => console.error(`Cannot unsubscribe *: ${e}`));
        }

        // remove all subscribes
        this.subscribes.forEach(pattern => {
            // console.log(`- unsubscribe ${pattern}`);
            this.props.socket.unsubscribeState(pattern, this.onStateChange);
        });

        this.subscribes = [];
        this.objects = {};
    }

    /**
     * Show the deletion dialog for a given object
     */
    showDeleteDialog(options: { id: string; obj: ioBroker.Object; item: TreeItem }): void {
        const { id, obj, item } = options;

        // calculate the number of children
        const keys = Object.keys(this.objects);
        keys.sort();
        let count = 0;
        const start = `${id}.`;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].startsWith(start)) {
                count++;
            } else if (keys[i] > start) {
                break;
            }
        }

        this.props.onObjectDelete?.(id, !!item.children?.length, !obj.common?.dontDelete, count + 1);
    }

    /**
     * Context menu handler.
     */
    onContextMenu = (e: MouseEvent): void => {
        // console.log(`CONTEXT MENU: ${this.contextMenu ? Date.now() - this.contextMenu.ts : 'false'}`);
        if (this.contextMenu && Date.now() - this.contextMenu.ts < 2000) {
            e.preventDefault();
            this.setState({
                showContextMenu: {
                    item: this.contextMenu.item,
                    position: { left: e.clientX + 2, top: e.clientY - 6 },
                },
            });
        } else if (this.state.showContextMenu) {
            e.preventDefault();
            this.setState({ showContextMenu: null });
        }
        this.contextMenu = null;
    };

    /**
     * Called when component is mounted.
     */
    refreshComponent(): void {
        // remove all subscribes
        this.subscribes.forEach(pattern => {
            // console.log(`- unsubscribe ${pattern}`);
            this.props.socket.unsubscribeState(pattern, this.onStateChange);
        });

        this.subscribes = [];

        this.loadAllObjects(true)
            .then(() => console.log('updated!'))
            .catch(e => this.showError(e));
    }

    /**
     * Renders the error dialog.
     */
    renderErrorDialog(): JSX.Element | null {
        return dialogs.renderErrorDialog(this);
    }

    /**
     * Show the error dialog.
     */
    showError(error: any): void {
        this.setState({
            error:
                typeof error === 'object'
                    ? error && typeof error.toString === 'function'
                        ? error.toString()
                        : JSON.stringify(error)
                    : error,
        });
    }

    /**
     * Called when an item is selected/deselected.
     */
    onSelect(toggleItem: string, isDouble?: boolean, cb?: () => void): void {
        this.localStorage.setItem(`${this.props.dialogName || 'App'}.focused`, toggleItem);

        if (!this.props.multiSelect) {
            if (
                this.objects[toggleItem] &&
                (!this.props.types || this.props.types.includes(this.objects[toggleItem].type))
            ) {
                this.localStorage.removeItem(`${this.props.dialogName || 'App'}.selectedNonObject`);
                if (this.state.selected[0] !== toggleItem) {
                    this.setState({ selected: [toggleItem], selectedNonObject: '', focused: toggleItem }, () => {
                        this.onAfterSelect(isDouble);
                        if (cb) {
                            cb();
                        }
                    });
                } else if (isDouble && this.props.onSelect) {
                    this.onAfterSelect(isDouble);
                }
            } else {
                this.localStorage.setItem(`${this.props.dialogName || 'App'}.selectedNonObject`, toggleItem);
                this.setState({ selected: [], selectedNonObject: toggleItem, focused: toggleItem }, () => {
                    this.onAfterSelect();
                    if (cb) {
                        cb();
                    }
                });
            }
        } else if (
            this.objects[toggleItem] &&
            (!this.props.types || this.props.types.includes(this.objects[toggleItem].type))
        ) {
            this.localStorage.removeItem(`${this.props.dialogName || 'App'}.selectedNonObject`);

            const selected = [...this.state.selected];
            const pos = selected.indexOf(toggleItem);
            if (pos === -1) {
                selected.push(toggleItem);
                selected.sort();
            } else if (!isDouble) {
                selected.splice(pos, 1);
            }

            this.setState({ selected, selectedNonObject: '', focused: toggleItem }, () => {
                this.onAfterSelect(isDouble);
                if (cb) {
                    cb();
                }
            });
        }
    }

    /**
     * Renders the columns' selector.
     */
    renderColumnsSelectorDialog(): JSX.Element | null {
        return dialogs.renderColumnsSelectorDialog(this);
    }

    private async getAdditionalColumns(): Promise<Record<string, CustomAdminColumnStored[]> | null> {
        try {
            const instances = await this.props.socket.getAdapters();

            let columnsForAdmin: Record<string, CustomAdminColumnStored[]> | null = null;
            // find all additional columns
            instances.forEach(obj => (columnsForAdmin = this.parseObjectForAdmins(columnsForAdmin, obj)));

            return columnsForAdmin;
        } catch (err) {
            // window.alert('Cannot get adapters: ' + e);
            // Object browser in Web has no additional columns
            console.error(`Cannot get adapters: ${err}`);
            return null;
        }
    }

    private checkUnsubscribes(): void {
        // Remove unused subscriptions
        for (let i = this.subscribes.length - 1; i >= 0; i--) {
            if (!this.recordStates.includes(this.subscribes[i])) {
                this.unsubscribe(this.subscribes[i]);
            }
        }
        this.recordStates = [];
    }

    /**
     * Find an item.
     */
    findItem(id: string, _parts?: string[], _root?: TreeItem | null, _partyId?: string): TreeItem | null {
        _parts ||= id.split('.');
        _root ||= this.root;
        if (!_root || !_parts.length) {
            return null;
        }

        _partyId = (_partyId ? `${_partyId}.` : '') + _parts.shift();

        if (_root.children) {
            const item = _root.children.find(i => i.data.id === _partyId);
            if (item) {
                if (item.data.id === id) {
                    return item;
                }
                if (_parts.length) {
                    return this.findItem(id, _parts, item, _partyId);
                }
            } else {
                return null;
            }
        }

        return null;
    }

    /**
     * Called when a state changes.
     */
    onStateChange = (id: string, state?: ioBroker.State | null): void => {
        // console.log(`> stateChange ${id}`);
        if (this.states[id]) {
            const item = this.findItem(id);
            if (item?.data.state) {
                item.data.state = undefined;
            }
        }
        if (state) {
            this.states[id] = state;
        } else {
            delete this.states[id];
        }

        if (!this.pausedSubscribes) {
            if (!this.statesUpdateTimer) {
                this.statesUpdateTimer = setTimeout(() => {
                    this.statesUpdateTimer = null;
                    this.forceUpdate();
                }, 300);
            }
        } else if (this.statesUpdateTimer) {
            clearTimeout(this.statesUpdateTimer);
            this.statesUpdateTimer = null;
        }
    };

    private parseObjectForAdmins(
        columnsForAdmin: Record<string, CustomAdminColumnStored[]> | null,
        obj: ioBroker.AdapterObject,
    ): Record<string, CustomAdminColumnStored[]> | null {
        if (obj.common?.adminColumns && obj.common.name) {
            const columns: string | (string | ioBroker.CustomAdminColumn)[] = obj.common.adminColumns;
            let aColumns: (string | ioBroker.CustomAdminColumn)[] | undefined;
            if (columns && typeof columns !== 'object') {
                aColumns = [columns];
            } else if (columns) {
                aColumns = columns as (string | ioBroker.CustomAdminColumn)[];
            }
            let cColumns: CustomAdminColumnStored[] | null | undefined;
            if (columns) {
                cColumns = aColumns
                    ?.map((_item: string | ioBroker.CustomAdminColumn) => {
                        if (typeof _item !== 'object') {
                            return { path: _item, name: _item.split('.').pop() } as CustomAdminColumnStored;
                        }
                        const item: ioBroker.CustomAdminColumn = _item;
                        // string => array
                        if (item.objTypes && typeof item.objTypes !== 'object') {
                            item.objTypes = [item.objTypes];
                        } else if (!item.objTypes) {
                            item.objTypes = undefined;
                        }

                        if (!item.name && item.path) {
                            return {
                                path: item.path,
                                name: item.path.split('.').pop(),
                                width: item.width,
                                edit: !!item.edit,
                                type: item.type,
                                objTypes: item.objTypes,
                            } as CustomAdminColumnStored;
                        }
                        if (!item.path) {
                            console.warn(`Admin columns for ${obj._id} ignored, because path not found`);
                            return null;
                        }
                        return {
                            path: item.path,
                            name: getName(item.name || '', this.props.lang),
                            width: item.width,
                            edit: !!item.edit,
                            type: item.type,
                            objTypes: item.objTypes,
                        };
                    })
                    .filter((item: CustomAdminColumnStored | null) => item) as CustomAdminColumnStored[];
            } else {
                cColumns = null;
            }

            if (cColumns && cColumns.length) {
                columnsForAdmin ||= {};
                columnsForAdmin[obj.common.name] = cColumns.sort((a, b) =>
                    a.path > b.path ? -1 : a.path < b.path ? 1 : 0,
                );
            }
        } else if (obj.common && obj.common.name && columnsForAdmin && columnsForAdmin[obj.common.name]) {
            delete columnsForAdmin[obj.common.name];
        }
        return columnsForAdmin;
    }

    onObjectChangeFromWorker = (events: ObjectEvent[]): void => {
        if (Array.isArray(events)) {
            let newState: { columnsForAdmin: Record<string, CustomAdminColumnStored[] | null> | null } | null = null;
            events.forEach(event => {
                const { newInnerState, filtered } = this.processOnObjectChangeElement(event.id, event.obj);
                if (filtered) {
                    return;
                }
                if (newInnerState && newState) {
                    Object.assign(newState, newInnerState);
                } else {
                    newState = newInnerState;
                }
            });

            if (newState) {
                this.setState(newState);
            }
            this.afterObjectUpdated();
        }
    };

    onObjectChange = (id: string, obj?: ioBroker.Object | null): void => {
        const { newInnerState, filtered } = this.processOnObjectChangeElement(id, obj);
        if (filtered) {
            return;
        }

        if (newInnerState) {
            this.setState(newInnerState);
        }
        this.afterObjectUpdated();
    };

    afterObjectUpdated(): void {
        if (!this.objectsUpdateTimer && this.objects) {
            this.objectsUpdateTimer = setTimeout(() => {
                this.objectsUpdateTimer = null;
                const { info, root } = buildTree(this.objects, {
                    imagePrefix: this.props.imagePrefix,
                    root: this.props.root,
                    lang: this.props.lang,
                    themeType: this.props.themeType,
                });
                this.root = root;
                this.info = info;
                if (!this.pausedSubscribes) {
                    this.doFilter();
                } else {
                    // the new tree has no visibility flags yet; re-apply the filter when the dialog is closed
                    this.treeRebuiltWhilePaused = true;
                }
            }, 500);
        }
    }

    // This function is called when the user changes the alias of an object.
    // It updates the aliasMap and returns true if the aliasMap has changed.
    updateAliases(aliasId: string): void {
        if (!this.objects || !this.info?.aliasesMap || !aliasId?.startsWith('alias.')) {
            return;
        }
        // Rebuild aliases map
        const aliasesIds = Object.keys(this.objects).filter(id => id.startsWith('alias.0'));

        this.info.aliasesMap = {};

        for (const id of aliasesIds) {
            const obj = this.objects[id];
            if (obj?.common?.alias?.id) {
                if (typeof obj.common.alias.id === 'string') {
                    const usedId = obj.common.alias.id;
                    if (!this.info.aliasesMap[usedId]) {
                        this.info.aliasesMap[usedId] = [id];
                    } else if (!this.info.aliasesMap[usedId].includes(id)) {
                        this.info.aliasesMap[usedId].push(id);
                    }
                } else {
                    const readId = obj.common.alias.id.read;
                    if (readId) {
                        if (!this.info.aliasesMap[readId]) {
                            this.info.aliasesMap[readId] = [id];
                        } else if (!this.info.aliasesMap[readId].includes(id)) {
                            this.info.aliasesMap[readId].push(id);
                        }
                    }
                    const writeId = obj.common.alias.id.write;
                    if (writeId) {
                        if (!this.info.aliasesMap[writeId]) {
                            this.info.aliasesMap[writeId] = [id];
                        } else if (!this.info.aliasesMap[writeId].includes(id)) {
                            this.info.aliasesMap[writeId].push(id);
                        }
                    }
                }
            }
        }
    }

    /**
     * Processes a single element in regard to certain filters, columns for admin and updates object dict
     *
     * @param id The id of the object
     * @param obj The object itself
     * @returns Returns an object containing the new state (if any) and whether the object was filtered.
     */
    processOnObjectChangeElement(
        id: string,
        obj?: ioBroker.Object | null,
    ): {
        filtered: boolean;
        newInnerState: null | { columnsForAdmin: Record<string, CustomAdminColumnStored[]> | null };
    } {
        // console.log(`> objectChange ${id}`);
        const type = obj?.type;

        // If the object is filtered out, we don't need to update the React state
        if (
            obj &&
            typeof this.props.filterFunc === 'function' &&
            !this.props.filterFunc(obj) &&
            type !== 'channel' &&
            type !== 'device' &&
            type !== 'folder' &&
            type !== 'adapter' &&
            type !== 'instance'
        ) {
            return { newInnerState: null, filtered: true };
        }

        let newInnerState = null;
        if (id.startsWith('system.adapter.') && obj?.type === 'adapter') {
            const columnsForAdmin: Record<string, CustomAdminColumnStored[]> | null = JSON.parse(
                JSON.stringify(this.state.columnsForAdmin),
            );

            this.parseObjectForAdmins(columnsForAdmin, obj);

            if (JSON.stringify(this.state.columnsForAdmin) !== JSON.stringify(columnsForAdmin)) {
                newInnerState = { columnsForAdmin };
            }
        }

        this.objects ||= {};

        if (obj) {
            this.objects[id] = obj;
        } else if (this.objects[id]) {
            delete this.objects[id];
        }

        this.updateAliases(id);

        return { newInnerState, filtered: false };
    }

    subscribe(id: string): void {
        if (!this.subscribes.includes(id)) {
            this.subscribes.push(id);
            // console.log(`+ subscribe ${id}`);
            if (!this.pausedSubscribes) {
                this.props.socket
                    .subscribeState(id, this.onStateChange)
                    .catch(e => console.error(`Cannot subscribe on state ${id}: ${e}`));
            }
        }
    }

    unsubscribe(id: string): void {
        const pos = this.subscribes.indexOf(id);
        if (pos !== -1) {
            this.subscribes.splice(pos, 1);
            if (this.states[id]) {
                delete this.states[id];
            }
            // console.log(`- unsubscribe ${id}`);
            this.props.socket.unsubscribeState(id, this.onStateChange);

            if (this.pausedSubscribes) {
                console.warn('Unsubscribe during pause?');
            }
        }
    }

    pauseSubscribe(isPause: boolean): void {
        if (!this.pausedSubscribes && isPause) {
            this.pausedSubscribes = true;
            this.subscribes.forEach(id => this.props.socket.unsubscribeState(id, this.onStateChange));
        } else if (this.pausedSubscribes && !isPause) {
            this.pausedSubscribes = false;
            this.subscribes.forEach(id => this.props.socket.subscribeState(id, this.onStateChange));
            if (this.treeRebuiltWhilePaused) {
                // without this filter run, no node of the rebuilt tree is marked visible and the browser stays empty
                this.treeRebuiltWhilePaused = false;
                this.doFilter();
            }
        }
    }

    clearFilter(): void {
        if (JSON.stringify(this.state.filter) !== JSON.stringify(DEFAULT_FILTER)) {
            this.setState({ filter: { ...DEFAULT_FILTER }, filterKey: this.state.filterKey + 1 }, () => {
                this.doFilter();
                this.props.onFilterChanged?.({ ...DEFAULT_FILTER });
            });
        }
    }

    isFilterEmpty(): boolean {
        return (
            !!this.state.filter.id ||
            !!this.state.filter.name ||
            !!this.state.filter.room?.length ||
            !!this.state.filter.func?.length ||
            !!this.state.filter.role?.length ||
            !!this.state.filter.type?.length ||
            !!this.state.filter.custom?.length
        );
    }

    onExpandAll(root?: TreeItem, expanded?: string[]): void {
        const _root: TreeItem | null = root || this.root;
        expanded ||= [];

        _root?.children?.forEach((item: TreeItem) => {
            if (item.data.sumVisibility) {
                expanded.push(item.data.id);
                this.onExpandAll(item, expanded);
            }
        });

        if (_root === this.root) {
            expanded.sort();
            this.localStorage.setItem(`${this.props.dialogName || 'App'}.objectExpanded`, JSON.stringify(expanded));

            this.setState({ expanded });
        }
    }

    onCollapseAll(): void {
        this.localStorage.setItem(`${this.props.dialogName || 'App'}.objectExpanded`, JSON.stringify([]));
        this.localStorage.setItem(`${this.props.dialogName || 'App'}.objectSelected`, '[]');
        this.setState({ expanded: [], depth: 0, selected: [] }, () => this.onAfterSelect());
    }

    private expandDepth(root: TreeItem, depth: number, expanded: string[]): void {
        if (!this.root) {
            throw new Error('No root');
        }
        root ||= this.root;
        if (depth > 0) {
            root.children?.forEach(item => {
                if (item.data.sumVisibility) {
                    if (!binarySearch(expanded, item.data.id)) {
                        expanded.push(item.data.id);
                        expanded.sort();
                    }
                    if (depth - 1 > 0) {
                        this.expandDepth(item, depth - 1, expanded);
                    }
                }
            });
        }
    }

    private static collapseDepth(depth: number, expanded: string[]): string[] {
        return expanded.filter(id => id.split('.').length <= depth);
    }

    onExpandVisible(): void {
        if (this.state.depth < 9) {
            const depth = this.state.depth + 1;
            const expanded = [...this.state.expanded];
            if (this.root) {
                this.expandDepth(this.root, depth, expanded);
            }
            this.localStorage.setItem(`${this.props.dialogName || 'App'}.objectExpanded`, JSON.stringify(expanded));
            this.setState({ depth, expanded });
        }
    }

    onStatesViewVisible(): void {
        const statesView = !this.state.statesView;
        this.localStorage.setItem(`${this.props.dialogName || 'App'}.objectStatesView`, JSON.stringify(statesView));
        this.setState({ statesView });
    }

    onCollapseVisible(): void {
        if (this.state.depth > 0) {
            const depth = this.state.depth - 1;
            const expanded = ObjectBrowserClass.collapseDepth(depth, this.state.expanded);
            this.localStorage.setItem(`${this.props.dialogName || 'App'}.objectExpanded`, JSON.stringify(expanded));
            this.setState({ depth, expanded });
        }
    }

    private getEnumsForId = (id: string): ioBroker.EnumObject[] | undefined => {
        const result: ioBroker.EnumObject[] = [];
        this.info.enums.forEach(_id => {
            if (this.objects[_id]?.common?.members?.includes(id)) {
                const enumItem: ioBroker.EnumObject = {
                    _id: this.objects[_id]._id,
                    common: JSON.parse(JSON.stringify(this.objects[_id].common)) as ioBroker.EnumCommon,
                    native: this.objects[_id].native,
                    type: 'enum',
                };
                if (enumItem.common) {
                    delete enumItem.common.members;
                    delete enumItem.common.custom;
                    // @ts-expect-error deprecated attribute
                    delete enumItem.common.mobile;
                }
                result.push(enumItem);
            }
        });

        return result.length ? result : undefined;
    };

    private _createAllEnums = async (enums: (string | ioBroker.EnumObject)[], objId: string): Promise<void> => {
        for (let e = 0; e < enums.length; e++) {
            const item: string | ioBroker.EnumObject = enums[e];
            let id: string;
            let newObj: ioBroker.EnumObject | undefined;

            // some admin version delivered enums as string
            if (typeof item === 'object') {
                newObj = item;
                id = newObj._id;
            } else {
                id = item;
            }

            let oldObj: ioBroker.EnumObject | undefined = this.objects[id] as ioBroker.EnumObject | undefined;
            // if enum does not exist
            if (!oldObj) {
                // create a new one
                oldObj =
                    newObj ||
                    ({
                        _id: id,
                        common: {
                            name: id.split('.').pop(),
                            members: [],
                        },
                        native: {},
                        type: 'enum',
                    } as ioBroker.EnumObject);

                oldObj.common ||= {} as ioBroker.EnumCommon;
                oldObj.common.members = [objId];
                oldObj.type = 'enum';

                await this.props.socket.setObject(id, oldObj);
            } else if (!oldObj.common?.members?.includes(objId)) {
                oldObj.common ||= {} as ioBroker.EnumCommon;
                oldObj.type = 'enum';
                oldObj.common.members ||= [];
                // add the missing object
                oldObj.common.members.push(objId);
                oldObj.common.members.sort();
                await this.props.socket.setObject(id, oldObj);
            }
        }
    };

    private async loadObjects(objs: Record<string, ioBrokerObjectForExport>): Promise<void> {
        if (objs) {
            for (const id in objs) {
                if (!Object.prototype.hasOwnProperty.call(objs, id) || !objs[id]) {
                    continue;
                }
                const obj = objs[id];
                let enums = null;
                let val;
                let ack;
                if (obj?.common?.enums) {
                    enums = obj.common.enums;
                    delete obj.common.enums;
                } else {
                    enums = null;
                }

                if (obj.val || obj.val === 0) {
                    val = obj.val;
                    delete obj.val;
                }
                if (obj.ack !== undefined) {
                    ack = obj.ack;
                    delete obj.ack;
                }
                try {
                    await this.props.socket.setObject(id, obj);
                    if (enums) {
                        await this._createAllEnums(enums, obj._id);
                    }
                    if (obj.type === 'state') {
                        if (val !== undefined && val !== null) {
                            try {
                                await this.props.socket.setState(obj._id, val, ack !== undefined ? ack : true);
                            } catch (e) {
                                window.alert(`Cannot set state "${obj._id} with ${val}": ${e}`);
                            }
                        } else {
                            try {
                                const state = await this.props.socket.getState(obj._id);
                                if (!state || state.val === null) {
                                    try {
                                        await this.props.socket.setState(
                                            obj._id,
                                            !obj.common || obj.common.def === undefined ? null : obj.common.def,
                                            true,
                                        );
                                    } catch (e) {
                                        window.alert(`Cannot set state "${obj._id}": ${e}`);
                                    }
                                }
                            } catch (e) {
                                window.alert(`Cannot read state "${obj._id}": ${e}`);
                            }
                        }
                    }
                } catch (error) {
                    window.alert(error);
                }
            }
        }
    }

    _getSelectedIdsForExport(): string[] {
        if (this.state.selected.length || this.state.selectedNonObject) {
            const result = [];
            const keys = Object.keys(this.objects);
            keys.sort();
            const id = this.state.selected[0] || this.state.selectedNonObject;
            const idDot = `${id}.`;
            const idLen = idDot.length;
            for (let k = 0; k < keys.length; k++) {
                const key = keys[k];
                if (id === key || key.startsWith(idDot)) {
                    result.push(key);
                }
                if (key.substring(0, idLen) > idDot) {
                    break;
                }
            }

            return result;
        }
        return [];
    }

    /**
     * Exports the selected objects based on the given options and triggers file generation
     */
    async _exportObjects(
        /**  Options to filter/reduce the output */
        options: {
            /** Whether all objects should be exported or only the selected ones */
            isAll?: boolean;
            /** Whether the output should be beautified */
            beautify?: boolean;
            /** Whether "system.repositories" should be excluded */
            excludeSystemRepositories?: boolean;
            /** Whether translations should be reduced to only the english value */
            excludeTranslations?: boolean;
            /** Whether the values of the states should be not included */
            noStatesByExportImport?: boolean;
        },
    ): Promise<void> {
        if (options.isAll) {
            generateFile('allObjects.json', this.objects, options);
            return;
        }
        if (!(this.state.selected.length || this.state.selectedNonObject)) {
            window.alert(this.props.t('ra_Save of objects-tree is not possible'));
            return;
        }
        const result: Record<string, ioBrokerObjectForExport> = {};
        const id = this.state.selected[0] || this.state.selectedNonObject;
        const ids = this._getSelectedIdsForExport();

        for (const key of ids) {
            result[key] = JSON.parse(JSON.stringify(this.objects[key])) as ioBrokerObjectForExport;
            // read states values
            if (result[key]?.type === 'state' && !options.noStatesByExportImport) {
                const state = await this.props.socket.getState(key);
                if (state) {
                    result[key].val = state.val;
                    result[key].ack = state.ack;
                }
            }
            // add enum information
            if (result[key].common) {
                const enums = this.getEnumsForId(key);
                if (enums) {
                    result[key].common.enums = enums;
                }
            }
        }

        generateFile(`${id}.json`, result, options);
    }

    renderExportDialog(): JSX.Element | null {
        return dialogs.renderExportDialog(this);
    }

    renderRenameDialog(): JSX.Element | null {
        return dialogs.renderRenameDialog(this);
    }

    async parseJsonFile(contents: string): Promise<void> {
        try {
            const json = JSON.parse(contents);
            const len = Object.keys(json).length;
            const id = json._id;
            // it could be a single object or many objects
            if (id === undefined && len) {
                // many objects
                await this.loadObjects(json as Record<string, ioBrokerObjectForExport>);
                window.alert(this.props.t('ra_%s object(s) processed', len));
            } else {
                // it is only one object in form
                // {
                //    "_id": "xxx",
                //   "common": "yyy",
                //   "native": "zzz"
                //   "val": JSON.stringify(value)
                //   "ack": true
                // }
                if (!id) {
                    return window.alert(this.props.t('ra_Invalid structure'));
                }
                try {
                    let enums;
                    let val;
                    let ack;
                    if (json.common.enums) {
                        enums = json.common.enums;
                        delete json.common.enums;
                    }
                    if (json.val) {
                        val = json.val;
                        delete json.val;
                    }
                    if (json.ack !== undefined) {
                        ack = json.ack;
                        delete json.ack;
                    }
                    await this.props.socket.setObject(json._id, json);

                    if (json.type === 'state') {
                        if (val !== undefined && val !== null) {
                            await this.props.socket.setState(json._id, val, ack === undefined ? true : ack);
                        } else {
                            const state = await this.props.socket.getState(json._id);
                            if (!state || state.val === null || state.val === undefined) {
                                await this.props.socket.setState(
                                    json._id,
                                    json.common.def === undefined ? null : json.common.def,
                                    true,
                                );
                            }
                        }
                    }
                    if (enums) {
                        await this._createAllEnums(enums, json._id);
                    }

                    window.alert(this.props.t('ra_%s was imported', json._id));
                } catch (err) {
                    window.alert(err);
                }
            }
        } catch (err) {
            window.alert(err);
        }
    }
    private handleJsonUpload(evt: Event): void {
        const target = evt.target as HTMLInputElement;
        const f = target.files?.length && target.files[0];
        if (f) {
            const r = new FileReader();
            r.onload = (e): void => {
                this.parseJsonFile(e.target?.result as string).catch(e => console.log(`Cannot parse file: ${e}`));
            };
            r.readAsText(f);
        } else {
            window.alert(this.props.t('ra_Failed to open JSON File'));
        }
    }

    toolTipObjectCreating = (): JSX.Element[] | string => {
        const { t } = this.props;

        let value = [
            <div key={1}>{t('ra_Only following structures of objects are available:')}</div>,
            <div key={2}>{t('ra_Folder → State')}</div>,
            <div key={3}>{t('ra_Folder → Channel → State')}</div>,
            <div key={4}>{t('ra_Folder → Device → Channel → State')}</div>,
            <div key={5}>{t('ra_Device → Channel → State')}</div>,
            <div key={6}>{t('ra_Channel → State')}</div>,
            <div
                key={7}
                style={{ height: 10 }}
            />,
            <div key={8}>{t('ra_Non-experts may create new objects only in "0_userdata.0" or "alias.0".')}</div>,
            <div key={9}>
                {t(
                    'ra_The experts may create objects everywhere but from second level (e.g. "vis.0" or "javascript.0").',
                )}
            </div>,
        ];

        if (this.state.selected.length || this.state.selectedNonObject) {
            const id = this.state.selected[0] || this.state.selectedNonObject;
            if (id.split('.').length < 2 || (this.objects[id] && this.objects[id]?.type === 'state')) {
                // show default tooltip
            } else if (this.state.filter.expertMode) {
                switch (this.objects[id]?.type) {
                    case 'device':
                        value = [
                            <div key={1}>{t('ra_Only following structures of objects are available:')}</div>,
                            <div key={5}>{t('ra_Device → Channel → State')}</div>,
                            <div
                                key={7}
                                style={{ height: 10 }}
                            />,
                            <div key={8}>
                                {t('ra_Non-experts may create new objects only in "0_userdata.0" or "alias.0".')}
                            </div>,
                            <div key={9}>
                                {t(
                                    'ra_The experts may create objects everywhere but from second level (e.g. "vis.0" or "javascript.0").',
                                )}
                            </div>,
                        ];
                        break;
                    case 'folder':
                        value = [
                            <div key={1}>{t('ra_Only following structures of objects are available:')}</div>,
                            <div key={2}>{t('ra_Folder → State')}</div>,
                            <div key={3}>{t('ra_Folder → Channel → State')}</div>,
                            <div key={4}>{t('ra_Folder → Device → Channel → State')}</div>,
                            <div
                                key={7}
                                style={{ height: 10 }}
                            />,
                            <div key={8}>
                                {t('ra_Non-experts may create new objects only in "0_userdata.0" or "alias.0".')}
                            </div>,
                            <div key={9}>
                                {t(
                                    'ra_The experts may create objects everywhere but from second level (e.g. "vis.0" or "javascript.0").',
                                )}
                            </div>,
                        ];
                        break;
                    case 'channel':
                        value = [
                            <div key={1}>{t('ra_Only following structures of objects are available:')}</div>,
                            <div key={1}>{t('ra_Channel → State')}</div>,
                            <div
                                key={7}
                                style={{ height: 10 }}
                            />,
                            <div key={8}>
                                {t('ra_Non-experts may create new objects only in "0_userdata.0" or "alias.0".')}
                            </div>,
                            <div key={9}>
                                {t(
                                    'ra_The experts may create objects everywhere but from second level (e.g. "vis.0" or "javascript.0").',
                                )}
                            </div>,
                        ];
                        break;
                    default:
                        break;
                }
            } else if (id.startsWith('alias.0') || id.startsWith('0_userdata')) {
                value = [
                    <div key={1}>{t('ra_Only following structures of objects are available:')}</div>,
                    <div key={2}>{t('ra_Folder → State')}</div>,
                    <div key={3}>{t('ra_Folder → Channel → State')}</div>,
                    <div key={4}>{t('ra_Folder → Device → Channel → State')}</div>,
                    <div key={5}>{t('ra_Device → Channel → State')}</div>,
                    <div key={6}>{t('ra_Channel → State')}</div>,
                    <div
                        key={7}
                        style={{ height: 10 }}
                    />,
                    <div key={7}>
                        {t('ra_Non-experts may create new objects only in "0_userdata.0" or "alias.0".')}
                    </div>,
                    <div key={8}>
                        {t(
                            'ra_The experts may create objects everywhere but from second level (e.g. "vis.0" or "javascript.0").',
                        )}
                    </div>,
                ];
            }
        }

        return value.length ? value : t('ra_Add new child object to selected parent');
    };

    onOpenFile(): void {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('id', 'files');
        input.setAttribute('opacity', '0');
        input.addEventListener('change', (e: Event) => this.handleJsonUpload(e), false);
        input.click();
    }

    renderInputJsonDialog(): JSX.Element | null {
        return dialogs.renderInputJsonDialog(this);
    }

    /**
     * Renders the toolbar.
     */
    getToolbar(): JSX.Element {
        return toolbar.getToolbar(this);
    }

    toggleExpanded(id: string): void {
        const expanded: string[] = JSON.parse(JSON.stringify(this.state.expanded));
        const pos = expanded.indexOf(id);
        if (pos === -1) {
            expanded.push(id);
            expanded.sort();
        } else {
            expanded.splice(pos, 1);
        }

        this.localStorage.setItem(`${this.props.dialogName || 'App'}.objectExpanded`, JSON.stringify(expanded));

        this.setState({ expanded });
    }

    onCopy(e: React.MouseEvent, text: string | undefined): void {
        e.stopPropagation();
        e.preventDefault();
        if (text) {
            Utils.copyToClipboard(text);
            if (text.length < 50) {
                this.setState({ toast: this.props.t('ra_Copied %s', text) });
            } else {
                this.setState({ toast: this.props.t('ra_Copied') });
            }
        }
    }

    renderTooltipAccessControl(acl: ioBroker.StateACL): null | JSX.Element {
        return leaf.renderTooltipAccessControl(this, acl);
    }

    renderColumnButtons(id: string, item: TreeItem): (JSX.Element | null)[] | JSX.Element | null {
        return leaf.renderColumnButtons(this, id, item);
    }

    getTooltipInfo(id: string, cb?: () => void): void {
        const obj = this.objects[id];
        const state = this.states[id];

        const { valFull, fileViewer } = formatValue({
            state,
            obj: obj as ioBroker.StateObject,
            texts: this.texts,
            dateFormat: this.props.dateFormat || this.systemConfig?.common.dateFormat || DEFAULT_DATE_FORMAT,
            isFloatComma:
                this.props.isFloatComma === undefined
                    ? (this.systemConfig?.common.isFloatComma ?? true)
                    : this.props.isFloatComma,
            full: true,
        });
        const valFullRx: JSX.Element[] = [];

        valFull?.forEach(_item => {
            if (_item.t === this.texts.quality && state.q) {
                valFullRx.push(
                    <div
                        style={styles.cellValueTooltipBoth}
                        key={_item.t}
                    >
                        {_item.t}
                        :&nbsp;
                        {_item.v}
                    </div>,
                );
                // <div style={styles.cellValueTooltipValue} key={item.t + '_v'}>{item.v}</div>,
                if (!_item.nbr) {
                    valFullRx.push(<br key={`${_item.t}_br`} />);
                }
            } else {
                valFullRx.push(
                    <div
                        style={styles.cellValueTooltipTitle}
                        key={_item.t}
                    >
                        {_item.t}
                        :&nbsp;
                    </div>,
                );
                valFullRx.push(
                    <div
                        style={styles.cellValueTooltipValue}
                        key={`${_item.t}_v`}
                    >
                        {_item.v}
                    </div>,
                );
                if (!_item.nbr) {
                    valFullRx.push(<br key={`${_item.t}_br`} />);
                }
            }
        });
        const role = obj?.common?.role || '';

        if (fileViewer === 'image') {
            valFullRx.push(
                <img
                    style={styles.cellValueTooltipImage}
                    src={state.val as string}
                    alt={id}
                />,
            );
        } else if (role === 'url' || role === 'url.self' || role === 'url.blank') {
            // Show comment about "Hold Ctrl/⌘ key to open the link"
            valFullRx.unshift(
                <div
                    key="ctrl"
                    style={{ textDecoration: 'underline', fontWeight: 'bold' }}
                >
                    {this.texts.ctrlForLink}
                </div>,
            );
        } else if (this.defaultHistory && obj?.common?.custom?.[this.defaultHistory]) {
            const isNumber = typeof state?.val === 'number';
            const isBoolean = obj.common.type === 'boolean' || typeof state?.val === 'boolean';
            valFullRx.push(
                <HistoryChart
                    key="chart"
                    socket={this.props.socket}
                    id={id}
                    instance={this.defaultHistory}
                    t={this.props.t}
                    isBoolean={isBoolean}
                    isFloatComma={
                        this.props.isFloatComma === undefined
                            ? (this.systemConfig?.common.isFloatComma ?? true)
                            : this.props.isFloatComma
                    }
                    current={
                        isNumber || isBoolean
                            ? { ts: state.ts, val: typeof state.val === 'boolean' ? +state.val : (state.val as number) }
                            : null
                    }
                />,
            );
        }

        this.setState({ tooltipInfo: { el: valFullRx, id } }, () => cb && cb());
    }

    private _syncEnum(id: string, enumIds: string[], newArray: string[], cb: () => void): void {
        if (!enumIds?.length) {
            if (cb) {
                cb();
            }
            return;
        }
        const enumId = enumIds.pop() || '';
        const promises = [];
        if (this.info.objects[enumId]?.common) {
            if (this.info.objects[enumId].common.members?.length) {
                const pos = this.info.objects[enumId].common.members.indexOf(id);
                if (pos !== -1 && !newArray.includes(enumId)) {
                    // delete it from members
                    const obj: ioBroker.Object = JSON.parse(JSON.stringify(this.info.objects[enumId]));
                    obj.common.members.splice(pos, 1);
                    promises.push(
                        this.props.socket
                            .setObject(enumId, obj)
                            .then(() => (this.info.objects[enumId] = obj))
                            .catch(e => this.showError(e)),
                    );
                }
            }

            // add to it
            if (newArray.includes(enumId) && !this.info.objects[enumId].common.members?.includes(id)) {
                // add to object
                const obj: ioBroker.Object = JSON.parse(JSON.stringify(this.info.objects[enumId]));
                obj.common.members ||= [];
                obj.common.members.push(id);
                obj.common.members.sort();
                promises.push(
                    this.props.socket
                        .setObject(enumId, obj)
                        .then(() => (this.info.objects[enumId] = obj))
                        .catch(e => this.showError(e)),
                );
            }
        }

        void Promise.all(promises).then(() => {
            setTimeout(() => this._syncEnum(id, enumIds, newArray, cb), 0);
        });
    }

    syncEnum(id: string, enumName: 'func' | 'room', newArray: string[]): Promise<void> {
        const toCheck = [...this.info[enumName === 'func' ? 'funcEnums' : 'roomEnums']];

        return new Promise<void>(resolve => {
            this._syncEnum(id, toCheck, newArray, () => {
                // force update of an object
                resolve();
            });
        });
    }

    onColumnsEditCustomDialogClose(isSave?: boolean): void {
        // cannot be null
        const customColumnDialog: {
            value: boolean | number | string;
            type: 'boolean' | 'number' | 'string';
            initValue: boolean | number | string;
        } = this.customColumnDialog as {
            value: boolean | number | string;
            type: 'boolean' | 'number' | 'string';
            initValue: boolean | number | string;
        };

        if (isSave) {
            let value: string | number | boolean = customColumnDialog.value;
            if (customColumnDialog.type === 'boolean') {
                value = value === 'true' || value === true;
            } else if (customColumnDialog.type === 'number') {
                value = parseFloat(value as any as string);
            }
            const it = this.state.columnsEditCustomDialog?.it;
            this.customColumnDialog = null;
            this.props.socket
                .getObject(this.state.columnsEditCustomDialog?.obj?._id || '')
                .then(obj => {
                    if (obj && it && setCustomValue(obj, it, value)) {
                        return this.props.socket.setObject(obj._id, obj);
                    }
                    throw new Error(this.props.t('ra_Cannot update attribute, because not found in the object'));
                })
                .then(() => this.setState({ columnsEditCustomDialog: null }))
                .catch(e => this.showError(e));
        } else {
            this.customColumnDialog = null;
            this.setState({ columnsEditCustomDialog: null });
        }
    }

    /**
     * Renders a custom value.
     */
    renderCustomValue(obj: ioBroker.Object, it: AdapterColumn, item: TreeItem): JSX.Element | null {
        return leaf.renderCustomValue(this, obj, it, item);
    }

    renderAliasLink(id: string, index?: number, customStyle?: Record<string, any>): JSX.Element | null {
        return leaf.renderAliasLink(this, id, index, customStyle);
    }

    /**
     * Renders one row of the table.
     */
    renderLeaf(
        item: TreeItem,
        isExpanded: boolean | undefined,
        counter: { count: number },
    ): { row: JSX.Element; details: JSX.Element | null } {
        return leaf.renderLeaf(this, item, isExpanded, counter);
    }

    /**
     * Renders an item.
     */
    renderItem(root: TreeItem, isExpanded: boolean | undefined, counter?: { count: number }): (JSX.Element | null)[] {
        return leaf.renderItem(this, root, isExpanded, counter);
    }

    calculateColumnsVisibility(
        aColumnsAuto?: boolean | null,
        aColumns?: string[] | null,
        aColumnsForAdmin?: Record<string, CustomAdminColumnStored[]> | null,
        aColumnsWidths?: Record<string, number>,
    ): void {
        let columnsWidths: Record<string, number> = aColumnsWidths || this.state.columnsWidths;
        const columnsForAdmin: Record<string, CustomAdminColumnStored[]> | null =
            aColumnsForAdmin || this.state.columnsForAdmin;
        const columns: string[] = aColumns || this.state.columns || [];
        const columnsAuto: boolean = typeof aColumnsAuto !== 'boolean' ? this.state.columnsAuto : aColumnsAuto;

        columnsWidths = JSON.parse(JSON.stringify(columnsWidths));
        Object.keys(columnsWidths).forEach(name => {
            if (columnsWidths[name]) {
                columnsWidths[name] = parseInt(columnsWidths[name] as any as string, 10) || 0;
            }
        });

        this.adapterColumns = [];

        // In the auto mode the visible columns depend on the width of the container
        if (!this.props.columns) {
            this.visibleCols = [...this.screenWidths[this.width].fields];
            // remove type column if only one type must be selected
            if (this.props.types && this.props.types.length === 1) {
                const pos = this.visibleCols.indexOf('type');
                if (pos !== -1) {
                    this.visibleCols.splice(pos, 1);
                }
            }
        }

        const WIDTHS = this.screenWidths[this.width].widths;

        if (columnsAuto) {
            this.columnsVisibility = {
                id: this.screenWidths[this.width || 'lg'].idWidth,
                name: this.visibleCols.includes('name') ? WIDTHS.name || 0 : 0,
                type: this.visibleCols.includes('type') ? WIDTHS.type || 0 : 0,
                role: this.visibleCols.includes('role') ? WIDTHS.role || 0 : 0,
                room: this.visibleCols.includes('room') ? WIDTHS.room || 0 : 0,
                func: this.visibleCols.includes('func') ? WIDTHS.func || 0 : 0,
                changedFrom: this.visibleCols.includes('changedFrom') ? WIDTHS.changedFrom || 0 : 0,
                qualityCode: this.visibleCols.includes('qualityCode') ? WIDTHS.qualityCode || 0 : 0,
                timestamp: this.visibleCols.includes('timestamp') ? WIDTHS.timestamp || 0 : 0,
                lastChange: this.visibleCols.includes('lastChange') ? WIDTHS.lastChange || 0 : 0,
                val: this.visibleCols.includes('val') ? WIDTHS.val || 0 : 0,
                buttons: this.visibleCols.includes('buttons') ? WIDTHS.buttons || 0 : 0,
            };

            // in xs name is not visible
            if (this.columnsVisibility.name && !this.customWidth) {
                let widthSum: number = (this.columnsVisibility.id as number) || 0; // id is always visible
                if (this.state.statesView) {
                    widthSum += this.columnsVisibility.changedFrom || 0;
                    widthSum += this.columnsVisibility.qualityCode || 0;
                    widthSum += this.columnsVisibility.timestamp || 0;
                    widthSum += this.columnsVisibility.lastChange || 0;
                } else {
                    widthSum += this.columnsVisibility.type || 0;
                    widthSum += this.columnsVisibility.role || 0;
                    widthSum += this.columnsVisibility.room || 0;
                    widthSum += this.columnsVisibility.func || 0;
                }
                widthSum += this.columnsVisibility.val || 0;
                widthSum += this.columnsVisibility.buttons || 0;
                this.columnsVisibility.name = `calc(100% - ${widthSum + 5}px)`;
            } else if (!this.customWidth) {
                // Calculate the width of ID
                let widthSum = 0; // id is always visible
                if (this.state.statesView) {
                    widthSum += this.columnsVisibility.changedFrom || 0;
                    widthSum += this.columnsVisibility.qualityCode || 0;
                    widthSum += this.columnsVisibility.timestamp || 0;
                    widthSum += this.columnsVisibility.lastChange || 0;
                } else {
                    widthSum += this.columnsVisibility.type || 0;
                    widthSum += this.columnsVisibility.role || 0;
                    widthSum += this.columnsVisibility.room || 0;
                    widthSum += this.columnsVisibility.func || 0;
                }
                widthSum += this.columnsVisibility.val || 0;
                widthSum += this.columnsVisibility.buttons || 0;
                this.columnsVisibility.id = `calc(100% - ${widthSum + 5}px)`;
            }
        } else {
            const width = this.width || 'lg';
            this.columnsVisibility = {
                id: columnsWidths.id || this.screenWidths[width].idWidth,
                name: columns.includes('name')
                    ? columnsWidths.name || WIDTHS.name || this.screenWidths[width].widths.name || 0
                    : 0,
                type: columns.includes('type')
                    ? columnsWidths.type || WIDTHS.type || this.screenWidths[width].widths.type || 0
                    : 0,
                role: columns.includes('role')
                    ? columnsWidths.role || WIDTHS.role || this.screenWidths[width].widths.role || 0
                    : 0,
                room: columns.includes('room')
                    ? columnsWidths.room || WIDTHS.room || this.screenWidths[width].widths.room || 0
                    : 0,
                func: columns.includes('func')
                    ? columnsWidths.func || WIDTHS.func || this.screenWidths[width].widths.func || 0
                    : 0,
            };
            let widthSum: number = this.columnsVisibility.id as number; // id is always visible
            if (this.columnsVisibility.name) {
                widthSum += this.columnsVisibility.type || 0;
                widthSum += this.columnsVisibility.role || 0;
                widthSum += this.columnsVisibility.room || 0;
                widthSum += this.columnsVisibility.func || 0;
            }

            if (columnsForAdmin && columns) {
                Object.keys(columnsForAdmin)
                    .sort()
                    .forEach(adapter =>
                        columnsForAdmin[adapter].forEach(column => {
                            const id = `_${adapter}_${column.path}`;
                            if (columns.includes(id)) {
                                const item: AdapterColumn = {
                                    adapter,
                                    id: `_${adapter}_${column.path}`,
                                    name: column.name,
                                    path: column.path.split('.'),
                                    pathText: column.path,
                                };
                                if (column.edit) {
                                    item.edit = true;
                                    if (column.type) {
                                        item.type = column.type as 'number' | 'boolean' | 'string';
                                    }
                                    if (column.objTypes) {
                                        item.objTypes = column.objTypes;
                                    }
                                }

                                this.adapterColumns.push(item);
                                (this.columnsVisibility as Record<string, number>)[id] =
                                    columnsWidths[item.id] ||
                                    column.width ||
                                    this.screenWidths[width].widths.func ||
                                    this.screenWidths.xl.widths.func ||
                                    0;
                                widthSum += (this.columnsVisibility as Record<string, number>)[id];
                            } else {
                                (this.columnsVisibility as Record<string, number>)[id] = 0;
                            }
                        }),
                    );
            }
            this.adapterColumns.sort((a, b) => (a.id > b.id ? -1 : a.id < b.id ? 1 : 0));
            this.columnsVisibility.val = columns.includes('val')
                ? columnsWidths.val || WIDTHS.val || this.screenWidths.xl.widths.val
                : 0;

            // do not show buttons if not desired
            if (!this.props.columns || this.props.columns.includes('buttons')) {
                this.columnsVisibility.buttons = columns.includes('buttons')
                    ? columnsWidths.buttons || WIDTHS.buttons || this.screenWidths.xl.widths.buttons
                    : 0;
                widthSum += this.columnsVisibility.buttons || 0;
            }

            if (this.columnsVisibility.name && !columnsWidths.name) {
                widthSum += this.columnsVisibility.val || 0;
                this.columnsVisibility.name = `calc(100% - ${widthSum}px)`;
            } else {
                const newWidth = Object.keys(this.columnsVisibility).reduce((accumulator: number, name: string) => {
                    // do not summarize strings
                    if (
                        name === 'id' ||
                        typeof (this.columnsVisibility as Record<string, number | string>)[name] === 'string' ||
                        !(this.columnsVisibility as Record<string, number | string>)[name]
                    ) {
                        return accumulator;
                    }
                    return accumulator + (this.columnsVisibility as Record<string, number>)[name];
                }, 0);
                this.columnsVisibility.id = `calc(100% - ${newWidth}px)`;
            }
        }
    }

    /**
     * The width class of the object browser. It is measured from the container and not from the
     * window, so the browser shows the right columns if it is used in a narrow panel or dialog too.
     * `props.width` overwrites the measured value.
     */
    get width(): Width {
        return this.props.width || this.state.containerWidth;
    }

    /** Watch the width of the table container to detect the width class (see `width`) */
    observeContainerWidth(): void {
        const container = this.tableRef.current;
        if (!container || this.observedContainer === container) {
            return;
        }
        this.resizeObserver?.disconnect();
        this.observedContainer = container;
        this.resizeObserver = new ResizeObserver(entries => this.setContainerWidth(entries[0].contentRect.width));
        this.resizeObserver.observe(container);
        // measure immediately, so the first render after mounting shows the right columns
        this.setContainerWidth(container.clientWidth);
    }

    /** Store the width class of the container if it changed */
    setContainerWidth(containerWidth: number): void {
        const width = widthFromContainer(containerWidth, this.props.theme);
        if (width !== this.state.containerWidth) {
            // the columns are recalculated in `render`, as soon as the width class changed
            this.setState({ containerWidth: width });
        }
    }

    /**
     * All column widths as CSS variables of the table container. The header and every row read the
     * widths from here (see `colWidth`), so they can never get out of sync, and the resizer can
     * change a width by writing one variable instead of re-rendering all rows.
     */
    getColumnWidthVariables(): React.CSSProperties {
        const variables: Record<string, string> = {};
        Object.keys(this.columnsVisibility).forEach(name => {
            const width = (this.columnsVisibility as Record<string, number | string | undefined>)[name];
            if (typeof width === 'string') {
                // `calc(100% - 500px)`: this column takes the remaining place. A percentage cannot be
                // used here, because the width of the row depends on the columns and would be
                // circular - the column grows instead and keeps its minimal width if the place is
                // not sufficient (then the table scrolls horizontally).
                // `100%` (mobile view) must not reserve any place, `calc(100% - 500px)` keeps a minimum
                variables[colVar(name)] = width === '100%' ? '0px' : `${MIN_COLUMN_WIDTHS[name] || 100}px`;
                variables[growVar(name)] = '1';
            } else {
                variables[colVar(name)] = `${width || 0}px`;
                variables[growVar(name)] = '0';
            }
        });
        return variables;
    }

    /** Set the width of one column without re-rendering the rows */
    setColumnWidth(name: string, width: number): void {
        (this.columnsVisibility as Record<string, number | string>)[name] = width;
        this.tableRef.current?.style.setProperty(colVar(name), `${width}px`);
    }

    resizerMouseMove = (e: MouseEvent): void => {
        if (this.resizerActiveDiv) {
            let width: number;
            let widthNext: number;
            if (this.resizeLeft) {
                width = this.resizerOldWidth - e.clientX + this.resizerPosition;
                widthNext = this.resizerOldWidthNext + e.clientX - this.resizerPosition;
            } else {
                width = this.resizerOldWidth + e.clientX - this.resizerPosition;
                widthNext = this.resizerOldWidthNext - e.clientX + this.resizerPosition;
            }

            if (
                this.resizerActiveName &&
                this.resizerNextName &&
                (!this.resizerMin || width > this.resizerMin) &&
                (!this.resizerNextMin || widthNext > this.resizerNextMin)
            ) {
                this.resizerCurrentWidths[this.resizerActiveName] = width;
                this.resizerCurrentWidths[this.resizerNextName] = widthNext;

                // Only two CSS variables are written - the header and all rows follow immediately,
                // without a re-render of the table
                this.setColumnWidth(this.resizerActiveName, width);
                this.setColumnWidth(this.resizerNextName, widthNext);

                this.customWidth = true;
            }
        }
    };

    resizerMouseUp = (): void => {
        this.localStorage.setItem(`${this.props.dialogName || 'App'}.table`, JSON.stringify(this.resizerCurrentWidths));
        this.resizerActiveName = null;
        this.resizerNextName = null;
        this.resizerActiveDiv = null;
        this.resizerNextDiv = null;
        window.removeEventListener('mousemove', this.resizerMouseMove);
        window.removeEventListener('mouseup', this.resizerMouseUp);
    };

    resizerMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
        this.storedWidths ||= JSON.parse(JSON.stringify(this.screenWidths[this.width || 'lg'])) as ScreenWidthOne;

        this.resizerCurrentWidths ||= {};
        this.resizerActiveDiv = (e.target as HTMLDivElement).parentNode as HTMLDivElement;
        this.resizerActiveName = this.resizerActiveDiv.dataset.name || null;
        if (this.resizerActiveName) {
            let i = 0;
            if ((e.target as HTMLDivElement).dataset.left === 'true') {
                this.resizeLeft = true;
                this.resizerNextDiv = this.resizerActiveDiv.previousElementSibling as HTMLDivElement;
                let handle: HTMLDivElement | null = this.resizerNextDiv.querySelector('.iob-ob-resize-handler');
                while (this.resizerNextDiv && !handle && i < 10) {
                    this.resizerNextDiv = this.resizerNextDiv.previousElementSibling as HTMLDivElement;
                    handle = this.resizerNextDiv.querySelector('.iob-ob-resize-handler');
                    i++;
                }
                if (handle?.dataset.left !== 'true') {
                    this.resizerNextDiv = this.resizerNextDiv.nextElementSibling as HTMLDivElement;
                }
            } else {
                this.resizeLeft = false;
                this.resizerNextDiv = this.resizerActiveDiv.nextElementSibling as HTMLDivElement;
                /* while (this.resizerNextDiv && !this.resizerNextDiv.querySelector('.iob-ob-resize-handler') && i < 10) {
                    this.resizerNextDiv = this.resizerNextDiv.nextElementSibling;
                    i++;
                } */
            }
            this.resizerNextName = this.resizerNextDiv.dataset.name || null;

            this.resizerMin = parseInt(this.resizerActiveDiv.dataset.min as string, 10) || 0;
            this.resizerNextMin = parseInt(this.resizerNextDiv.dataset.min as string, 10) || 0;

            this.resizerPosition = e.clientX;

            this.resizerCurrentWidths[this.resizerActiveName] = this.resizerActiveDiv.offsetWidth;
            this.resizerOldWidth = this.resizerCurrentWidths[this.resizerActiveName];

            if (this.resizerNextName) {
                this.resizerCurrentWidths[this.resizerNextName] = this.resizerNextDiv.offsetWidth;
                this.resizerOldWidthNext = this.resizerCurrentWidths[this.resizerNextName];
            }

            window.addEventListener('mousemove', this.resizerMouseMove);
            window.addEventListener('mouseup', this.resizerMouseUp);
        }
    };

    /**
     * Handle keyboard events for navigation
     */
    navigateKeyPress(event: React.KeyboardEvent): void {
        const selectedId = this.state.selectedNonObject || this.state.selected[0];

        if (!selectedId) {
            return;
        }

        if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
            event.preventDefault();
            const ids: string[] = [];
            // the first child is the header, it has no ID
            this.tableRef.current?.childNodes.forEach((node: any) => {
                const nodeId = (node as HTMLDivElement).id;
                if (nodeId) {
                    ids.push(nodeId);
                }
            });
            const idx = ids.indexOf(selectedId);
            const newIdx = event.code === 'ArrowDown' ? idx + 1 : idx - 1;
            const newId = ids[newIdx] || selectedId;
            this.onSelect(newId);
            this.scrollToItem(newId);
        }

        if (event.code === 'ArrowRight' || event.code === 'ArrowLeft') {
            this.toggleExpanded(selectedId);
        }

        if (event.code === 'Delete' && this.root && selectedId) {
            const item = ObjectBrowserClass.getItemFromRoot(this.root, selectedId);
            if (item) {
                const { obj } = item.data;
                if (obj && !obj.common?.dontDelete) {
                    this.showDeleteDialog({ id: selectedId, obj, item });
                }
            }
        }
    }

    /**
     * Find the id from the root
     *
     * @param root The current root
     * @param id The object id to find
     */
    private static getItemFromRoot(root: TreeItem, id: string): TreeItem | null {
        const idArr = id.split('.');
        let currId = '';
        let _root: TreeItem | null | undefined = root;

        for (let i = 0; i < idArr.length; i++) {
            const idEntry = idArr[i];
            currId = currId ? `${currId}.${idEntry}` : idEntry;
            let found = false;
            if (_root.children) {
                for (let j = 0; j < _root.children.length; j++) {
                    if (_root.children[j].data.id === currId) {
                        _root = _root.children[j];
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                return null;
            }
        }

        return _root || null;
    }

    resizerReset = (): void => {
        this.customWidth = false;
        this.screenWidths[this.width || 'lg'] = JSON.parse(JSON.stringify(this.storedWidths));
        this.calculateColumnsVisibility();
        this.localStorage.removeItem(`${this.props.dialogName || 'App'}.table`);
        this.forceUpdate();
    };

    /**
     * Render the right handle for resizing
     */
    renderHandleRight(): JSX.Element {
        return toolbar.renderHandleRight(this);
    }

    // --- Routing (navigateTo / onNavigateTo) ---
    // The browser never reads the URL itself; the parent drives it via `navigateTo` and is informed
    // of user navigation via `onNavigateTo`. All URL parsing/writing lives in the parent component.

    /** Derive the current navigation target from the dialog/selection state. */
    private getStateNav(): ObjectBrowserNavigation | null {
        if (this.state.editObjectDialog) {
            return { mode: 'edit', id: this.state.editObjectDialog };
        }
        if (this.state.customDialog && this.state.customDialog.length === 1 && !this.state.customDialogAll) {
            return { mode: 'settings', id: this.state.customDialog[0] };
        }
        if (this.state.viewFileDialog) {
            return { mode: 'viewFile', id: this.state.viewFileDialog };
        }
        if (this.state.selected.length === 1 && this.state.selected[0]) {
            return { mode: 'select', id: this.state.selected[0] };
        }
        return null;
    }

    private static navEqual(a: ObjectBrowserNavigation | null, b: ObjectBrowserNavigation | null): boolean {
        if (!a || !b) {
            return !a && !b;
        }
        return a.mode === b.mode && a.id === b.id;
    }

    /** Apply a navigation target coming from the parent (`navigateTo`): select + open the dialog. */
    private applyNavigateTo(nav: ObjectBrowserNavigation | null): void {
        this.applyingNav = true;
        const done = (): void => {
            this.applyingNav = false;
        };
        if (!nav?.id) {
            // No target: just close any open dialog (keep the current selection).
            this.setState({ editObjectDialog: '', customDialog: null, viewFileDialog: '' }, done);
            return;
        }
        const { id } = nav;
        const open = (): void => {
            if (nav.mode === 'edit') {
                this.setState(
                    { editObjectDialog: id, editObjectAlias: false, customDialog: null, viewFileDialog: '' },
                    done,
                );
            } else if (nav.mode === 'settings') {
                this.setState(
                    { customDialog: [id], customDialogAll: false, editObjectDialog: '', viewFileDialog: '' },
                    done,
                );
            } else if (nav.mode === 'viewFile') {
                this.setState({ viewFileDialog: id, editObjectDialog: '', customDialog: null }, done);
            } else {
                this.setState({ editObjectDialog: '', customDialog: null, viewFileDialog: '' }, done);
            }
        };
        // Select the target (if needed), expand to it and scroll into view, then open the dialog.
        if (this.state.selected.length === 1 && this.state.selected[0] === id) {
            open();
        } else {
            this.onSelect(id, false, () =>
                this.expandAllSelected(() => {
                    this.scrollToItem(id);
                    open();
                }),
            );
        }
    }

    /** Apply the initial `navigateTo` after the tree has loaded (called from componentDidMount). */
    private applyInitialNavigateTo(): void {
        const nav = this.props.navigateTo ?? null;
        if (nav?.id) {
            this.lastNav = nav;
            this.applyNavigateTo(nav);
        } else {
            // Don't push the restored-from-localStorage selection into the URL on load.
            this.lastNav = this.getStateNav();
        }
    }

    /** Reconcile `navigateTo` (parent/URL) with the browser's selection/dialog state. */
    private reconcileNavigation(prevProps: ObjectBrowserProps): void {
        if (this.props.navigateTo === undefined && !this.props.onNavigateTo) {
            return; // routing not used by this consumer
        }
        if (this.applyingNav) {
            return; // currently applying a target; ignore the intermediate state
        }
        const propNav = this.props.navigateTo ?? null;
        const stateNav = this.getStateNav();
        if (ObjectBrowserClass.navEqual(propNav, stateNav)) {
            this.lastNav = stateNav;
            return;
        }
        if (!ObjectBrowserClass.navEqual(propNav, prevProps.navigateTo ?? null)) {
            // The parent (URL) drove a change → apply it to the browser.
            this.lastNav = propNav;
            this.applyNavigateTo(propNav);
        } else if (!ObjectBrowserClass.navEqual(stateNav, this.lastNav)) {
            // The user changed selection/dialog → report it so the parent can update the URL.
            this.lastNav = stateNav;
            this.props.onNavigateTo?.(stateNav);
        }
    }

    /**
     * Called when component is updated.
     */
    componentDidUpdate(prevProps: ObjectBrowserProps): void {
        // the table is rendered only after the objects are loaded
        this.observeContainerWidth();

        if (this.tableRef.current && this.selectFirst) {
            this.scrollToItem(this.selectFirst);
        }
        this.reconcileNavigation(prevProps);
    }

    scrollToItem(id: string): void {
        this.selectFirst = '';

        const node = window.document.getElementById(id);
        node?.scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'center',
        });
    }

    onUpdate(valAck: {
        val: ioBroker.StateValue;
        ack: boolean;
        q: ioBroker.STATE_QUALITY[keyof ioBroker.STATE_QUALITY];
        expire: number | undefined;
    }): void {
        this.props.socket
            .setState(this.edit.id, {
                val: valAck.val,
                ack: valAck.ack,
                q: valAck.q || 0,
                expire: valAck.expire || undefined,
            })
            .catch(e => this.showError(`Cannot write value: ${e}`));
    }

    showAddDataPointDialog(id: string, initialType: ioBroker.ObjectType, initialStateType?: ioBroker.CommonType): void {
        this.setState({
            showContextMenu: null,
            modalNewObj: {
                id,
                initialType,
                initialStateType,
            },
        });
    }

    /** Renders the aliases list for one state (if more than 2) */

    doFilter(doNotStore?: boolean): void {
        if (!this.objects || !this.root) {
            return;
        }

        if (!doNotStore) {
            this.localStorage.setItem(
                `${this.props.dialogName || 'App'}.objectFilter`,
                JSON.stringify(this.state.filter),
            );
        }

        const counter = { count: 0 };

        applyFilter(
            this.root,
            this.state.filter,
            this.props.lang,
            this.objects,
            undefined,
            counter,
            this.props.customFilter,
            this.props.types,
        );

        if (counter.count < 500 && !this.state.expandAllVisible) {
            setTimeout(() => this.setState({ expandAllVisible: true }));
        } else if (counter.count >= 500 && this.state.expandAllVisible) {
            setTimeout(() => this.setState({ expandAllVisible: false }));
        } else {
            this.forceUpdate();
        }
    }

    /**
     * The rendering method of this component.
     */
    render(): JSX.Element {
        this.recordStates = [];
        if (this.unsubscribeTimer) {
            clearTimeout(this.unsubscribeTimer);
        }

        if (this.styleTheme !== this.props.themeType) {
            this.styles = {
                cellIdIconFolder: Utils.getStyle(this.props.theme, styles.cellIdIconFolder),
                cellIdIconDocument: Utils.getStyle(this.props.theme, styles.cellIdIconDocument),
                iconDeviceError: Utils.getStyle(this.props.theme, styles.iconDeviceError),
                iconDeviceConnected: Utils.getStyle(this.props.theme, styles.iconDeviceConnected),
                iconDeviceDisconnected: Utils.getStyle(this.props.theme, styles.iconDeviceDisconnected),
                cellButtonsButtonWithCustoms: Utils.getStyle(this.props.theme, styles.cellButtonsButtonWithCustoms),
                invertedBackground: Utils.getStyle(this.props.theme, styles.invertedBackground),
                invertedBackgroundFlex: Utils.getStyle(this.props.theme, styles.invertedBackgroundFlex),
                contextMenuEdit: Utils.getStyle(this.props.theme, styles.contextMenuEdit),
                contextMenuEditValue: Utils.getStyle(this.props.theme, styles.contextMenuEditValue),
                contextMenuView: Utils.getStyle(this.props.theme, styles.contextMenuView),
                contextMenuCustom: Utils.getStyle(this.props.theme, styles.contextMenuCustom),
                contextMenuACL: Utils.getStyle(this.props.theme, styles.contextMenuACL),
                contextMenuRoom: Utils.getStyle(this.props.theme, styles.contextMenuRoom),
                contextMenuRole: Utils.getStyle(this.props.theme, styles.contextMenuRole),
                contextMenuDelete: Utils.getStyle(this.props.theme, styles.contextMenuDelete),
                filterInput: Utils.getStyle(this.props.theme, styles.headerCellInput, styles.filterInput),
                iconCopy: Utils.getStyle(
                    this.props.theme,
                    styles.cellButtonsValueButton,
                    styles.cellButtonsValueButtonCopy,
                ),
                aliasReadWrite: Utils.getStyle(this.props.theme, styles.cellIdAlias, styles.cellIdAliasReadWrite),
                aliasAlone: Utils.getStyle(this.props.theme, styles.cellIdAlias, styles.cellIdAliasAlone),
            };
            this.styleTheme = this.props.themeType;
        }

        this.unsubscribeTimer = setTimeout(() => {
            this.unsubscribeTimer = null;
            this.checkUnsubscribes();
        }, 200);

        if (this.expertMode !== !!this.state.filter.expertMode) {
            this.expertMode = !!this.state.filter.expertMode;
            this.doFilter(true);
        }

        if (!this.state.loaded) {
            return <LinearProgress key={`${this.props.dialogName}_c`} />;
        }

        // the container was resized into another width class => other columns are visible
        if (this.lastCalculatedWidth !== this.width) {
            this.lastCalculatedWidth = this.width;
            this.calculateColumnsVisibility();
        }

        const items = this.root ? this.renderItem(this.root, undefined) : null;

        return (
            <TabContainer
                key={this.props.dialogName}
                styles={{ root: this.props.style }}
            >
                <style>
                    {`
@keyframes newValueAnimation-light {
    0% {
        color: #00f900;
    }
    80% {
        color: #008000;
    }
    100% {
        color: #000;
    }
}
@keyframes newValueAnimation-dark {
    0% {
        color: #00f900;
    }
    80% {
        color: #008000;
    }
    100% {
        color: #fff;
    }
}
.newValueBrowser-dark {
    animation: newValueAnimation-dark 2s ease-in-out;
}
.newValueBrowser-light {
    animation: newValueAnimation-light 2s ease-in-out;
}
.highlight-link .iob-link {
    text-decoration: underline;
    cursor: pointer;
}
`}
                </style>
                <TabHeader>{this.getToolbar()}</TabHeader>
                <TabContent>
                    {/* The header is a part of the scrolling container and sticks to its top, so it is
                        always aligned with the rows and does not need to be synchronized with them. */}
                    <Box
                        style={{ ...styles.tableDiv, ...this.getColumnWidthVariables() }}
                        ref={this.tableRef}
                        onKeyDown={event => this.navigateKeyPress(event)}
                    >
                        {toolbar.renderHeader(this)}
                        {items}
                    </Box>
                </TabContent>
                {contextMenu.renderContextMenu(this)}
                {dialogs.renderAliasMenu(this)}
                {dialogs.renderToast(this)}
                {dialogs.renderColumnsEditCustomDialog(this)}
                {this.renderColumnsSelectorDialog()}
                {dialogs.renderCustomDialog(this)}
                {dialogs.renderEditValueDialog(this)}
                {dialogs.renderEditObjectDialog(this)}
                {dialogs.renderViewObjectFileDialog(this)}
                {dialogs.renderAliasEditorDialog(this)}
                {dialogs.renderEditRoleDialog(this)}
                {dialogs.renderEnumDialog(this)}
                {this.renderErrorDialog()}
                {this.renderExportDialog()}
                {this.renderRenameDialog()}
                {this.renderInputJsonDialog()}
                {this.state.modalNewObj && this.props.modalNewObject && this.props.modalNewObject(this)}
                {this.state.modalEditOfAccess &&
                    this.state.modalEditOfAccessObjData &&
                    this.props.modalEditOfAccessControl &&
                    this.props.modalEditOfAccessControl(this, this.state.modalEditOfAccessObjData)}
            </TabContainer>
        );
    }
}

// The width class is measured from the container (see `ObjectBrowserClass.width`), so this component
// does not need the `withWidth` HOC (which measures the window) anymore.
export const ObjectBrowser = ObjectBrowserClass;
