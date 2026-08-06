/**
 * Copyright 2020-2026, Denis Haev <dogafox@gmail.com>
 *
 * MIT License
 *
 * Part of the object browser, see ./ObjectBrowserClass.tsx
 */
import React, { type JSX } from 'react';
import { Utils } from '../Utils';
import { Box, Checkbox, Grid, IconButton, Paper, Switch, Tooltip } from '@mui/material';
import {
    Delete as IconDelete,
    Edit as IconEdit,
    Error as IconError,
    Settings as IconConfig,
    Wifi as IconConnection,
    WifiOff as IconDisconnected,
} from '@mui/icons-material';
import { IconCopy } from '../../icons/IconCopy';
import { IconDocument } from '../../icons/IconDocument';
import { IconDocumentReadOnly } from '../../icons/IconDocumentReadOnly';
import { IconClosed } from '../../icons/IconClosed';
import { IconOpen } from '../../icons/IconOpen';
import { Icon } from '../Icon';
import {
    ButtonIcon,
    colGrow,
    colWidth,
    binarySearch,
    findEnumsForObjectAsIds,
    findFunctionsForObject,
    findRoomsForObject,
    formatValue,
    getCustomValue,
    getIdFieldTooltip,
    getObjectTooltip,
    getValueStyle,
    isNonExpertId,
    COLOR_NAME_USERDATA,
    COLOR_NAME_ALIAS,
    COLOR_NAME_JAVASCRIPT,
    COLOR_NAME_SYSTEM,
    COLOR_NAME_SYSTEM_ADAPTER,
    ROW_HEIGHT,
} from './utils';
import { type AdapterColumn, type TreeItem } from './types';
import { styles } from './styles';
import {
    COLOR_NAME_CONNECTED_DARK,
    COLOR_NAME_CONNECTED_LIGHT,
    COLOR_NAME_DISCONNECTED_DARK,
    COLOR_NAME_DISCONNECTED_LIGHT,
    COLOR_NAME_ERROR_DARK,
    COLOR_NAME_ERROR_LIGHT,
    DEFAULT_DATE_FORMAT,
    ITEM_IMAGES,
} from './constants';
import type { ObjectBrowserClass } from './ObjectBrowserClass';

export function renderTooltipAccessControl(that: ObjectBrowserClass, acl: ioBroker.StateACL): null | JSX.Element {
    // acl ={object,state,owner,ownerGroup}
    if (!acl) {
        return null;
    }
    const check = [
        {
            value: '0x400',
            valueNum: 0x400,
            title: 'read',
            group: 'Owner',
        },
        {
            value: '0x200',
            valueNum: 0x200,
            title: 'write',
            group: 'Owner',
        },
        {
            value: '0x40',
            valueNum: 0x40,
            title: 'read',
            group: 'Group',
        },
        {
            value: '0x20',
            valueNum: 0x20,
            title: 'write',
            group: 'Group',
        },
        {
            value: '0x4',
            valueNum: 0x4,
            title: 'read',
            group: 'Everyone',
        },
        {
            value: '0x2',
            valueNum: 0x2,
            title: 'write',
            group: 'Everyone',
        },
    ];
    const arrayTooltipText = [];
    const funcRenderStateObject = (value: 'object' | 'state'): void => {
        const rights: number = acl[value];
        check.forEach((el, i) => {
            if (rights & el.valueNum) {
                arrayTooltipText.push(
                    <span key={value + i}>
                        {that.texts[`acl${el.group}_${el.title}_${value}`]},
                        <span style={value === 'object' ? styles.rightsObject : styles.rightsState}>{el.value}</span>
                    </span>,
                );
            }
        });
    };

    arrayTooltipText.push(
        <span key="group">{`${that.texts.ownerGroup}: ${(acl.ownerGroup || '').replace('system.group.', '')}`}</span>,
    );
    arrayTooltipText.push(
        <span key="owner">{`${that.texts.ownerUser}: ${(acl.owner || '').replace('system.user.', '')}`}</span>,
    );
    funcRenderStateObject('object');
    if (acl.state) {
        funcRenderStateObject('state');
    }

    return arrayTooltipText.length ? (
        <span style={styles.tooltipAccessControl}>{arrayTooltipText.map(el => el)}</span>
    ) : null;
}

