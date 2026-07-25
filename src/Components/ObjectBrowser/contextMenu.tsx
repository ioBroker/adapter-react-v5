/**
 * Copyright 2020-2026, Denis Haev <dogafox@gmail.com>
 *
 * MIT License
 *
 * Part of the object browser, see ./ObjectBrowserClass.tsx
 */
import React, { type JSX } from 'react';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import {
    Add as AddIcon,
    ArrowRight as ArrowRightIcon,
    BedroomParent,
    BorderColor,
    Construction,
    CreateNewFolder as IconFolder,
    Delete as IconDelete,
    Edit as IconEdit,
    FindInPage,
    FormatItalic as IconValueEdit,
    Link as IconLink,
    Settings as IconConfig,
    DriveFileRenameOutline,
} from '@mui/icons-material';
import { IconChannel } from '../../icons/IconChannel';
import { IconDevice } from '../../icons/IconDevice';
import { IconState } from '../../icons/IconState';
import { findEnumsForObjectAsIds, isNonExpertId } from './utils';
import { type ContextMenuItem } from './types';
import { styles } from './styles';
import type { ObjectBrowserClass } from './ObjectBrowserClass';

/**
 * Renders the right mouse button context menu
 */
export function renderContextMenu(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.showContextMenu) {
        return null;
    }
    const item = that.state.showContextMenu.item;
    const id = item.data.id;
    const items: JSX.Element[] = [];
    // const ctrl = isIOS() ? '⌘' : (that.props.lang === 'de' ? 'Strg+' : 'Ctrl+');

    const obj = item.data.obj;

    let showACL = '';
    if (that.props.objectEditOfAccessControl && that.state.filter.expertMode) {
        if (!obj) {
            showACL = '---';
        } else {
            const acl = obj.acl ? (obj.type === 'state' ? obj.acl.state : obj.acl.object) : 0;
            const aclSystemConfig =
                obj.acl &&
                (obj.type === 'state'
                    ? that.systemConfig?.common.defaultNewAcl.state
                    : that.systemConfig?.common.defaultNewAcl.object);
            showACL = Number.isNaN(Number(acl)) ? Number(aclSystemConfig).toString(16) : Number(acl).toString(16);
        }
    }

    const enumEditable =
        !that.props.notEditable &&
        obj &&
        (that.state.filter.expertMode || obj.type === 'state' || obj.type === 'channel' || obj.type === 'device');

    const createStateVisible =
        !item.data.obj ||
        item.data.obj.type === 'folder' ||
        item.data.obj.type === 'channel' ||
        item.data.obj.type === 'device' ||
        item.data.id === '0_userdata.0' ||
        item.data.obj.type === 'meta';
    const createChannelVisible =
        !item.data.obj ||
        item.data.obj.type === 'folder' ||
        item.data.obj.type === 'device' ||
        item.data.id === '0_userdata.0' ||
        item.data.obj.type === 'meta';
    const createDeviceVisible =
        !item.data.obj ||
        item.data.obj.type === 'folder' ||
        item.data.id === '0_userdata.0' ||
        item.data.obj.type === 'meta';
    const createFolderVisible =
        !item.data.obj ||
        item.data.obj.type === 'folder' ||
        item.data.id === '0_userdata.0' ||
        item.data.obj.type === 'meta';

    const ITEMS: Record<string, ContextMenuItem> = {
        EDIT: {
            key: '0',
            visibility: !!(
                that.props.objectBrowserEditObject &&
                obj &&
                (that.state.filter.expertMode || isNonExpertId(id))
            ),
            icon: (
                <IconEdit
                    fontSize="small"
                    style={that.styles.contextMenuEdit}
                />
            ),
            label: that.texts.editObject,
            onClick: () =>
                that.setState({ editObjectDialog: item.data.id, showContextMenu: null, editObjectAlias: false }),
        },
        EDIT_VALUE: {
            key: '1',
            visibility: !!(
                that.states &&
                !that.props.notEditable &&
                obj &&
                obj.type === 'state' &&
                // deprecated from js-controller 6
                (obj.common?.type as string) !== 'file' &&
                (that.state.filter.expertMode || obj.common.write !== false)
            ),
            icon: (
                <IconValueEdit
                    fontSize="small"
                    style={that.styles.contextMenuEditValue}
                />
            ),
            label: that.props.t('ra_Edit value'),
            onClick: () => {
                that.edit = {
                    val: that.states[id] ? that.states[id].val : '',
                    q: that.states[id]?.q || 0,
                    ack: false,
                    id,
                };
                that.setState({ updateOpened: true, showContextMenu: null });
            },
        },
        VIEW: {
            visibility:
                !!that.props.objectBrowserViewFile &&
                obj?.type === 'state' &&
                // deprecated from js-controller 6
                (obj.common?.type as string) === 'file',
            icon: (
                <FindInPage
                    fontSize="small"
                    style={that.styles.contextMenuView}
                />
            ),
            label: that.props.t('ra_View file'),
            onClick: () => that.setState({ viewFileDialog: obj?._id || '', showContextMenu: null }),
        },
        CUSTOM: {
            key: '2',
            visibility: !(
                that.props.objectCustomDialog &&
                that.info.hasSomeCustoms &&
                obj &&
                obj.type === 'state' &&
                // deprecated from js-controller 6
                (obj.common?.type as string) !== 'file'
            ),
            icon: (
                <IconConfig
                    fontSize="small"
                    style={
                        item.data.hasCustoms
                            ? that.styles.cellButtonsButtonWithCustoms
                            : styles.cellButtonsButtonWithoutCustoms
                    }
                />
            ),
            style: that.styles.contextMenuCustom,
            label: that.texts.customConfig,
            onClick: () => {
                that.pauseSubscribe(true);
                that.props.router?.doNavigate(null, 'customs', id);
                that.setState({ customDialog: [id], showContextMenu: null });
            },
        },
        ACL: {
            key: '3',
            visibility: !!showACL,
            icon: showACL,
            iconStyle: { fontSize: 'smaller' },
            listItemIconStyle: that.styles.contextMenuACL,
            style: that.styles.contextMenuACL,
            label: that.props.t('ra_Edit ACL'),
            onClick: () =>
                that.setState({
                    showContextMenu: null,
                    modalEditOfAccess: true,
                    modalEditOfAccessObjData: item.data,
                }),
        },
        ROLE: {
            key: '4',
            visibility: !!(that.state.filter.expertMode && enumEditable && that.props.objectBrowserEditRole),
            icon: (
                <BorderColor
                    fontSize="small"
                    style={that.styles.contextMenuRole}
                />
            ),
            label: that.props.t('ra_Edit role'),
            onClick: () => that.setState({ roleDialog: item.data.id, showContextMenu: null }),
        },
        FUNCTION: {
            key: '5',
            visibility: !!enumEditable,
            icon: (
                <BedroomParent
                    fontSize="small"
                    style={that.styles.contextMenuRole}
                />
            ),
            label: that.props.t('ra_Edit function'),
            onClick: () => {
                const enums = findEnumsForObjectAsIds(that.info, item.data.id, 'funcEnums');
                that.setState({
                    enumDialogEnums: enums,
                    enumDialog: {
                        item,
                        type: 'func',
                        enumsOriginal: JSON.stringify(enums),
                    },
                    showContextMenu: null,
                });
            },
        },
        ROOM: {
            key: '6',
            visibility: !!enumEditable,
            icon: (
                <Construction
                    fontSize="small"
                    style={that.styles.contextMenuRoom}
                />
            ),
            label: that.props.t('ra_Edit room'),
            onClick: () => {
                const enums = findEnumsForObjectAsIds(that.info, item.data.id, 'roomEnums');
                that.setState({
                    enumDialogEnums: enums,
                    enumDialog: {
                        item,
                        type: 'room',
                        enumsOriginal: JSON.stringify(enums),
                    },
                    showContextMenu: null,
                });
            },
        },
        ALIAS: {
            key: '7',
            visibility: !!(
                !that.props.notEditable &&
                that.props.objectBrowserAliasEditor &&
                that.props.objectBrowserEditObject &&
                obj?.type === 'state' &&
                // deprecated from js-controller 6
                (obj.common?.type as string) !== 'file'
            ),
            icon: (
                <IconLink
                    style={
                        obj?.common?.alias
                            ? that.styles.cellButtonsButtonWithCustoms
                            : styles.cellButtonsButtonWithoutCustoms
                    }
                />
            ),
            label:
                that.info.aliasesMap[item.data.id] || item.data.id.startsWith('alias.0.')
                    ? that.props.t('ra_Edit alias')
                    : that.props.t('ra_Create alias'),
            onClick: () => {
                if (obj?.common?.alias) {
                    that.setState({ showContextMenu: null, editObjectDialog: item.data.id, editObjectAlias: true });
                } else {
                    that.setState({ showContextMenu: null, showAliasEditor: item.data.id });
                }
            },
        },
        CREATE: {
            key: '+',
            visibility:
                (item.data.id.startsWith('0_userdata.0') || item.data.id.startsWith('javascript.')) &&
                (createStateVisible || createChannelVisible || createDeviceVisible || createFolderVisible),
            icon: (
                <AddIcon
                    fontSize="small"
                    style={that.styles.cellButtonsButtonWithCustoms}
                />
            ),
            style: styles.contextMenuWithSubMenu,
            label: that.texts.create,
            subMenu: [
                {
                    label: that.texts.createBooleanState,
                    visibility: createStateVisible,
                    icon: <IconState fontSize="small" />,
                    onClick: () => that.showAddDataPointDialog(item.data.id, 'state', 'boolean'),
                },
                {
                    label: that.texts.createNumberState,
                    visibility: createStateVisible,
                    icon: <IconState fontSize="small" />,
                    onClick: () => that.showAddDataPointDialog(item.data.id, 'state', 'number'),
                },
                {
                    label: that.texts.createStringState,
                    visibility: createStateVisible,
                    icon: <IconState fontSize="small" />,
                    onClick: () => that.showAddDataPointDialog(item.data.id, 'state', 'string'),
                },
                {
                    label: that.texts.createState,
                    visibility: createStateVisible,
                    icon: <IconState fontSize="small" />,
                    onClick: () => that.showAddDataPointDialog(item.data.id, 'state'),
                },
                {
                    label: that.texts.createChannel,
                    visibility: createChannelVisible,
                    icon: <IconChannel fontSize="small" />,
                    onClick: () => that.showAddDataPointDialog(item.data.id, 'channel'),
                },
                {
                    label: that.texts.createDevice,
                    visibility: createDeviceVisible,
                    icon: <IconDevice fontSize="small" />,
                    onClick: () => that.showAddDataPointDialog(item.data.id, 'device'),
                },
                {
                    label: that.texts.createFolder,
                    icon: <IconFolder fontSize="small" />,
                    visibility: createFolderVisible,
                    onClick: () => that.showAddDataPointDialog(item.data.id, 'folder'),
                },
            ],
        },
        RENAME: {
            key: '8',
            visibility: !!(
                !that.props.notEditable &&
                that.props.objectMoveRenameDialog &&
                !item.data.id.startsWith('system.') &&
                item.data.id.split('.').length > 2 &&
                (that.props.expertMode ||
                    item.data.id.startsWith('javascript.0.') ||
                    item.data.id.startsWith('0_userdata.0.'))
            ),
            icon: <DriveFileRenameOutline />,
            label: that.props.t('ra_Rename_Move_Copy'),
            onClick: () => {
                const ids = Object.keys(that.objects);
                const parentId = `${item.data.id}.`;
                that.setState({
                    showContextMenu: null,
                    showRenameDialog: {
                        id: item.data.id,
                        childrenIds: ids.filter(id => id.startsWith(parentId)),
                    },
                });
            },
        },
        DELETE: {
            key: 'Delete',
            visibility: !!(that.props.onObjectDelete && (item.children?.length || (obj && !obj.common?.dontDelete))),
            icon: (
                <IconDelete
                    fontSize="small"
                    style={that.styles.contextMenuDelete}
                />
            ),
            style: that.styles.contextMenuDelete,
            label: that.texts.deleteObject,
            onClick: () =>
                that.setState({ showContextMenu: null }, () =>
                    that.showDeleteDialog({
                        id,
                        obj: obj || ({} as ioBroker.Object),
                        item,
                    }),
                ),
        },
    };

    Object.keys(ITEMS).forEach(key => {
        if (ITEMS[key].visibility) {
            if (ITEMS[key].subMenu) {
                items.push(
                    <MenuItem
                        key={key}
                        href=""
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                            that.state.showContextMenu &&
                            that.setState({
                                showContextMenu: {
                                    item: that.state.showContextMenu.item,
                                    position: that.state.showContextMenu.position,
                                    subItem: key,
                                    subAnchor: e.target as HTMLLIElement,
                                },
                            })
                        }
                        style={ITEMS[key].style}
                    >
                        <ListItemIcon style={{ ...ITEMS[key].iconStyle, ...ITEMS[key].listItemIconStyle }}>
                            {ITEMS[key].icon}
                        </ListItemIcon>
                        <ListItemText>
                            {ITEMS[key].label}
                            ...
                        </ListItemText>
                        <div style={{ ...styles.contextMenuKeys, opacity: 1 }}>
                            <ArrowRightIcon />
                        </div>
                    </MenuItem>,
                );

                if (that.state.showContextMenu?.subItem === key) {
                    items.push(
                        <Menu
                            key="subContextMenu"
                            open={!0}
                            anchorEl={that.state.showContextMenu.subAnchor}
                            onClose={() => {
                                if (that.state.showContextMenu) {
                                    that.setState({
                                        showContextMenu: {
                                            item: that.state.showContextMenu.item,
                                            position: that.state.showContextMenu.position,
                                        },
                                    });
                                }
                                that.contextMenu = null;
                            }}
                        >
                            {ITEMS[key].subMenu?.map(subItem =>
                                subItem.visibility ? (
                                    <MenuItem
                                        key={subItem.label}
                                        onClick={subItem.onClick}
                                        style={subItem.style}
                                    >
                                        <ListItemIcon
                                            style={{
                                                ...subItem.iconStyle,
                                                ...(subItem.listItemIconStyle || undefined),
                                            }}
                                        >
                                            {subItem.icon}
                                        </ListItemIcon>
                                        <ListItemText>{subItem.label}</ListItemText>
                                    </MenuItem>
                                ) : null,
                            )}
                        </Menu>,
                    );
                }
            } else {
                items.push(
                    <MenuItem
                        key={key}
                        onClick={ITEMS[key].onClick}
                        sx={ITEMS[key].style}
                    >
                        <ListItemIcon style={{ ...ITEMS[key].iconStyle, ...ITEMS[key].listItemIconStyle }}>
                            {ITEMS[key].icon}
                        </ListItemIcon>
                        <ListItemText>{ITEMS[key].label}</ListItemText>
                        {ITEMS[key].key ? (
                            <div style={styles.contextMenuKeys}>
                                {`Alt+${ITEMS[key].key === 'Delete' ? that.props.t('ra_Del') : ITEMS[key].key}`}
                            </div>
                        ) : null}
                    </MenuItem>,
                );
            }
        }
    });

    if (!items.length) {
        setTimeout(() => that.setState({ showContextMenu: null }), 100);
        return null;
    }

    return (
        <Menu
            key="contextMenu"
            open={!0}
            onKeyUp={e => {
                e.preventDefault();
                if (e.altKey) {
                    Object.keys(ITEMS).forEach(key => {
                        if (e.key === ITEMS[key].key && ITEMS[key].onClick) {
                            ITEMS[key].onClick();
                        }
                    });
                }
            }}
            anchorReference="anchorPosition"
            anchorPosition={that.state.showContextMenu.position}
            onClose={() => {
                that.setState({ showContextMenu: null });
                that.contextMenu = null;
            }}
        >
            {items}
        </Menu>
    );
}
