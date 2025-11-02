import React, { Component, type JSX } from 'react';

import { Box, FormControl, IconButton, Input, MenuItem, Select } from '@mui/material';
import SVG from 'react-inlinesvg';

import {
    Description as IconMeta,
    PersonOutlined as IconUser,
    Router as IconHost,
    SupervisedUserCircle as IconGroup,
    SettingsApplications as IconSystem,
    DataObject as IconData,
    Info as IconInfo,
    Link as IconLink,
    Close as IconClose,
    Wifi as IconConnection,
} from '@mui/icons-material';
import type { ThemeType } from '../types';
import { Utils } from './Utils';
import type {
    FormatValueOptions,
    InputSelectItem,
    TreeItem,
    ObjectBrowserCustomFilter,
    TreeInfo,
    GetValueStyleOptions,
    AdapterColumn,
    ObjectBrowserFilter,
    TreeItemData,
} from './objectBrowser.types';

export const ICON_SIZE = 24;
export const ROW_HEIGHT = 32;

export const COLOR_NAME_USERDATA = (themeType: ThemeType): string => (themeType === 'dark' ? '#62ff25' : '#37c400');
export const COLOR_NAME_ALIAS = (themeType: ThemeType): string => (themeType === 'dark' ? '#ee56ff' : '#a204b4');
export const COLOR_NAME_JAVASCRIPT = (themeType: ThemeType): string => (themeType === 'dark' ? '#fff46e' : '#b89101');
export const COLOR_NAME_SYSTEM = (themeType: ThemeType): string => (themeType === 'dark' ? '#ff6d69' : '#ff6d69');
export const COLOR_NAME_SYSTEM_ADAPTER = (themeType: ThemeType): string =>
    themeType === 'dark' ? '#5773ff' : '#5773ff';

/** Namespaces which are allowed to be edited by non-expert users */
const NON_EXPERT_NAMESPACES = ['0_userdata.0.', 'alias.0.'];

export const styles: Record<string, any> = {
    headerCellInput: {
        width: 'calc(100% - 5px)',
        height: ROW_HEIGHT,
        pt: 0,
        '& .itemIcon': {
            verticalAlign: 'middle',
            width: ICON_SIZE,
            height: ICON_SIZE,
            display: 'inline-block',
        },
    },
    headerCellSelectItem: {
        '& .itemIcon': {
            width: ICON_SIZE,
            height: ICON_SIZE,
            mr: '5px',
            display: 'inline-block',
        },
    },
    selectNone: {
        opacity: 0.5,
    },
    selectClearButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        borderRadius: 5,
        backgroundColor: 'background.default',
    },
    cellIdTooltipLink: {
        color: '#7ec2fd',
        '&:hover': {
            color: '#7ec2fd',
        },
        '&:visited': {
            color: '#7ec2fd',
        },
    },
    cellIdTooltip: {
        fontSize: 14,
    },
};

export function ButtonIcon(props?: { style?: React.CSSProperties }): JSX.Element {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 436 436"
            style={props?.style}
            width="24"
            height="24"
            className="admin-button"
        >
            <g fill="currentColor">
                <path d="m195.23077,24.30769c-36,3 -67,12 -96,26c-49,24 -82,61 -93,104l-3,11l-1,50c0,46 0,49 2,59l5,20c21,58 84,103 165,116c16,3 53,4 70,2c60,-6 111,-28 147,-64c21,-21 36,-49 40,-74a866,866 0 0 0 1,-104c-3,-18 -6,-28 -13,-43c-26,-52 -87,-90 -162,-101c-16,-2 -48,-3 -63,-2l1,0zm60,23c36,5 70,18 95,35c31,20 51,47 59,77c2,7 2,11 2,25c1,15 0,18 -2,26c-19,69 -104,117 -200,114c-47,-2 -90,-15 -124,-38c-31,-20 -51,-47 -59,-77c-3,-11 -4,-32 -2,-43c8,-42 41,-78 91,-101a260,260 0 0 1 140,-19l0,1zm-221,222c21,26 57,49 95,62c81,27 174,14 239,-32c14,-10 31,-27 41,-41c2,-2 2,-2 2,7c-1,23 -16,50 -38,72c-78,74 -233,74 -311,-1a121,121 0 0 1 -39,-76l0,-6l3,4l8,11z" />
                <path d="m201.23077,47.30769c-40,3 -79,19 -104,44c-55,55 -38,133 37,171c52,26 122,24 172,-5c30,-17 51,-42 58,-71c3,-11 3,-34 0,-45c-6,-23 -21,-44 -40,-60l-27,-16a184,184 0 0 0 -96,-18zm30,21c56,5 100,35 112,75c4,11 4,30 0,41c-8,25 -26,45 -54,59a166,166 0 0 1 -160,-8a98,98 0 0 1 -41,-53c-5,-18 -2,-39 8,-57c23,-39 79,-62 135,-57z" />
            </g>
        </svg>
    );
}

/** Converts ioB pattern into regex */
export function pattern2RegEx(pattern: string): string {
    pattern = (pattern || '').toString();

    const startsWithWildcard = pattern[0] === '*';
    const endsWithWildcard = pattern[pattern.length - 1] === '*';

    pattern = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');

    return (startsWithWildcard ? '' : '^') + pattern + (endsWithWildcard ? '' : '$');
}

/**
 * Function that walks through all keys of an object or array and applies a function to each key.
 */
export function walkThroughArray(object: any[], iteratee: (result: any[], value: any, key: number) => void): any[] {
    const copiedObject: any[] = [];
    for (let index = 0; index < object.length; index++) {
        iteratee(copiedObject, object[index], index);
    }
    return copiedObject;
}

/**
 * Function that walks through all keys of an object or array and applies a function to each key.
 */
export function walkThroughObject(
    object: Record<string, any>,
    iteratee: (result: Record<string, any>, value: any, key: string) => void,
): Record<string, any> {
    const copiedObject: Record<string, any> = {};
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            iteratee(copiedObject, object[key], key);
        }
    }
    return copiedObject;
}

/**
 * Function to reduce an object primarily by a given list of keys
 */