export function renderColumnButtons(
    that: ObjectBrowserClass,
    id: string,
    item: TreeItem,
): (JSX.Element | null)[] | JSX.Element | null {
    if (!item.data.obj) {
        return that.props.onObjectDelete || that.props.objectEditOfAccessControl ? (
            <div style={styles.buttonDiv}>
                {that.state.filter.expertMode && that.props.objectEditOfAccessControl ? (
                    <IconButton
                        sx={{
                            ...styles.cellButtonsButton,
                            ...styles.cellButtonsEmptyButton,
                            ...styles.cellButtonMinWidth,
                        }}
                        onClick={() => that.setState({ modalEditOfAccess: true, modalEditOfAccessObjData: item.data })}
                        size="large"
                    >
                        <div style={{ height: 15 }}>---</div>
                    </IconButton>
                ) : null}
                {that.props.onObjectDelete && item.children?.length ? (
                    <IconButton
                        sx={{
                            ...styles.cellButtonsButton,
                            ...styles.cellButtonsButtonAlone,
                        }}
                        size="small"
                        aria-label="delete"
                        title={that.texts.deleteObject}
                        onClick={() => {
                            // calculate the number of children
                            const keys = Object.keys(that.objects);
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

                            if (that.props.onObjectDelete) {
                                that.props.onObjectDelete(id, !!item.children?.length, false, count + 1);
                            }
                        }}
                    >
                        <IconDelete style={styles.cellButtonsButtonIcon} />
                    </IconButton>
                ) : null}
            </div>
        ) : null;
    }

    item.data.aclTooltip =
        item.data.aclTooltip || renderTooltipAccessControl(that, item.data.obj.acl as ioBroker.StateACL);

    const acl = item.data.obj.acl
        ? item.data.obj.type === 'state'
            ? item.data.obj.acl.state
            : item.data.obj.acl.object
        : 0;
    const aclSystemConfig =
        item.data.obj.acl &&
        (item.data.obj.type === 'state'
            ? that.systemConfig?.common.defaultNewAcl.state
            : that.systemConfig?.common.defaultNewAcl.object);

    const showEdit = !!item.data.obj && (that.state.filter.expertMode || isNonExpertId(item.data.id));

    return [
        that.state.filter.expertMode && that.props.objectEditOfAccessControl ? (
            <Tooltip
                key="acl"
                title={item.data.aclTooltip}
                slotProps={{ popper: { sx: styles.tooltip } }}
            >
                <IconButton
                    sx={{
                        ...styles.cellButtonsButton,
                        ...styles.cellButtonMinWidth,
                        opacity: 1,
                    }}
                    onClick={() => that.setState({ modalEditOfAccess: true, modalEditOfAccessObjData: item.data })}
                    size="large"
                >
                    <div style={styles.aclText}>
                        {Number.isNaN(Number(acl)) ? Number(aclSystemConfig).toString(16) : Number(acl).toString(16)}
                    </div>
                </IconButton>
            </Tooltip>
        ) : (
            <div
                key="aclEmpty"
                style={styles.cellButtonMinWidth}
            />
        ),

        showEdit ? (
            <IconButton
                key="edit"
                sx={{
                    marginRight: '2px',
                    ...styles.cellButtonsButton,
                }}
                size="small"
                aria-label="edit"
                title={that.texts.editObject}
                onClick={() => {
                    that.localStorage.setItem(`${that.props.dialogName || 'App'}.objectSelected`, id);
                    that.setState({ editObjectDialog: id, editObjectAlias: false });
                }}
            >
                <IconEdit style={styles.cellButtonsButtonIcon} />
            </IconButton>
        ) : (
            <Box
                component="div"
                key="editDisabled"
                sx={styles.cellButtonsButton}
            />
        ),

        that.props.onObjectDelete && (item.children?.length || !item.data.obj.common?.dontDelete) ? (
            <IconButton
                key="delete"
                sx={styles.cellButtonsButton}
                size="small"
                aria-label="delete"
                onClick={() => {
                    const keys = Object.keys(that.objects);
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
                    if (that.props.onObjectDelete) {
                        that.props.onObjectDelete(
                            id,
                            !!item.children?.length,
                            !item.data.obj?.common?.dontDelete,
                            count,
                        );
                    }
                }}
                title={that.texts.deleteObject}
            >
                <IconDelete style={styles.cellButtonsButtonIcon} />
            </IconButton>
        ) : null,

        that.props.objectCustomDialog &&
        that.info.hasSomeCustoms &&
        item.data.obj.type === 'state' &&
        // @ts-expect-error deprecated from js-controller 6
        item.data.obj.common?.type !== 'file' ? (
            <IconButton
                sx={{
                    ...styles.cellButtonsButton,
                    ...(item.data.hasCustoms
                        ? that.styles.cellButtonsButtonWithCustoms
                        : styles.cellButtonsButtonWithoutCustoms),
                }}
                key="custom"
                size="small"
                aria-label="config"
                title={that.texts.customConfig}
                onClick={() => {
                    that.localStorage.setItem(`${that.props.dialogName || 'App'}.objectSelected`, id);

                    that.pauseSubscribe(true);
                    that.props.router?.doNavigate(null, 'customs', id);
                    that.setState({ customDialog: [id], customDialogAll: false });
                }}
            >
                <IconConfig style={styles.cellButtonsButtonIcon} />
            </IconButton>
        ) : null,
    ];
}

/**
 * This function renders the value in different forms in the table
 *
 * @param that the object browser instance
 * @param id state ID
 * @param item Item
 * @param narrowStyleWithDetails if use mobile view
 */
export function renderColumnValue(
    that: ObjectBrowserClass,
    id: string,
    item: TreeItem,
    narrowStyleWithDetails?: boolean,
): JSX.Element | null {
    const obj = item.data.obj;
    if (!obj || !that.states) {
        return null;
    }

    if (obj.common?.type === 'file') {
        return (
            <Box
                component="div"
                sx={{ ...styles.cellValueText, ...styles.cellValueFile }}
            >
                [file]
            </Box>
        );
    }
    if (!that.states[id]) {
        if (obj.type === 'state') {
            // we are waiting for state
            if (!that.recordStates.includes(id)) {
                that.recordStates.push(id);
            }
            that.states[id] = { val: null } as ioBroker.State;
            that.subscribe(id);
        }
        return null;
    }
    if (!that.recordStates.includes(id)) {
        that.recordStates.push(id);
    }

    const state = that.states[id];

    let info = item.data.state;
    if (!info) {
        const { valText } = formatValue({
            state,
            obj: obj as ioBroker.StateObject,
            texts: that.texts,
            dateFormat: that.props.dateFormat || that.systemConfig?.common.dateFormat || DEFAULT_DATE_FORMAT,
            isFloatComma:
                that.props.isFloatComma === undefined
                    ? (that.systemConfig?.common.isFloatComma ?? true)
                    : that.props.isFloatComma,
        });
        const valTextRx: JSX.Element[] = [];
        item.data.state = { valTextRx };

        valTextRx.push(
            <span
                className={`newValueBrowser-${that.props.themeType || 'light'}`}
                key={`${valText.v.toString()}valText`}
                style={{
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {valText.v.toString()}
            </span>,
        );
        if (valText.u) {
            valTextRx.push(
                <span
                    className={`newValueBrowser-${that.props.themeType || 'light'}`}
                    style={styles.cellValueTextUnit}
                    key={`${valText.v.toString()}unit`}
                >
                    {valText.u}
                </span>,
            );
        }
        if (valText.s !== undefined) {
            valTextRx.push(
                <span
                    style={styles.cellValueTextState}
                    className={`newValueBrowser-${that.props.themeType || 'light'}`}
                    key={`${valText.v.toString()}states`}
                >
                    ({valText.s})
                </span>,
            );
        }
        if (!narrowStyleWithDetails) {
            const copyText = valText.c !== undefined ? valText.c : valText.v || '';
            valTextRx.push(
                <IconCopy
                    className="copyButton"
                    style={that.styles.iconCopy}
                    onClick={e => that.onCopy(e, copyText)}
                    key="cc"
                />,
            );
        }
        // <IconEdit className="copyButton" style={{{ ...styles.cellButtonsValueButton, styles.cellButtonsValueButtonEdit)} key="ce" />

        info = item.data.state;
    }

    info.style = getValueStyle({
        state,
        isExpertMode: that.state.filter.expertMode,
        isButton: item.data.button,
        nonAckColor: that.props.theme.palette.nonAck,
    });

    let val: JSX.Element[] | null | undefined = info.valTextRx;
    if (!that.state.filter.expertMode) {
        if (item.data.button) {
            val = [
                <ButtonIcon
                    key="button"
                    style={{ color: info.style.color, ...styles.cellValueButton }}
                />,
            ];
        } else if (item.data.switch) {
            val = [
                <Switch
                    key="switch"
                    sx={{
                        '& .MuiSwitch-thumb': { color: info.style.color },
                        '& .MuiSwitch-track': {
                            backgroundColor:
                                !!that.states[id].val && that.state.selected.includes(id)
                                    ? that.props.themeType === 'dark'
                                        ? '#FFF !important'
                                        : '#111 !important'
                                    : undefined,
                        },
                    }}
                    checked={!!that.states[id].val}
                />,
            ];
        }
    }

    return (
        <Tooltip
            key="value"
            title={that.state.tooltipInfo?.el}
            slotProps={{
                popper: { sx: styles.cellValueTooltipBox },
                tooltip: { sx: styles.cellValueTooltip },
            }}
            onOpen={() => that.getTooltipInfo(id)}
            onClose={() => that.state.tooltipInfo?.id === id && that.setState({ tooltipInfo: null })}
        >
            <Box
                component="div"
                style={info.style}
                className={item.data.url ? 'iob-link' : undefined}
                sx={{
                    ...styles.cellValueText,
                    height: narrowStyleWithDetails ? undefined : ROW_HEIGHT,
                    '& .admin-button:active': {
                        transform: 'translate(0, 2px)',
                    },
                }}
            >
                {val}
            </Box>
        </Tooltip>
    );
}

/**
 * Renders a custom value.
 */
export function renderCustomValue(
    that: ObjectBrowserClass,
    obj: ioBroker.Object,
    it: AdapterColumn,
    item: TreeItem,
): JSX.Element | null {
    const text = getCustomValue(obj, it);
    if (text !== null && text !== undefined) {
        if (it.edit && !that.props.notEditable && (!it.objTypes || it.objTypes.includes(obj.type))) {
            return (
                <Box
                    component="div"
                    style={{
                        ...styles.columnCustom,
                        ...styles.columnCustomEditable,
                        ...styles[`columnCustom_${it.align}`],
                    }}
                    onClick={() =>
                        that.setState({
                            columnsEditCustomDialog: { item, it, obj },
                            customColumnDialogValueChanged: false,
                        })
                    }
                >
                    {text}
                </Box>
            );
        }
        return (
            <Box
                component="div"
                style={{
                    ...styles.columnCustom,
                    ...styles[`columnCustom_${it.align}`],
                }}
            >
                {text}
            </Box>
        );
    }
    return null;
}

export function renderAliasLink(
    that: ObjectBrowserClass,
    id: string,
    index?: number,
    customStyle?: Record<string, any>,
): JSX.Element | null {
    const _index = index || 0;
    // read the type of operation
    const aliasObj = that.objects[that.info.aliasesMap[id][_index]].common.alias.id;
    if (aliasObj) {
        return (
            <Box
                component="div"
                onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    const aliasId = that.info.aliasesMap[id][_index];
                    // if more than one alias, close the menu
                    if (that.info.aliasesMap[id].length > 1) {
                        that.setState({ aliasMenu: '' });
                    }
                    that.onSelect(aliasId);
                    setTimeout(() => that.expandAllSelected(() => that.scrollToItem(aliasId)), 100);
                }}
                sx={customStyle || that.styles.aliasAlone}
            >
                <span className="admin-browser-arrow">
                    {typeof aliasObj === 'string' || (aliasObj.read === id && aliasObj.write === id)
                        ? '↔'
                        : aliasObj.read === id
                          ? '→'
                          : '←'}
                </span>
                {that.info.aliasesMap[id][_index]}
            </Box>
        );
    }

    return null;
}

/**
 * Renders a leaf.
 */