export function filterObject(
    /** The objects which should be filtered */
    obj: Record<string, any> | any[],
    /** The keys which should be excluded */
    filterKeys: string[],
    /** Whether translations should be reduced to only the english value */
    excludeTranslations?: boolean,
): Record<string, any> | any[] {
    if (Array.isArray(obj)) {
        return walkThroughArray(obj, (result: any[], value: any, key: number) => {
            if (value === undefined || value === null) {
                return;
            }
            // if the key is an object, run it through the inner function - omitFromObject
            const isObject = typeof value === 'object';
            if (excludeTranslations && isObject) {
                if (typeof value.en === 'string' && typeof value.de === 'string') {
                    result[key] = value.en;
                    return;
                }
            }
            result[key] = isObject ? filterObject(value, filterKeys, excludeTranslations) : value;
        });
    }

    return walkThroughObject(obj, (result: Record<string, any>, value: any, key: string) => {
        if (value === undefined || value === null) {
            return;
        }
        if (filterKeys.includes(key)) {
            return;
        }
        // if the key is an object, run it through the inner function - omitFromObject
        const isObject = typeof value === 'object';
        if (excludeTranslations && isObject) {
            if (typeof value.en === 'string' && typeof value.de === 'string') {
                result[key] = value.en;
                return;
            }
        }
        result[key] = isObject ? filterObject(value, filterKeys, excludeTranslations) : value;
    });
}

// It is an export function and used somewhere else
export function filterRoles(
    roleArray: { role: string; type: ioBroker.CommonType }[],
    type: ioBroker.CommonType,
    defaultRoles?: { role: string; type: ioBroker.CommonType }[],
): string[] {
    const bigRoleArray: string[] = [];
    roleArray.forEach(
        role =>
            (role.type === 'mixed' || role.type) === type &&
            !bigRoleArray.includes(role.role) &&
            bigRoleArray.push(role.role),
    );
    defaultRoles?.forEach(
        role =>
            (role.type === 'mixed' || role.type) === type &&
            !bigRoleArray.includes(role.role) &&
            bigRoleArray.push(role.role),
    );
    bigRoleArray.sort();
    return bigRoleArray;
}

/**
 * Function to generate a json-file for an object and trigger download it
 */