export function renderLeaf(
    that: ObjectBrowserClass,
    item: TreeItem,
    isExpanded: boolean | undefined,
    counter: { count: number },
): { row: JSX.Element; details: JSX.Element | null } {
    const id = item.data.id;
    counter.count++;
    isExpanded = isExpanded === undefined ? that.state.expanded.includes(id) : isExpanded;

    // icon
    let iconFolder;
    const obj = item.data.obj;
    const itemType = obj?.type;

    if (
        item.children ||
        itemType === 'folder' ||
        itemType === 'device' ||
        itemType === 'channel' ||
        itemType === 'meta'
    ) {
        iconFolder = isExpanded ? (
            <IconOpen
                style={that.styles.cellIdIconFolder}
                onClick={() => that.toggleExpanded(id)}
            />
        ) : (
            <IconClosed
                style={that.styles.cellIdIconFolder}
                onClick={() => that.toggleExpanded(id)}
            />
        );
    } else if (obj && obj.common && obj.common.write === false && obj.type === 'state') {
        iconFolder = <IconDocumentReadOnly style={that.styles.cellIdIconDocument} />;
    } else {
        iconFolder = <IconDocument style={that.styles.cellIdIconDocument} />;
    }

    let iconItem = null;
    if (item.data.icon) {
        if (typeof item.data.icon === 'string') {
            if (item.data.icon.length < 3) {
                iconItem = (
                    <span
                        className="iconOwn"
                        style={styles.cellIdIconOwn}
                    >
                        {item.data.icon}
                    </span>
                ); // utf-8 char
            } else {
                iconItem = (
                    <Icon
                        style={styles.cellIdIconOwn}
                        className="iconOwn"
                        src={item.data.icon}
                        alt=""
                    />
                );
            }
        } else {
            iconItem = item.data.icon;
        }
    }

    const common = obj?.common;

    const typeImg = (obj?.type && ITEM_IMAGES[obj.type]) || <div className="itemIcon" />;

    const paddingLeft = that.levelPadding * (item.data.level || 0);

    // recalculate rooms and function names if the language changed
    if (item.data.lang !== that.props.lang) {
        const { rooms, per } = findRoomsForObject(that.info, id, that.props.lang);
        item.data.rooms = rooms.join(', ');
        item.data.per = per;
        const { funcs, pef } = findFunctionsForObject(that.info, id, that.props.lang);
        item.data.funcs = funcs.join(', ');
        item.data.pef = pef;
        item.data.lang = that.props.lang;
    }

    const checkbox =
        that.props.multiSelect &&
        that.objects[id] &&
        (!that.props.types || that.props.types.includes(that.objects[id].type)) ? (
            <Checkbox
                style={styles.checkBox}
                checked={that.state.selected.includes(id)}
            />
        ) : null;

    let valueEditable =
        !that.props.notEditable && itemType === 'state' && (that.state.filter.expertMode || common?.write !== false);
    if (that.props.objectBrowserViewFile && common?.type === 'file') {
        valueEditable = true;
    }

    const enumEditable =
        !that.props.notEditable &&
        that.objects[id] &&
        (that.state.filter.expertMode || itemType === 'state' || itemType === 'channel' || itemType === 'device');

    const checkVisibleObjectType =
        that.state.statesView && (itemType === 'state' || itemType === 'channel' || itemType === 'device');

    let newValue = '';
    const newValueTitle = [];
    if (checkVisibleObjectType) {
        newValue = that.states[id]?.from;
        if (newValue === undefined) {
            newValue = '&nbsp;';
        } else {
            newValue = newValue ? newValue.replace(/^system\.adapter\.|^system\./, '') : '';
            newValueTitle.push(`${that.texts.stateChangedFrom} ${newValue}`);
        }
        if (obj?.user) {
            const user = obj.user.replace('system.user.', '');
            newValue += `/${user}`;
            newValueTitle.push(`${that.texts.stateChangedBy} ${user}`);
        }
    }

    if (obj) {
        if (obj.from) {
            newValueTitle.push(
                `${that.texts.objectChangedFrom} ${obj.from.replace(/^system\.adapter\.|^system\./, '')}`,
            );
        }
        if (obj.user) {
            newValueTitle.push(`${that.texts.objectChangedBy} ${obj.user.replace(/^system\.user\./, '')}`);
        }
        if (obj.ts) {
            newValueTitle.push(
                `${that.texts.objectChangedByUser} ${Utils.formatDate(new Date(obj.ts), that.props.dateFormat || that.systemConfig?.common.dateFormat || DEFAULT_DATE_FORMAT)}`,
            );
        }
    }

    let readWriteAlias = false;
    let alias: JSX.Element | null = null;
    if (id.startsWith('alias.') && common?.alias?.id) {
        readWriteAlias = typeof common.alias.id === 'object';
        if (readWriteAlias) {
            alias = (
                <div style={styles.cellIdAliasReadWriteDiv}>
                    {common.alias.id.read ? (
                        <Box
                            component="div"
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                that.onSelect(common.alias.id.read);
                                setTimeout(
                                    () => that.expandAllSelected(() => that.scrollToItem(common.alias.id.read)),
                                    100,
                                );
                            }}
                            sx={that.styles.aliasReadWrite}
                        >
                            ←{common.alias.id.read}
                        </Box>
                    ) : null}
                    {common.alias.id.write ? (
                        <Box
                            component="div"
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                that.onSelect(common.alias.id.write);
                                setTimeout(
                                    () => that.expandAllSelected(() => that.scrollToItem(common.alias.id.write)),
                                    100,
                                );
                            }}
                            sx={that.styles.aliasReadWrite}
                        >
                            →{common.alias.id.write}
                        </Box>
                    ) : null}
                </div>
            );
        } else {
            alias = (
                <Box
                    component="div"
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        that.onSelect(common.alias.id);
                        setTimeout(() => that.expandAllSelected(() => that.scrollToItem(common.alias.id)), 100);
                    }}
                    sx={that.styles.aliasAlone}
                >
                    →{common.alias.id}
                </Box>
            );
        }
    } else if (that.info.aliasesMap[id]) {
        // Some alias points to that object. It can be more than one
        if (that.info.aliasesMap[id].length > 1) {
            // Show number of aliases and open a menu by click
            alias = (
                <Box
                    component="div"
                    id={`alias_${id}`}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        that.setState({ aliasMenu: id });
                    }}
                    sx={that.styles.aliasAlone}
                >
                    {that.props.t('ra_%s links from aliases', that.info.aliasesMap[id].length)}
                </Box>
            );
        } else {
            // Show name of alias and open it by click
            alias = renderAliasLink(that, id, 0);
        }
    }

    let checkColor = common?.color;
    let invertBackground;
    if (checkColor && !that.state.selected.includes(id)) {
        // Only a rough reference value for the distance check, so the type is enough. Asking for the
        // name meant that every theme beyond "dark" and "blue" - "modernDark" among them - was
        // compared against white and the contrast was judged wrongly.
        const background = that.props.themeType === 'dark' ? '#1f1f1f' : '#FFFFFF';
        const distance = Utils.colorDistance(checkColor, background);
        // console.log(`Distance: ${checkColor} - ${background} = ${distance}`);
        if (distance < 1000) {
            invertBackground = that.props.themeType === 'dark' ? '#9a9a9a' : '#565656';
        }
    }
    let bold = false;
    if (id === '0_userdata') {
        checkColor = COLOR_NAME_USERDATA(that.props.themeType);
        bold = true;
        invertBackground = false;
    } else if (id === 'alias') {
        checkColor = COLOR_NAME_ALIAS(that.props.themeType);
        bold = true;
        invertBackground = false;
    } else if (id === 'javascript') {
        checkColor = COLOR_NAME_JAVASCRIPT(that.props.themeType);
        bold = true;
        invertBackground = false;
    } else if (id === 'system') {
        checkColor = COLOR_NAME_SYSTEM(that.props.themeType);
        bold = true;
        invertBackground = false;
    } else if (id === 'system.adapter') {
        checkColor = COLOR_NAME_SYSTEM_ADAPTER(that.props.themeType);
        invertBackground = false;
    } else if (!checkColor || that.state.selected.includes(id)) {
        checkColor = 'inherit';
        invertBackground = false;
    }

    const icons = [];

    if (common?.statusStates) {
        const ids: Record<string, string> = {};
        Object.keys(common.statusStates).forEach(name => {
            let _id = common.statusStates[name];
            if (_id.split('.').length < 3) {
                _id = `${id}.${_id}`;
            }
            ids[name] = _id;

            if (!that.states[_id]) {
                if (that.objects[_id]?.type === 'state') {
                    if (!that.recordStates.includes(_id)) {
                        that.recordStates.push(_id);
                    }
                    that.states[_id] = { val: null } as ioBroker.State;
                    that.subscribe(_id);
                }
            } else if (!that.recordStates.includes(_id)) {
                that.recordStates.push(_id);
            }
        });
        // calculate color
        // errorId has priority
        let colorSet = false;
        if (common.statusStates.errorId && that.states[ids.errorId] && that.states[ids.errorId].val) {
            checkColor = that.props.themeType === 'dark' ? COLOR_NAME_ERROR_DARK : COLOR_NAME_ERROR_LIGHT;
            invertBackground = false;
            colorSet = true;
            icons.push(
                <IconError
                    key="error"
                    // title={that.texts.deviceError}
                    style={that.styles.iconDeviceError}
                />,
            );
        }

        if (ids.onlineId && that.states[ids.onlineId]) {
            if (!colorSet) {
                if (that.states[ids.onlineId].val) {
                    checkColor =
                        that.props.themeType === 'dark' ? COLOR_NAME_CONNECTED_DARK : COLOR_NAME_CONNECTED_LIGHT;
                    invertBackground = false;
                    icons.push(
                        <IconConnection
                            key="conn"
                            // title={that.texts.deviceError}
                            style={that.styles.iconDeviceConnected}
                        />,
                    );
                } else {
                    checkColor =
                        that.props.themeType === 'dark' ? COLOR_NAME_DISCONNECTED_DARK : COLOR_NAME_DISCONNECTED_LIGHT;
                    invertBackground = false;
                    icons.push(
                        <IconDisconnected
                            key="disc"
                            // title={that.texts.deviceError}
                            style={that.styles.iconDeviceDisconnected}
                        />,
                    );
                }
            } else if (that.states[ids.onlineId].val) {
                icons.push(
                    <IconConnection
                        key="conn"
                        // title={that.texts.deviceError}
                        style={that.styles.iconDeviceConnected}
                    />,
                );
            } else {
                icons.push(
                    <IconDisconnected
                        key="disc"
                        // title={that.texts.deviceError}
                        style={that.styles.iconDeviceDisconnected}
                    />,
                );
            }
        } else if (ids.offlineId && that.states[ids.offlineId]) {
            if (!colorSet) {
                if (that.states[ids.offlineId].val) {
                    checkColor =
                        that.props.themeType === 'dark' ? COLOR_NAME_DISCONNECTED_DARK : COLOR_NAME_DISCONNECTED_LIGHT;
                    invertBackground = false;
                    icons.push(
                        <IconDisconnected
                            key="disc"
                            // title={that.texts.deviceError}
                            style={that.styles.iconDeviceDisconnected}
                        />,
                    );
                } else {
                    checkColor =
                        that.props.themeType === 'dark' ? COLOR_NAME_CONNECTED_DARK : COLOR_NAME_CONNECTED_LIGHT;
                    invertBackground = false;
                    icons.push(
                        <IconConnection
                            key="conn"
                            // title={that.texts.deviceError}
                            style={that.styles.iconDeviceConnected}
                        />,
                    );
                }
            } else if (that.states[ids.offlineId].val) {
                icons.push(
                    <IconDisconnected
                        key="disc"
                        // title={that.texts.deviceError}
                        style={that.styles.iconDeviceDisconnected}
                    />,
                );
            } else {
                icons.push(
                    <IconConnection
                        key="conn"
                        // title={that.texts.deviceError}
                        style={that.styles.iconDeviceConnected}
                    />,
                );
            }
        }
    }

    const q = checkVisibleObjectType ? Utils.quality2text(that.states[id]?.q || 0).join(', ') : null;

    let name: JSX.Element[] | string = item.data?.title || '';
    let useDesc = false;
    if (that.state.showDescription) {
        const oTooltip: string | null = getObjectTooltip(item.data, that.props.lang);
        if (oTooltip) {
            name = [
                <div
                    key="name"
                    style={styles.cellNameDivDiv}
                >
                    {name}
                </div>,
                <div
                    key="desc"
                    style={styles.cellDescription}
                >
                    {oTooltip}
                </div>,
            ];
            useDesc = !!oTooltip;
        }
    }

    const narrowStyleWithDetails = that.width === 'xs' && that.state.focused === id;

    const colID = (
        <Grid
            container
            wrap="nowrap"
            direction="row"
            sx={styles.cellId}
            style={{ width: colWidth('id'), flexGrow: colGrow('id'), paddingLeft }}
        >
            <Grid
                container
                // the icons must not be squeezed by a long name
                sx={{ alignItems: 'center', flexShrink: 0 }}
            >
                {checkbox}
                {iconFolder}
            </Grid>
            <Grid
                style={{
                    ...styles.cellIdSpan,
                    // only the name may shrink (it is cut with an ellipsis), and for that a flex item
                    // needs `minWidth: 0`, otherwise its content defines the minimal width
                    minWidth: 0,
                    ...(invertBackground ? that.styles.invertedBackground : undefined),
                    color: checkColor,
                    fontWeight: bold ? 'bold' : undefined,
                }}
            >
                <Tooltip
                    title={getIdFieldTooltip(item.data, that.props.lang)}
                    slotProps={{ popper: { sx: styles.tooltip } }}
                >
                    <div>{item.data.name}</div>
                </Tooltip>
                {alias}
                {icons}
            </Grid>
            <div style={{ ...styles.grow, ...(invertBackground ? that.styles.invertedBackgroundFlex : {}) }} />
            <Grid
                container
                sx={{ alignItems: 'center', flexShrink: 0 }}
            >
                {iconItem}
            </Grid>
            {that.width !== 'xs' ? (
                <div style={{ flexShrink: 0 }}>
                    <IconCopy
                        className={narrowStyleWithDetails ? '' : 'copyButton'}
                        style={styles.cellCopyButton}
                        onClick={e => that.onCopy(e, id)}
                    />
                </div>
            ) : null}
        </Grid>
    );

    let colName =
        (narrowStyleWithDetails && name) || that.columnsVisibility.name ? (
            <Box
                component="div"
                sx={{
                    ...styles.cellName,
                    ...(useDesc ? styles.cellNameWithDesc : undefined),
                    width: that.width !== 'xs' ? colWidth('name') : undefined,
                    flexGrow: that.width !== 'xs' ? colGrow('name') : undefined,
                    // padding and not margin: a margin is added to the width of the column and all
                    // following columns would not match the header anymore
                    pl: narrowStyleWithDetails ? 0 : '5px',
                }}
            >
                {name}
                {!narrowStyleWithDetails && item.data?.title ? (
                    <Box style={{ color: checkColor }}>
                        <IconCopy
                            className="copyButton"
                            style={styles.cellCopyButton}
                            onClick={e => that.onCopy(e, item.data?.title)}
                        />
                    </Box>
                ) : null}
            </Box>
        ) : null;

    let colMiddle:
        | ({
              el: JSX.Element;
              type: 'filter_type' | 'filter_role' | 'filter_func' | 'filter_room' | 'quality' | 'from' | 'lc' | 'ts';
              onClick?: (() => void) | null | undefined;
          } | null)[]
        | null;
    if (!that.state.statesView) {
        colMiddle = [
            (narrowStyleWithDetails && obj?.type) || that.columnsVisibility.type
                ? {
                      el: (
                          <div
                              key="type"
                              style={{
                                  ...styles.cellType,
                                  width: that.width !== 'xs' ? colWidth('type') : undefined,
                              }}
                          >
                              {typeImg}
                              &nbsp;
                              {obj?.type}
                          </div>
                      ),
                      type: 'filter_type',
                  }
                : null,
            (narrowStyleWithDetails && common) || that.columnsVisibility.role
                ? {
                      el: (
                          <div
                              key="role"
                              style={{
                                  ...styles.cellRole,
                                  width: that.width !== 'xs' ? colWidth('role') : '100%',
                                  cursor:
                                      that.state.filter.expertMode && enumEditable && that.props.objectBrowserEditRole
                                          ? 'text'
                                          : 'default',
                              }}
                              onClick={
                                  !narrowStyleWithDetails &&
                                  that.state.filter.expertMode &&
                                  enumEditable &&
                                  that.props.objectBrowserEditRole
                                      ? () => that.setState({ roleDialog: item.data.id })
                                      : undefined
                              }
                          >
                              {common?.role}
                          </div>
                      ),
                      type: 'filter_role',
                      onClick:
                          narrowStyleWithDetails &&
                          that.state.filter.expertMode &&
                          enumEditable &&
                          that.props.objectBrowserEditRole
                              ? () => that.setState({ roleDialog: item.data.id })
                              : undefined,
                  }
                : null,
            (narrowStyleWithDetails && common) || that.columnsVisibility.room
                ? {
                      el: (
                          <div
                              key="room"
                              style={{
                                  ...styles.cellRoom,
                                  ...(item.data.per ? styles.cellEnumParent : {}),
                                  width: that.width !== 'xs' ? colWidth('room') : '100%',
                                  cursor: enumEditable ? 'text' : 'default',
                              }}
                              onClick={
                                  !narrowStyleWithDetails && enumEditable
                                      ? () => {
                                            const enums = findEnumsForObjectAsIds(that.info, item.data.id, 'roomEnums');
                                            that.setState({
                                                enumDialogEnums: enums,
                                                enumDialog: {
                                                    item,
                                                    type: 'room',
                                                    enumsOriginal: JSON.stringify(enums),
                                                },
                                            });
                                        }
                                      : undefined
                              }
                          >
                              {item.data.rooms}
                          </div>
                      ),
                      type: 'filter_room',
                      onClick:
                          narrowStyleWithDetails && enumEditable
                              ? () => {
                                    const enums = findEnumsForObjectAsIds(that.info, item.data.id, 'roomEnums');
                                    that.setState({
                                        enumDialogEnums: enums,
                                        enumDialog: {
                                            item,
                                            type: 'room',
                                            enumsOriginal: JSON.stringify(enums),
                                        },
                                    });
                                }
                              : undefined,
                  }
                : null,
            (narrowStyleWithDetails && common) || that.columnsVisibility.func
                ? {
                      el: (
                          <div
                              key="func"
                              style={{
                                  ...styles.cellFunc,
                                  ...(item.data.pef ? styles.cellEnumParent : {}),
                                  width: that.width !== 'xs' ? colWidth('func') : '100%',
                                  cursor: enumEditable ? 'text' : 'default',
                              }}
                              onClick={
                                  !narrowStyleWithDetails && enumEditable
                                      ? () => {
                                            const enums = findEnumsForObjectAsIds(that.info, item.data.id, 'funcEnums');
                                            that.setState({
                                                enumDialogEnums: enums,
                                                enumDialog: {
                                                    item,
                                                    type: 'func',
                                                    enumsOriginal: JSON.stringify(enums),
                                                },
                                            });
                                        }
                                      : undefined
                              }
                          >
                              {item.data.funcs}
                          </div>
                      ),
                      type: 'filter_func',
                      onClick:
                          narrowStyleWithDetails && enumEditable
                              ? () => {
                                    const enums = findEnumsForObjectAsIds(that.info, item.data.id, 'funcEnums');
                                    that.setState({
                                        enumDialogEnums: enums,
                                        enumDialog: {
                                            item,
                                            type: 'func',
                                            enumsOriginal: JSON.stringify(enums),
                                        },
                                    });
                                }
                              : undefined,
                  }
                : null,
        ];
    } else {
        colMiddle = [
            (narrowStyleWithDetails && checkVisibleObjectType && that.states[id]?.from) ||
            that.columnsVisibility.changedFrom
                ? {
                      el: (
                          <div
                              key="from"
                              style={{
                                  ...styles.cellRole,
                                  width: that.width !== 'xs' ? colWidth('changedFrom') : undefined,
                              }}
                              title={newValueTitle.join('\n')}
                          >
                              {checkVisibleObjectType && that.states[id]?.from ? newValue : null}
                          </div>
                      ),
                      type: 'from',
                  }
                : null,
            (narrowStyleWithDetails && q) || that.columnsVisibility.qualityCode
                ? {
                      el: (
                          <div
                              key="q"
                              style={{
                                  ...styles.cellRole,
                                  width: that.width !== 'xs' ? colWidth('qualityCode') : undefined,
                              }}
                              title={q || ''}
                          >
                              {q}
                          </div>
                      ),
                      type: 'quality',
                  }
                : null,
            (narrowStyleWithDetails && checkVisibleObjectType && that.states[id]?.ts) ||
            that.columnsVisibility.timestamp
                ? {
                      el: (
                          <div
                              key="ts"
                              style={{
                                  ...styles.cellRole,
                                  width: that.width !== 'xs' ? colWidth('timestamp') : undefined,
                              }}
                          >
                              {checkVisibleObjectType && that.states[id]?.ts
                                  ? Utils.formatDate(
                                        new Date(that.states[id].ts),
                                        that.props.dateFormat ||
                                            that.systemConfig?.common.dateFormat ||
                                            DEFAULT_DATE_FORMAT,
                                    )
                                  : null}
                          </div>
                      ),
                      type: 'ts',
                  }
                : null,
            (narrowStyleWithDetails && checkVisibleObjectType && that.states[id]?.lc) ||
            that.columnsVisibility.lastChange
                ? {
                      el: (
                          <div
                              key="lc"
                              style={{
                                  ...styles.cellRole,
                                  width: that.width !== 'xs' ? colWidth('lastChange') : undefined,
                              }}
                          >
                              {checkVisibleObjectType && that.states[id]?.lc
                                  ? Utils.formatDate(
                                        new Date(that.states[id].lc),
                                        that.props.dateFormat ||
                                            that.systemConfig?.common.dateFormat ||
                                            DEFAULT_DATE_FORMAT,
                                    )
                                  : null}
                          </div>
                      ),
                      type: 'lc',
                  }
                : null,
        ];
    }

    let colCustom: JSX.Element[] | null =
        that.adapterColumns?.map(it => (
            <div
                style={{
                    ...styles.cellAdapter,
                    width: that.width !== 'xs' ? colWidth(it.id) : undefined,
                }}
                key={it.id}
                title={`${it.adapter} => ${it.pathText}`}
            >
                {obj ? renderCustomValue(that, obj, it, item) : null}
            </div>
        )) || null;

    const columnValue =
        narrowStyleWithDetails || that.columnsVisibility.val
            ? renderColumnValue(that, id, item, narrowStyleWithDetails)
            : null;

    // A state that was never written has no value at all, so `renderColumnValue` returns null.
    // In the narrow layout that used to remove the whole cell - and with it the only way to tap
    // the value and open the editor. Keep the (empty) cell for editable states.
    const showValueCell = that.columnsVisibility.val || (narrowStyleWithDetails && (!!columnValue || valueEditable));

    let colValue = showValueCell ? (
            <div
                style={{
                    ...styles.cellValue,
                    width: that.width !== 'xs' ? colWidth('val') : 'calc(100% - 100px)',
                    cursor: valueEditable
                        ? common?.type === 'file'
                            ? 'zoom-in'
                            : item.data.button
                              ? 'grab'
                              : 'text'
                        : 'default',
                }}
                onClick={e => {
                    if (valueEditable) {
                        if (!obj || !that.states) {
                            // return;
                        } else if (common?.type === 'file') {
                            that.setState({ viewFileDialog: id });
                        } else if (item.data.url && e.ctrlKey) {
                            if (that.states[id]?.val && typeof that.states[id].val === 'string') {
                                if (common?.role === 'url.self') {
                                    window.location.href = that.states[id].val;
                                } else {
                                    const opened = window.open(that.states[id].val, '_blank');
                                    opened?.focus();
                                }
                            }
                        } else if (!that.state.filter.expertMode && item.data.button) {
                            // in non-expert mode control button directly
                            that.props.socket
                                .setState(id, true)
                                .catch(e => window.alert(`Cannot write state "${id}": ${e}`));
                        } else if (!that.state.filter.expertMode && item.data.switch) {
                            // in non-expert mode control switch directly
                            that.props.socket
                                .setState(id, !that.states[id].val)
                                .catch(e => window.alert(`Cannot write state "${id}": ${e}`));
                        } else {
                            that.edit = {
                                val: that.states[id] ? that.states[id].val : '',
                                q: that.states[id] ? that.states[id].q || 0 : 0,
                                ack: false,
                                id,
                            };
                            that.setState({ updateOpened: true });
                        }
                    } else if (common?.role === 'url' || (common?.role === 'url.blank' && e.ctrlKey)) {
                        if (that.states[id]?.val && typeof that.states[id].val === 'string') {
                            window.open(that.states[id].val, '_blank');
                        }
                    } else if (common?.role === 'url.self' && e.ctrlKey) {
                        if (that.states[id]?.val && typeof that.states[id].val === 'string') {
                            window.location.href = that.states[id].val;
                        }
                    }
                }}
            >
                {columnValue}
            </div>
        ) : null;

    let colButtons =
        narrowStyleWithDetails || that.columnsVisibility.buttons ? (
            <div
                style={{
                    ...styles.cellButtons,
                    width: that.width !== 'xs' ? colWidth('buttons') : undefined,
                }}
            >
                {renderColumnButtons(that, id, item)}
            </div>
        ) : null;

    let colDetails: JSX.Element | null = null;
    if (that.width === 'xs' && that.state.focused === id) {
        colMiddle = colMiddle.filter(a => a);
        let renderedMiddle: (JSX.Element | null)[] | null;
        if (!colMiddle.length) {
            renderedMiddle = null;
        } else {
            renderedMiddle = colMiddle.map(it => {
                if (!it) {
                    return null;
                }
                return (
                    <div
                        key={it.type}
                        style={styles.cellDetailsLine}
                    >
                        <span style={styles.cellDetailsName}>{that.texts[it.type]}:</span>
                        {it.el}
                        <div style={{ flexGrow: 1 }} />
                        {it.onClick ? (
                            <IconEdit
                                style={styles.cellCopyButtonInDetails}
                                onClick={() => {
                                    if (it?.onClick) {
                                        it.onClick();
                                    }
                                }}
                            />
                        ) : null}
                    </div>
                );
            });
        }
        if (!colCustom.length) {
            colCustom = null;
        }
        colDetails = (
            <Paper
                style={{
                    width: '100%',
                    // the padding must be inside of the width, else the row is wider than the table
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 10,
                    backgroundColor: that.props.theme.palette.mode === 'dark' ? '#333' : '#ccc',
                }}
            >
                <div style={styles.cellDetailsLine}>
                    <div style={{ flexGrow: 1 }} />
                    <IconCopy
                        style={styles.cellCopyButtonInDetails}
                        onClick={e => that.onCopy(e, id)}
                    />
                </div>
                {colName && (
                    <div style={styles.cellDetailsLine}>
                        <span style={styles.cellDetailsName}>{that.texts.name}:</span>
                        {colName}
                        <div style={{ flexGrow: 1 }} />
                        {item.data?.title ? (
                            <IconCopy
                                className="copyButton"
                                style={styles.cellCopyButtonInDetails}
                                onClick={e => that.onCopy(e, item.data?.title)}
                            />
                        ) : null}
                    </div>
                )}
                {renderedMiddle}
                {colCustom && <div style={styles.cellDetailsLine}>{colCustom}</div>}
                {that.objects[id]?.type === 'state' && (
                    <div style={styles.cellDetailsLine}>
                        <span style={styles.cellDetailsName}>{that.texts.value}:</span>
                        {colValue}
                        <div style={{ flexGrow: 1 }} />
                        <IconCopy
                            className="copyButton"
                            style={styles.cellCopyButtonInDetails}
                            onClick={e => {
                                const { valText } = formatValue({
                                    state: that.states[id],
                                    obj: that.objects[id] as ioBroker.StateObject,
                                    texts: that.texts,
                                    dateFormat:
                                        that.props.dateFormat ||
                                        that.systemConfig?.common.dateFormat ||
                                        DEFAULT_DATE_FORMAT,
                                    isFloatComma:
                                        that.props.isFloatComma === undefined
                                            ? (that.systemConfig?.common.isFloatComma ?? true)
                                            : that.props.isFloatComma,
                                });
                                that.onCopy(e, valText.c !== undefined ? valText.c : valText.v.toString());
                            }}
                            key="cc"
                        />
                    </div>
                )}
                {colButtons && <div style={{ ...styles.cellDetailsLine, justifyContent: 'right' }}>{colButtons}</div>}
            </Paper>
        );

        colName = null;
        colMiddle = null;
        colCustom = null;
        colValue = null;
        colButtons = null;
    }

    const row = (
        <Grid
            container
            direction="row"
            wrap="nowrap"
            sx={Utils.getStyle(
                that.props.theme,
                styles.tableRow,
                that.state.linesEnabled && styles.tableRowLines,
                !that.props.dragEnabled && styles.tableRowNoDragging,
                alias && styles.tableRowAlias,
                readWriteAlias && styles.tableRowAliasReadWrite,
                that.state.focused === id && that.props.multiSelect && styles.tableRowFocused,
                !item.data.visible && styles.filteredOut,
                item.data.hasVisibleParent &&
                    !item.data.visible &&
                    !item.data.hasVisibleChildren &&
                    styles.filteredParentOut,
                that.state.selected.includes(id) && styles.itemSelected,
                that.state.selectedNonObject === id && styles.itemSelected,
            )}
            key={id}
            id={id}
            onMouseDown={e => {
                that.onSelect(id);
                let isRightMB;
                if ('which' in e) {
                    // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
                    isRightMB = e.which === 3;
                } else if ('button' in e) {
                    // IE, Opera
                    isRightMB = e.button === 2;
                }
                if (isRightMB) {
                    that.contextMenu = {
                        item,
                        ts: Date.now(),
                    };
                } else {
                    that.contextMenu = null;
                }
            }}
            onDoubleClick={() => {
                if (!item.children) {
                    that.onSelect(id, true);
                } else {
                    that.toggleExpanded(id);
                }
            }}
        >
            {colID}
            {colName}
            {colMiddle?.map(it => it?.el)}
            {colCustom}
            {colValue}
            {colButtons}
        </Grid>
    );
    return { row, details: colDetails };
}