export function generateFile(
    /** The desired filename */
    fileName: string,
    /** The objects which should be downloaded */
    obj: Record<string, ioBroker.Object>,
    /** Options to filter/reduce the output */
    options: {
        /**  Whether the output should be beautified */
        beautify?: boolean;
        /** Whether "system.repositories" should be excluded */
        excludeSystemRepositories?: boolean;
        /** Whether translations should be reduced to only the english value */
        excludeTranslations?: boolean;
    },
): void {
    const el = document.createElement('a');
    const filterKeys = [];
    if (options.excludeSystemRepositories) {
        filterKeys.push('system.repositories');
    }
    const filteredObject =
        filterKeys.length > 0 || options.excludeTranslations
            ? filterObject(obj, filterKeys, options.excludeTranslations)
            : obj;
    const data = options.beautify ? JSON.stringify(filteredObject, null, 2) : JSON.stringify(filteredObject);
    el.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(data)}`);
    el.setAttribute('download', fileName);

    el.style.display = 'none';
    document.body.appendChild(el);

    el.click();

    document.body.removeChild(el);
}

interface CustomFilterSelectProps {
    name: 'room' | 'func' | 'type' | 'role' | 'custom';
    texts: Record<string, string>;
    initialValue: string[] | undefined;
    onChange: (name: 'room' | 'func' | 'type' | 'role' | 'custom', value: string[] | undefined) => void;
    values: (string | InputSelectItem)[];
}

interface CustomFilterSelectState {
    value: string[];
}

export class CustomFilterSelect extends Component<CustomFilterSelectProps, CustomFilterSelectState> {
    private readonly hasIcons: boolean;
    private timer: ReturnType<typeof setTimeout> | null = null;
    constructor(props: CustomFilterSelectProps) {
        super(props);
        this.state = {
            value: props.initialValue || [],
        };
        this.hasIcons = !!props.values?.find(item => (item as InputSelectItem).icon);
    }

    componentWillUnmount(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    render(): React.JSX.Element {
        return (
            <div style={{ position: 'relative' }}>
                <Select
                    variant="standard"
                    key={this.props.name}
                    sx={styles.headerCellInput}
                    className="no-underline"
                    multiple
                    renderValue={value => {
                        if (!value?.length) {
                            return this.props.name === 'custom'
                                ? this.props.texts.showAll
                                : this.props.texts[`filter_${this.props.name}`];
                        }
                        return value.map(val => {
                            const item = this.props.values.find(i =>
                                typeof i === 'object' ? i.value === val : i === val,
                            );
                            let id: string;
                            let _name: string;
                            let icon: null | JSX.Element | undefined;
                            if (typeof item === 'object') {
                                id = item.value;
                                _name = item.name;
                                icon = item.icon;
                            } else {
                                id = item!;
                                _name = item!;
                            }
                            return (
                                <Box
                                    component="span"
                                    sx={styles.headerCellSelectItem}
                                    key={id}
                                >
                                    {icon || (this.hasIcons ? <div className="itemIcon" /> : null)}
                                    {_name}
                                </Box>
                            );
                        });
                    }}
                    value={this.state.value}
                    onChange={event => {
                        let selectedValues = event.target.value as string[];
                        // '_' may be selected only alone
                        if (this.state.value[0] === '_' && selectedValues.includes('_') && selectedValues.length > 1) {
                            const pos = selectedValues.indexOf('_');
                            if (pos !== -1) {
                                selectedValues.splice(pos, 1);
                            }
                        } else if (this.state.value[0] !== '_' && selectedValues.includes('_')) {
                            selectedValues = ['_'];
                        }

                        // '_' may be selected only alone
                        if (selectedValues.includes('')) {
                            selectedValues = [];
                        }

                        this.setState({ value: selectedValues }, () => {
                            if (this.timer) {
                                clearTimeout(this.timer);
                            }
                            this.timer = setTimeout(() => {
                                this.timer = null;
                                this.props.onChange(this.props.name, selectedValues);
                            }, 400);
                        });
                    }}
                    onClose={() => {
                        if (this.timer) {
                            clearTimeout(this.timer);
                            this.timer = null;
                            this.props.onChange(this.props.name, this.state.value);
                        }
                    }}
                    inputProps={{ name: this.props.name, id: this.props.name }}
                    displayEmpty
                >
                    <MenuItem
                        key="empty"
                        value=""
                    >
                        <span style={styles.selectNone}>
                            {this.props.name === 'custom'
                                ? this.props.texts.showAll
                                : this.props.texts[`filter_${this.props.name}`]}
                        </span>
                    </MenuItem>
                    {this.props.values?.map(item => {
                        let id: string;
                        let _name: string;
                        let icon: null | JSX.Element | undefined;
                        if (typeof item === 'object') {
                            id = item.value;
                            _name = item.name;
                            icon = item.icon;
                        } else {
                            id = item;
                            _name = item;
                        }
                        return (
                            <MenuItem
                                sx={styles.headerCellSelectItem}
                                key={id}
                                value={id}
                            >
                                {icon || (this.hasIcons ? <div className="itemIcon" /> : null)}
                                {_name}
                            </MenuItem>
                        );
                    })}
                </Select>
                {this.state.value.length ? (
                    <Box
                        component="div"
                        sx={styles.selectClearButton}
                    >
                        <IconButton
                            size="small"
                            onClick={() => {
                                if (this.timer) {
                                    clearTimeout(this.timer);
                                    this.timer = null;
                                }
                                this.setState({ value: [] }, () => this.props.onChange(this.props.name, undefined));
                            }}
                        >
                            <IconClose />
                        </IconButton>
                    </Box>
                ) : null}
            </div>
        );
    }
}

interface CustomFilterInputProps {
    name: 'name' | 'id';
    texts: Record<string, string>;
    initialValue: string | undefined;
    onChange: (name: 'name' | 'id', value: string | undefined) => void;
    t: (text: string) => string;
    styles?: React.CSSProperties;
}

interface CustomFilterInputState {
    value: string;
}

export class CustomFilterInput extends Component<CustomFilterInputProps, CustomFilterInputState> {
    private timer: ReturnType<typeof setTimeout> | null = null;
    constructor(props: CustomFilterInputProps) {
        super(props);
        this.state = {
            value: props.initialValue || '',
        };
    }

    componentWillUnmount(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    render(): React.JSX.Element {
        return (
            <FormControl
                sx={this.props.styles}
                key={this.props.name}
                title={this.props.t('ra_You can use * as wildcard')}
                margin="dense"
            >
                <Input
                    classes={{ underline: 'no-underline' }}
                    id={this.props.name}
                    placeholder={this.props.texts[`filter_${this.props.name}`]}
                    value={this.state.value}
                    onChange={event => {
                        const selectedValues = event.target.value;
                        this.setState({ value: selectedValues }, () => {
                            if (this.timer) {
                                clearTimeout(this.timer);
                            }
                            this.timer = setTimeout(() => {
                                this.timer = null;
                                this.props.onChange(this.props.name, selectedValues);
                            }, 400);
                        });
                    }}
                    onBlur={() => {
                        if (this.timer) {
                            clearTimeout(this.timer);
                            this.timer = null;
                            this.props.onChange(this.props.name, this.state.value);
                        }
                    }}
                    autoComplete="off"
                />
                {this.state.value ? (
                    <div
                        style={{
                            position: 'absolute',
                            right: 0,
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={() => {
                                if (this.timer) {
                                    clearTimeout(this.timer);
                                    this.timer = null;
                                }
                                this.setState({ value: '' }, () => this.props.onChange(this.props.name, undefined));
                            }}
                        >
                            <IconClose />
                        </IconButton>
                    </div>
                ) : null}
            </FormControl>
        );
    }
}

// d=data, t=target, s=start, e=end, m=middle
export function binarySearch(list: string[], find: string, _start?: number, _end?: number): boolean {
    _start ||= 0;
    if (_end === undefined) {
        _end = list.length - 1;
        if (!_end) {
            return list[0] === find;
        }
    }
    const middle = Math.floor((_start + _end) / 2);
    if (find === list[middle]) {
        return true;
    }
    if (_end - 1 === _start) {
        return list[_start] === find || list[_end] === find;
    }
    if (find > list[middle]) {
        return binarySearch(list, find, middle, _end);
    }
    if (find < list[middle]) {
        return binarySearch(list, find, _start, middle);
    }
    return false;
}

export function getName(name: ioBroker.StringOrTranslated, lang: ioBroker.Languages): string {
    if (typeof name === 'object') {
        if (!name) {
            return '';
        }
        return (name[lang] || name.en || '').toString();
    }

    return name ? name.toString() : '';
}

export function getSelectIdIconFromObjects(
    objects: Record<string, ioBroker.Object>,
    id: string,
    lang: ioBroker.Languages,
    imagePrefix?: string,
): string | JSX.Element | null {
    // `admin` has prefix '.' and `web` has '../..'
    imagePrefix ||= '.'; // http://localhost:8081';
    let src: string | JSX.Element = '';
    const _id_ = `system.adapter.${id}`;
    const aIcon = id && objects[_id_]?.common?.icon;
    if (aIcon) {
        // if not BASE64
        if (!aIcon.startsWith('data:image/')) {
            if (aIcon.includes('.')) {
                const name = objects[_id_].common.name;
                if (typeof name === 'object') {
                    src = `${imagePrefix}/adapter/${name[lang] || name.en}/${aIcon}`;
                } else {
                    src = `${imagePrefix}/adapter/${name}/${aIcon}`;
                }
            } else if (aIcon && aIcon.length < 3) {
                return aIcon; // utf-8
            } else {
                return null; // '<i class="material-icons iob-list-icon">' + objects[_id_].common.icon + '</i>';
            }
        } else if (aIcon.startsWith('data:image/svg')) {
            src = (
                <SVG
                    className="iconOwn"
                    src={aIcon}
                    width={28}
                    height={28}
                />
            );
        } else {
            src = aIcon;
        }
    } else {
        const common = objects[id] && objects[id].common;

        if (common) {
            const cIcon = common.icon;
            if (cIcon) {
                if (!cIcon.startsWith('data:image/')) {
                    if (cIcon.includes('.')) {
                        let instance;
                        if (objects[id].type === 'instance' || objects[id].type === 'adapter') {
                            if (typeof common.name === 'object') {
                                src = `${imagePrefix}/adapter/${common.name[lang] || common.name.en}/${cIcon}`;
                            } else {
                                src = `${imagePrefix}/adapter/${common.name}/${cIcon}`;
                            }
                        } else if (id && id.startsWith('system.adapter.')) {
                            instance = id.split('.', 3);
                            if (cIcon[0] === '/') {
                                instance[2] += cIcon;
                            } else {
                                instance[2] += `/${cIcon}`;
                            }
                            src = `${imagePrefix}/adapter/${instance[2]}`;
                        } else {
                            instance = id.split('.', 2);
                            if (cIcon[0] === '/') {
                                instance[0] += cIcon;
                            } else {
                                instance[0] += `/${cIcon}`;
                            }
                            src = `${imagePrefix}/adapter/${instance[0]}`;
                        }
                    } else if (aIcon && aIcon.length < 3) {
                        return aIcon; // utf-8
                    } else {
                        return null;
                    }
                } else if (cIcon.startsWith('data:image/svg')) {
                    // if base 64 image
                    src = (
                        <SVG
                            className="iconOwn"
                            src={cIcon}
                            width={28}
                            height={28}
                        />
                    );
                } else {
                    src = cIcon;
                }
            }
        }
    }

    return src || null;
}

export function applyFilter(
    item: TreeItem,
    filters: ObjectBrowserFilter,
    lang: ioBroker.Languages,
    objects: Record<string, ioBroker.Object>,
    context?: {
        id?: string;
        idRx?: RegExp;
        name?: string;
        nameRx?: RegExp;
        type?: string[];
        custom?: string[];
        role?: string[];
        room?: string[];
        func?: string[];
    },
    counter?: { count: number },
    customFilter?: ObjectBrowserCustomFilter,
    selectedTypes?: string[],
    _depth?: number,
): boolean {
    _depth ||= 0;
    let filteredOut = false;
    if (!context) {
        context = {};
        if (filters.id) {
            const id = filters.id.toLowerCase();
            if (id.includes('*')) {
                context.idRx = new RegExp(pattern2RegEx(filters.id), 'i');
            } else {
                context.id = id;
            }
        }
        if (filters.name) {
            const name = filters.name.toLowerCase();
            if (name.includes('*')) {
                context.nameRx = new RegExp(pattern2RegEx(name), 'i');
            } else {
                context.name = name;
            }
        }
        if (filters.type?.length) {
            context.type = filters.type.map(f => f.toLowerCase());
        }
        if (filters.custom?.length) {
            context.custom = filters.custom.map(c => c.toLowerCase());
        }
        if (filters.role?.length) {
            context.role = filters.role.map(r => r.toLowerCase());
        }
        if (filters.room?.length) {
            context.room = [];
            filters.room.forEach(room => {
                context.room = context.room.concat((objects[room] as ioBroker.EnumObject)?.common?.members || []);
            });
        }
        if (filters.func?.length) {
            context.func = [];
            filters.func.forEach(func => {
                context.func = context.func.concat((objects[func] as ioBroker.EnumObject)?.common?.members || []);
            });
        }
    }

    const data = item.data;

    if (data?.id) {
        const common: ioBroker.StateCommon = data.obj?.common as ioBroker.StateCommon;

        if (customFilter) {
            if (customFilter.type) {
                if (typeof customFilter.type === 'string') {
                    if (!data.obj || customFilter.type !== data.obj.type) {
                        filteredOut = true;
                    }
                } else if (Array.isArray(customFilter.type)) {
                    if (!data.obj || !customFilter.type.includes(data.obj.type)) {
                        filteredOut = true;
                    }
                }
            }
            if (!filteredOut && customFilter.common?.type) {
                if (!common?.type) {
                    filteredOut = true;
                } else if (typeof customFilter.common.type === 'string') {
                    if (customFilter.common.type !== common.type) {
                        filteredOut = true;
                    }
                } else if (Array.isArray(customFilter.common.type)) {
                    if (!customFilter.common.type.includes(common.type)) {
                        filteredOut = true;
                    }
                }
            }
            if (!filteredOut && customFilter.common?.role) {
                if (!common?.role) {
                    filteredOut = true;
                } else if (typeof customFilter.common.role === 'string') {
                    if (common.role.startsWith(customFilter.common.role)) {
                        filteredOut = true;
                    }
                } else if (Array.isArray(customFilter.common.role)) {
                    if (!customFilter.common.role.find(role => common.role.startsWith(role))) {
                        filteredOut = true;
                    }
                }
            }

            if (!filteredOut && customFilter.common?.custom === '_' && common?.custom) {
                filteredOut = true;
            } else if (!filteredOut && customFilter.common?.custom && customFilter.common?.custom !== '_') {
                const filterOfCustom = customFilter.common.custom as string | string[] | boolean;
                if (!common?.custom) {
                    filteredOut = true;
                } else if (filterOfCustom === '_dataSources') {
                    // TODO: make it configurable
                    if (
                        !Object.keys(common.custom).find(
                            id => id.startsWith('history.') || id.startsWith('sql.') || id.startsWith('influxdb.'),
                        )
                    ) {
                        filteredOut = true;
                    }
                } else if (Array.isArray(filterOfCustom)) {
                    // here are ['influxdb.', 'telegram.']
                    const customs = Object.keys(common.custom); // here are ['influxdb.0', 'telegram.2']
                    if (filterOfCustom.find(cst => customs.find(id => id.startsWith(cst)))) {
                        filteredOut = true;
                    }
                } else if (
                    filterOfCustom !== true &&
                    !Object.keys(common.custom).find(id => id.startsWith(filterOfCustom as string))
                ) {
                    filteredOut = true;
                }
            }
        }

        if (!filteredOut && !filters.expertMode) {
            filteredOut =
                data.id === 'system' ||
                data.id === 'enum' ||
                // (data.obj && data.obj.type === 'meta') ||
                data.id.startsWith('system.') ||
                data.id.startsWith('enum.') ||
                data.id.startsWith('_design/') ||
                data.id.endsWith('.admin') ||
                !!common?.expert;
        }
        if (!filteredOut && context.id) {
            if (data.fID === undefined) {
                data.fID = data.id.toLowerCase();
            }
            filteredOut = !data.fID.includes(context.id);
        }
        if (!filteredOut && context.idRx) {
            filteredOut = !context.idRx.test(data.id);
        }
        if (!filteredOut && context.name) {
            if (common) {
                if (data.fName === undefined) {
                    data.fName = getName(common.name, lang) || '';
                    data.fName = data.fName.toLowerCase();
                }
                filteredOut = !data.fName.includes(context.name);
            } else {
                filteredOut = true;
            }
        }
        if (!filteredOut && context.nameRx) {
            if (common) {
                if (data.fName === undefined) {
                    data.fName = getName(common.name, lang) || '';
                    data.fName = data.fName.toLowerCase();
                }
                filteredOut = !context.nameRx.test(data.fName);
            }
        }

        if (!filteredOut && filters.role?.length && common) {
            filteredOut = !(typeof common.role === 'string' && context.role.find(role => common.role.startsWith(role)));
        }
        if (!filteredOut && context.room?.length) {
            filteredOut = !context.room.find(id => id === data.id || data.id.startsWith(`${id}.`));
        }
        if (!filteredOut && context.func?.length) {
            filteredOut = !context.func.find(id => id === data.id || data.id.startsWith(`${id}.`));
        }
        if (!filteredOut && context.type?.length) {
            filteredOut = !(data.obj?.type && context.type.includes(data.obj.type));
        }
        if (!filteredOut && selectedTypes) {
            filteredOut = !(data.obj?.type && selectedTypes.includes(data.obj.type));
        }
        if (!filteredOut && context.custom?.length) {
            if (common) {
                if (context.custom[0] === '_') {
                    filteredOut = !!common.custom;
                } else if (common.custom) {
                    filteredOut = !context.custom.find(custom => common.custom[custom]);
                } else {
                    filteredOut = true;
                }
            } else {
                filteredOut = context.custom[0] !== '_';
            }
        }
    }

    data.visible = !filteredOut;

    data.hasVisibleChildren = false;
    if (item.children && _depth < 20) {
        item.children.forEach(_item => {
            const visible = applyFilter(
                _item,
                filters,
                lang,
                objects,
                context,
                counter,
                customFilter,
                selectedTypes,
                _depth + 1,
            );
            if (visible) {
                data.hasVisibleChildren = true;
            }
        });
    }

    // const visible = data.visible || data.hasVisibleChildren;
    data.sumVisibility = data.visible || data.hasVisibleChildren; // || data.hasVisibleParent;
    if (counter && data.sumVisibility) {
        counter.count++;
    }

    // show all children of visible object with opacity 0.5
    if (data.id && data.sumVisibility && item.children) {
        item.children.forEach(_item => (_item.data.hasVisibleParent = true));
    }

    return data.visible || data.hasVisibleChildren;
}

export function getVisibleItems(
    item: TreeItem,
    type: ioBroker.ObjectType,
    objects: Record<string, ioBroker.Object>,
    _result?: string[],
): string[] {
    _result ||= [];
    const data = item.data;
    if (data.sumVisibility) {
        if (data.id && objects[data.id] && (!type || objects[data.id].type === type)) {
            _result.push(data.id);
        }
        item.children?.forEach(_item => getVisibleItems(_item, type, objects, _result));
    }

    return _result;
}

function getSystemIcon(
    objects: Record<string, ioBroker.Object>,
    id: string,
    level: number,
    themeType: ThemeType,
    lang: ioBroker.Languages,
    imagePrefix?: string,
): string | JSX.Element | null {
    let icon;

    // system or design has special icons
    if (id === 'alias' || id === 'alias.0') {
        icon = (
            <IconLink
                className="iconOwn"
                style={{ color: COLOR_NAME_ALIAS(themeType) }}
            />
        );
    } else if (id === '0_userdata' || id === '0_userdata.0') {
        icon = (
            <IconData
                className="iconOwn"
                style={{ color: COLOR_NAME_USERDATA(themeType) }}
            />
        );
    } else if (id.startsWith('_design/') || id === 'system') {
        icon = (
            <IconSystem
                className="iconOwn"
                style={{ color: COLOR_NAME_SYSTEM(themeType) }}
            />
        );
    } else if (id === 'system.adapter') {
        icon = (
            <IconSystem
                className="iconOwn"
                style={{ color: COLOR_NAME_SYSTEM_ADAPTER(themeType) }}
            />
        );
    } else if (id === 'system.group') {
        icon = <IconGroup className="iconOwn" />;
    } else if (id === 'system.user') {
        icon = <IconUser className="iconOwn" />;
    } else if (id === 'system.host') {
        icon = <IconHost className="iconOwn" />;
    } else if (id.endsWith('.connection') || id.endsWith('.connected')) {
        icon = <IconConnection className="iconOwn" />;
    } else if (id.endsWith('.info')) {
        icon = <IconInfo className="iconOwn" />;
    } else if (objects[id] && objects[id].type === 'meta') {
        icon = <IconMeta className="iconOwn" />;
    } else if (level < 2) {
        // detect "cloud.0"
        if (objects[`system.adapter.${id}`]) {
            icon = getSelectIdIconFromObjects(objects, `system.adapter.${id}`, lang, imagePrefix);
        }
    }

    return icon || null;
}

export function getObjectTooltip(data: TreeItemData, lang: ioBroker.Languages): string | null {
    if (data?.obj?.common?.desc) {
        return getName(data.obj.common.desc, lang) || null;
    }

    return null;
}

export function getIdFieldTooltip(data: TreeItemData, lang: ioBroker.Languages): JSX.Element {
    const tooltip = getObjectTooltip(data, lang);
    if (tooltip?.startsWith('http')) {
        return (
            <Box
                component="a"
                sx={styles.cellIdTooltipLink}
                href={tooltip}
                target="_blank"
                rel="noreferrer"
            >
                {tooltip}
            </Box>
        );
    }
    return <span style={styles.cellIdTooltip}>{tooltip || data.id || ''}</span>;
}

export function buildTree(
    objects: Record<string, ioBroker.Object>,
    options: {
        imagePrefix?: string;
        root?: string;
        lang: ioBroker.Languages;
        themeType: ThemeType;
    },
): { root: TreeItem; info: TreeInfo } {
    const imagePrefix = options.imagePrefix || '.';

    let ids = Object.keys(objects);

    ids.sort((a, b) => {
        if (a === b) {
            return 0;
        }
        a = a.replace(/\./g, '!!!');
        b = b.replace(/\./g, '!!!');
        if (a > b) {
            return 1;
        }
        return -1;
    });

    if (options.root) {
        ids = ids.filter(id => id === options.root || id.startsWith(`${options.root}.`));
    }

    // find empty nodes and create names for it
    let currentPathArr: string[] = [];
    let currentPath = '';
    let currentPathLen = 0;
    const root: TreeItem = {
        data: {
            name: '',
            id: '',
        },
        children: [],
    };

    const info: TreeInfo = {
        funcEnums: [],
        roomEnums: [],
        roles: [],
        ids: [],
        types: [],
        objects,
        customs: ['_'],
        enums: [],
        hasSomeCustoms: false,
        aliasesMap: {},
    };

    let cRoot: TreeItem = root;

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (!id) {
            continue;
        }
        const obj = objects[id];
        const parts = id.split('.');

        if (obj.type && !info.types.includes(obj.type)) {
            info.types.push(obj.type);
        }

        if (obj) {
            const common = obj.common;
            const role = common?.role;
            if (role && !info.roles.find(it => it.role === role)) {
                if (typeof role !== 'string') {
                    console.warn(`Invalid role type "${typeof role}" in "${obj._id}"`);
                } else {
                    info.roles.push({ role, type: common.type });
                }
            } else if (id.startsWith('enum.rooms.')) {
                info.roomEnums.push(id);
                info.enums.push(id);
            } else if (id.startsWith('enum.functions.')) {
                info.funcEnums.push(id);
                info.enums.push(id);
            } else if (obj.type === 'enum') {
                info.enums.push(id);
            } else if (obj.type === 'instance' && common && (common.supportCustoms || common.adminUI?.custom)) {
                info.hasSomeCustoms = true;
                info.customs.push(id.substring('system.adapter.'.length));
            }

            // Build a map of aliases
            if (id.startsWith('alias.') && obj.common.alias?.id) {
                if (typeof obj.common.alias.id === 'string') {
                    const usedId = obj.common.alias.id;
                    if (!info.aliasesMap[usedId]) {
                        info.aliasesMap[usedId] = [id];
                    } else if (!info.aliasesMap[usedId].includes(id)) {
                        info.aliasesMap[usedId].push(id);
                    }
                } else {
                    const readId = obj.common.alias.id.read;
                    if (readId) {
                        if (!info.aliasesMap[readId]) {
                            info.aliasesMap[readId] = [id];
                        } else if (!info.aliasesMap[readId].includes(id)) {
                            info.aliasesMap[readId].push(id);
                        }
                    }
                    const writeId = obj.common.alias.id.write;
                    if (writeId) {
                        if (!info.aliasesMap[writeId]) {
                            info.aliasesMap[writeId] = [id];
                        } else if (!info.aliasesMap[writeId].includes(id)) {
                            info.aliasesMap[writeId].push(id);
                        }
                    }
                }
            }
        }

        info.ids.push(id);

        let repeat;

        // if next level
        do {
            repeat = false;

            // If the current level is still OK, and we can add ID to children
            if (!currentPath || id.startsWith(`${currentPath}.`)) {
                // if more than one level added
                if (parts.length - currentPathLen > 1) {
                    let curPath = currentPath;
                    // generate missing levels
                    for (let k = currentPathLen; k < parts.length - 1; k++) {
                        curPath += (curPath ? '.' : '') + parts[k];
                        // level does not exist
                        if (!binarySearch(info.ids, curPath)) {
                            const _cRoot: TreeItem = {
                                data: {
                                    name: parts[k],
                                    parent: cRoot,
                                    id: curPath,
                                    obj: objects[curPath],
                                    level: k,
                                    icon: getSystemIcon(
                                        objects,
                                        curPath,
                                        k,
                                        options.themeType,
                                        options.lang,
                                        imagePrefix,
                                    ),
                                    generated: true,
                                },
                            };

                            cRoot.children ||= [];
                            cRoot.children.push(_cRoot);
                            cRoot = _cRoot;
                            info.ids.push(curPath); // IDs will be added by alphabet
                        } else if (cRoot.children) {
                            cRoot = cRoot.children.find(item => item.data.name === parts[k]);
                        }
                    }
                }

                const _cRoot: TreeItem = {
                    data: {
                        name: parts[parts.length - 1],
                        title: getName(obj?.common?.name, options.lang),
                        obj,
                        parent: cRoot,
                        icon:
                            getSelectIdIconFromObjects(objects, id, options.lang, imagePrefix) ||
                            getSystemIcon(objects, id, 0, options.themeType, options.lang, imagePrefix),
                        id,
                        hasCustoms: !!(obj.common?.custom && Object.keys(obj.common.custom).length),
                        level: parts.length - 1,
                        generated: false,
                        button:
                            obj.type === 'state' &&
                            !!obj.common?.role &&
                            typeof obj.common.role === 'string' &&
                            obj.common.role.startsWith('button') &&
                            obj.common?.write !== false,
                        switch:
                            obj.type === 'state' &&
                            obj.common?.type === 'boolean' &&
                            obj.common?.write !== false &&
                            obj.common?.read !== false,
                        url:
                            !!obj.common?.role &&
                            typeof obj.common.role === 'string' &&
                            obj.common.role.startsWith('url'),
                    },
                };

                cRoot.children ||= [];
                cRoot.children.push(_cRoot);
                cRoot = _cRoot;

                currentPathLen = parts.length;
                currentPathArr = parts;
                currentPath = id;
            } else {
                let u = 0;

                while (currentPathArr[u] === parts[u]) {
                    u++;
                }

                if (u > 0) {
                    let move = currentPathArr.length;
                    currentPathArr = currentPathArr.splice(0, u);
                    currentPathLen = u;
                    currentPath = currentPathArr.join('.');
                    while (move > u) {
                        if (cRoot.data.parent) {
                            cRoot = cRoot.data.parent;
                        } else {
                            console.error(`Parent is null for ${id} ${currentPath} ${currentPathArr.join('.')}`);
                        }
                        move--;
                    }
                } else {
                    cRoot = root;
                    currentPathArr = [];
                    currentPath = '';
                    currentPathLen = 0;
                }
                repeat = true;
            }
        } while (repeat);
    }

    info.roomEnums.sort((a, b) => {
        const aName: string = getName(objects[a]?.common?.name, options.lang) || a.split('.').pop();
        const bName: string = getName(objects[b]?.common?.name, options.lang) || b.split('.').pop();
        if (aName > bName) {
            return 1;
        }
        if (aName < bName) {
            return -1;
        }
        return 0;
    });
    info.funcEnums.sort((a, b) => {
        const aName: string = getName(objects[a]?.common?.name, options.lang) || a.split('.').pop();
        const bName: string = getName(objects[b]?.common?.name, options.lang) || b.split('.').pop();
        if (aName > bName) {
            return 1;
        }
        if (aName < bName) {
            return -1;
        }
        return 0;
    });
    info.roles.sort((a, b) => a.role.localeCompare(b.role));
    info.types.sort();

    return { info, root };
}

export function findNode(
    root: TreeItem,
    id: string,
    _parts?: string[],
    _path?: string,
    _level?: number,
): TreeItem | null {
    if (root.data.id === id) {
        return root;
    }
    if (!_parts) {
        _parts = id.split('.');
        _level = 0;
        _path = _parts[_level];
    }
    if (!root.children && root.data.id !== id) {
        return null;
    }
    let found;
    if (root.children) {
        for (let i = 0; i < root.children.length; i++) {
            const _id = root.children[i].data.id;
            if (_id === _path) {
                found = root.children[i];
                break;
            } else if (_id > _path) {
                break;
            }
        }
    }
    if (found) {
        _level ||= 0;
        return findNode(found, id, _parts, `${_path}.${_parts[_level + 1]}`, _level + 1);
    }

    return null;
}

export function findRoomsForObject(
    info: TreeInfo,
    id: string,
    lang: ioBroker.Languages,
    rooms?: string[],
): { rooms: string[]; per: boolean } {
    if (!id) {
        return { rooms: [], per: false };
    }
    rooms ||= [];
    for (const room of info.roomEnums) {
        const common = info.objects[room]?.common;

        if (!common) {
            continue;
        }

        const name = getName(common.name, lang);

        if (common.members?.includes(id) && !rooms.includes(name)) {
            rooms.push(name);
        }
    }

    let ownEnums;

    // Check parent
    const parts = id.split('.');
    parts.pop();
    id = parts.join('.');
    if (info.objects[id]) {
        ownEnums = rooms.length;
        findRoomsForObject(info, id, lang, rooms);
    }

    return { rooms, per: !ownEnums }; // per is if the enums are from parent
}

export function findEnumsForObjectAsIds(
    info: TreeInfo,
    id: string,
    enumName: 'roomEnums' | 'funcEnums',
    funcs?: string[],
): string[] {
    if (!id) {
        return [];
    }
    funcs ||= [];
    for (let i = 0; i < info[enumName].length; i++) {
        const common = info.objects[info[enumName][i]]?.common;
        if (common?.members?.includes(id) && !funcs.includes(info[enumName][i])) {
            funcs.push(info[enumName][i]);
        }
    }
    funcs.sort();

    return funcs;
}

export function findFunctionsForObject(
    info: TreeInfo,
    id: string,
    lang: ioBroker.Languages,
    funcs?: string[],
): { funcs: string[]; pef: boolean } {
    if (!id) {
        return { funcs: [], pef: false };
    }
    funcs ||= [];
    for (let i = 0; i < info.funcEnums.length; i++) {
        const common = info.objects[info.funcEnums[i]]?.common;

        if (!common) {
            continue;
        }

        const name = getName(common.name, lang);
        if (common.members?.includes(id) && !funcs.includes(name)) {
            funcs.push(name);
        }
    }

    let ownEnums;

    // Check parent
    const parts = id.split('.');
    parts.pop();
    id = parts.join('.');
    if (info.objects[id]) {
        ownEnums = funcs.length;
        findFunctionsForObject(info, id, lang, funcs);
    }

    return { funcs, pef: !ownEnums };
}

/*
function quality2text(q) {
    if (!q) {
        return 'ok';
    }
    const custom = q & 0xFFFF0000;
    let text = '';
    if (q & 0x40) text += 'device';
    if (q & 0x80) text += 'sensor';
    if (q & 0x01) text += ' bad';
    if (q & 0x02) text += ' not connected';
    if (q & 0x04) text += ' error';

    return text + (custom ? '|0x' + (custom >> 16).toString(16).toUpperCase() : '') + ' [0x' + q.toString(16).toUpperCase() + ']';
}
*/

/**
 * Format a state value for visualization
 */
export function formatValue(options: FormatValueOptions): {
    valText: {
        /** value as string */
        v: string;
        /** value unit */
        u?: string;
        /** value isn't replaced by `common.states` */
        s?: string;
        /** Text for copy to clipboard */
        c?: string;
    };
    valFull:
        | {
              /** label */
              t: string;
              /** value */
              v: string;
              /** no break */
              nbr?: boolean;
          }[]
        | undefined;
    fileViewer: 'image' | 'text' | 'json' | 'html' | 'pdf' | 'audio' | 'video' | undefined;
} {
    const { dateFormat, state, isFloatComma, texts, obj } = options;
    const states = Utils.getStates(obj);
    const isCommon = obj.common;
    let fileViewer: 'image' | 'text' | 'json' | 'html' | 'pdf' | 'audio' | 'video' | undefined;

    let v: any =
        // @ts-expect-error deprecated from js-controller 6
        isCommon?.type === 'file'
            ? '[file]'
            : !state || state.val === null
              ? '(null)'
              : state.val === undefined
                ? '[undef]'
                : state.val;

    const type = typeof v;

    if (isCommon?.role && typeof isCommon.role === 'string' && isCommon.role.match(/^value\.time|^date/)) {
        if (v && typeof v === 'string') {
            if (Utils.isStringInteger(v)) {
                // we assume a unix ts
                v = new Date(parseInt(v, 10)).toString();
            } else {
                // check if parsable by new date
                try {
                    const parsedDate = new Date(v);

                    if (Utils.isValidDate(parsedDate)) {
                        v = parsedDate.toString();
                    }
                } catch {
                    // ignore
                }
            }
        } else {
            if (v > 946681200 && v < 946681200000) {
                // '2000-01-01T00:00:00' => 946681200000
                v *= 1_000; // maybe the time is in seconds (UNIX time)
            }
            // "null" and undefined could not be here. See `let v = (isCommon && isCommon.type === 'file') ....` above
            v = v ? new Date(v).toString() : v;
        }
    } else if (isCommon?.role && typeof isCommon.role === 'string' && isCommon.role.match(/^value\.duration/)) {
        // Format duration values in HH:mm:ss format
        if (typeof v === 'number' && v >= 0) {
            const hours = Math.floor(v / 3600);
            const minutes = Math.floor((v % 3600) / 60);
            const seconds = Math.floor(v % 60);
            v = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else if (typeof v === 'string' && Utils.isStringInteger(v)) {
            const numValue = parseInt(v, 10);
            if (numValue >= 0) {
                const hours = Math.floor(numValue / 3600);
                const minutes = Math.floor((numValue % 3600) / 60);
                const seconds = Math.floor(numValue % 60);
                v = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    } else {
        if (type === 'number') {
            if (!Number.isInteger(v)) {
                v = Math.round(v * 100_000_000) / 100_000_000; // remove 4.00000000000000001
                if (isFloatComma) {
                    v = v.toString().replace('.', ',');
                }
            }
        } else if (type === 'object') {
            v = JSON.stringify(v);
        } else if (type !== 'string') {
            v = v.toString();
        } else if (v.startsWith('data:image/')) {
            fileViewer = 'image';
        }

        if (typeof v !== 'string') {
            v = v.toString();
        }
    }

    const valText: {
        /** value as string */
        v: string;
        /** value unit */
        u?: string;
        /** value not replaced by `common.states` */
        s?: string;
        /** Text for copy to clipboard */
        c?: string;
    } = { v: v as string };

    // try to replace number with "common.states"
    if (states && states[v] !== undefined) {
        if (v !== states[v]) {
            valText.s = v;
            v = states[v];
            valText.v = v;
        }
    }

    if (valText.v?.length > 40) {
        valText.c = valText.v;
        valText.v = `${valText.v.substring(0, 40)}...`;
    }

    if (isCommon?.unit) {
        valText.u = isCommon.unit;
    }

    let valFull:
        | {
              /** label */
              t: string;
              /** value */
              v: string;
              nbr?: boolean;
          }[]
        | undefined;
    if (options.full) {
        if (typeof v === 'string' && v.length > 100) {
            valFull = [{ t: texts.value, v: `${v.substring(0, 100)}...` }];
        } else {
            valFull = [{ t: texts.value, v }];
        }

        if (state) {
            if (state.ack !== undefined && state.ack !== null) {
                valFull.push({ t: texts.ack, v: state.ack.toString() });
            }
            if (state.ts) {
                valFull.push({ t: texts.ts, v: state.ts ? Utils.formatDate(new Date(state.ts), dateFormat) : '' });
            }
            if (state.lc) {
                valFull.push({ t: texts.lc, v: state.lc ? Utils.formatDate(new Date(state.lc), dateFormat) : '' });
            }
            if (state.from) {
                let from = state.from.toString();
                if (from.startsWith('system.adapter.')) {
                    from = from.substring(15);
                }
                valFull.push({ t: texts.from, v: from });
            }
            if (state.user) {
                let user = state.user.toString();
                if (user.startsWith('system.user.')) {
                    user = user.substring(12);
                }
                valFull.push({ t: texts.user, v: user });
            }
            if (state.c) {
                valFull.push({ t: texts.c, v: state.c });
            }
            valFull.push({ t: texts.quality, v: Utils.quality2text(state.q || 0).join(', '), nbr: true });
        }
    }

    return {
        valText,
        valFull,
        fileViewer,
    };
}

/**
 * Get CSS style for given state value
 */
export function getValueStyle(options: GetValueStyleOptions): { color: string } {
    const { state /* , isExpertMode, isButton */ } = options;
    const color = state?.ack ? (state.q ? '#ffa500' : '') : '#ff2222c9';

    // do not show the color of the button in non-expert mode
    // if (!isExpertMode && isButton) {
    //     color = '';
    // }

    return { color };
}

export function prepareSparkData(values: ioBroker.GetHistoryResult, from: number): number[] {
    // set one point every hour
    let time = from;
    let i = 1;
    const v = [];

    while (i < values.length && time < from + 25 * 3600000) {
        // find the interval
        while (values[i - 1].ts < time && time <= values[i].ts && i < values.length) {
            i++;
        }
        if (i === 1 && values[i - 1].ts >= time) {
            // assume the value was always null
            v.push(0);
        } else if (i < values.length) {
            if (typeof values[i].val === 'boolean' || typeof values[i - 1].val === 'boolean') {
                v.push(values[i].val ? 1 : 0);
            } else {
                // remove nulls
                values[i - 1].val ||= 0;
                values[i].val ||= 0;
                // interpolate
                const nm1: number = values[i - 1].val as number;
                const n: number = values[i].val as number;
                const val = nm1 + ((n - nm1) * (time - values[i - 1].ts)) / (values[i].ts - values[i - 1].ts);

                v.push(val);
            }
        }

        time += 3600000;
    }

    return v;
}

export function getCustomValue(obj: ioBroker.Object, it: AdapterColumn): string | number | boolean | null {
    if (obj?._id?.startsWith(`${it.adapter}.`) && it.path.length > 1) {
        const p = it.path;
        let value;
        const anyObj: Record<string, any> = obj as Record<string, any>;
        if (anyObj[p[0]] && typeof anyObj[p[0]] === 'object') {
            if (p.length === 2) {
                // most common case
                value = anyObj[p[0]][p[1]];
            } else if (p.length === 3) {
                value = anyObj[p[0]][p[1]] && typeof anyObj[p[0]][p[1]] === 'object' ? anyObj[p[0]][p[1]][p[2]] : null;
            } else if (p.length === 4) {
                value =
                    anyObj[p[0]][p[1]] && typeof anyObj[p[0]][p[1]] === 'object' && anyObj[p[0]][p[1]][p[2]]
                        ? anyObj[p[0]][p[1]][p[2]][p[3]]
                        : null;
            } else if (p.length === 5) {
                value =
                    anyObj[p[0]][p[1]] &&
                    typeof anyObj[p[0]][p[1]] === 'object' &&
                    anyObj[p[0]][p[1]][p[2]] &&
                    anyObj[p[0]][p[1]][p[2]][p[3]]
                        ? anyObj[p[0]][p[1]][p[2]][p[3]][p[4]]
                        : null;
            } else if (p.length === 6) {
                value =
                    anyObj[p[0]][p[1]] &&
                    typeof anyObj[p[0]][p[1]] === 'object' &&
                    anyObj[p[0]][p[1]][p[2]] &&
                    anyObj[p[0]][p[1]][p[2]][p[3]] &&
                    anyObj[p[0]][p[1]][p[2]][p[3]][p[4]]
                        ? anyObj[p[0]][p[1]][p[2]][p[3]][p[4]][p[5]]
                        : null;
            }
            if (value === undefined || value === null) {
                return null;
            }
            return value;
        }
    }

    return null;
}

export function setCustomValue(obj: ioBroker.Object, it: AdapterColumn, value: string | number | boolean): boolean {
    if (obj?._id?.startsWith(`${it.adapter}.`) && it.path.length > 1) {
        const p = it.path;
        const anyObj: Record<string, any> = obj as Record<string, any>;
        if (anyObj[p[0]] && typeof anyObj[p[0]] === 'object') {
            if (p.length === 2) {
                // most common case
                anyObj[p[0]][p[1]] = value;
                return true;
            }
            if (p.length === 3) {
                if (anyObj[p[0]][p[1]] && typeof anyObj[p[0]][p[1]] === 'object') {
                    anyObj[p[0]][p[1]][p[2]] = value;
                    return true;
                }
            } else if (p.length === 4) {
                if (
                    anyObj[p[0]][p[1]] &&
                    typeof anyObj[p[0]][p[1]] === 'object' &&
                    anyObj[p[0]][p[1]][p[2]] &&
                    typeof anyObj[p[0]][p[1]][p[2]] === 'object'
                ) {
                    anyObj[p[0]][p[1]][p[2]][p[3]] = value;
                    return true;
                }
            } else if (p.length === 5) {
                if (
                    anyObj[p[0]][p[1]] &&
                    typeof anyObj[p[0]][p[1]] === 'object' &&
                    anyObj[p[0]][p[1]][p[2]] &&
                    typeof anyObj[p[0]][p[1]][p[2]] === 'object' &&
                    anyObj[p[0]][p[1]][p[2]][p[3]] &&
                    typeof anyObj[p[0]][p[1]][p[2]][p[3]] === 'object'
                ) {
                    anyObj[p[0]][p[1]][p[2]][p[3]][p[4]] = value;
                    return true;
                }
            } else if (p.length === 6) {
                if (
                    anyObj[p[0]][p[1]] &&
                    typeof anyObj[p[0]][p[1]] === 'object' &&
                    anyObj[p[0]][p[1]][p[2]] &&
                    typeof anyObj[p[0]][p[1]][p[2]] === 'object' &&
                    anyObj[p[0]][p[1]][p[2]][p[3]] &&
                    typeof anyObj[p[0]][p[1]][p[2]][p[3]] === 'object' &&
                    anyObj[p[0]][p[1]][p[2]][p[3]][p[4]] &&
                    typeof anyObj[p[0]][p[1]][p[2]][p[3]][p[4]] === 'object'
                ) {
                    anyObj[p[0]][p[1]][p[2]][p[3]][p[4]][p[5]] = value;
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Check if it is a non-expert id
 *
 * @param id id to test
 */
export function isNonExpertId(id: string): boolean {
    return !!NON_EXPERT_NAMESPACES.find(saveNamespace => id.startsWith(saveNamespace));
}