/**
 * Renders an item.
 */
export function renderItem(
    that: ObjectBrowserClass,
    root: TreeItem,
    isExpanded: boolean | undefined,
    counter?: { count: number },
): (JSX.Element | null)[] {
    const items: (JSX.Element | null)[] = [];
    counter = counter || { count: 0 };
    const result = renderLeaf(that, root, isExpanded, counter);
    let leaf: JSX.Element;
    const DragWrapper = that.props.DragWrapper;
    if (that.props.dragEnabled && DragWrapper) {
        if (root.data.sumVisibility) {
            leaf = (
                <DragWrapper
                    key={root.data.id}
                    item={root}
                    style={styles.draggable}
                >
                    {result.row}
                </DragWrapper>
            );
        } else {
            // change cursor
            leaf = (
                <div
                    key={root.data.id}
                    style={styles.nonDraggable}
                >
                    {result.row}
                </div>
            );
        }
    } else {
        leaf = result.row;
    }
    if (root.data.id && leaf) {
        items.push(leaf);
    }
    if (result.details) {
        items.push(result.details);
    }

    isExpanded = isExpanded === undefined ? binarySearch(that.state.expanded, root.data.id) : isExpanded;

    if (!root.data.id || isExpanded) {
        if (!that.state.foldersFirst) {
            if (root.children) {
                items.push(
                    root.children.map(item => {
                        // do not render too many items in column editor mode
                        if (!that.state.columnsSelectorShow || counter.count < 15) {
                            if (item.data.sumVisibility) {
                                return renderItem(that, item, undefined, counter);
                            }
                        }
                        return null;
                    }) as any as JSX.Element,
                );
            }
        } else if (root.children) {
            // first only folder
            items.push(
                root.children.map(item => {
                    if (item.children) {
                        // do not render too many items in column editor mode
                        if (!that.state.columnsSelectorShow || counter.count < 15) {
                            if (item.data.sumVisibility) {
                                return renderItem(that, item, undefined, counter);
                            }
                        }
                    }

                    return null;
                }) as any as JSX.Element,
            );

            // then items
            items.push(
                root.children.map(item => {
                    if (!item.children) {
                        // do not render too many items in column editor mode
                        if (!that.state.columnsSelectorShow || counter.count < 15) {
                            if (item.data.sumVisibility) {
                                return renderItem(that, item, undefined, counter);
                            }
                        }
                    }
                    return null;
                }) as any as JSX.Element,
            );
        }
    }

    return items;
}
