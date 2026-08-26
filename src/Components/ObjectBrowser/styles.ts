/**
 * Copyright 2020-2026, Denis Haev <dogafox@gmail.com>
 *
 * MIT License
 *
 */

import type React from 'react';
import type { SxProps } from '@mui/material';

import type { IobTheme } from '../../types';
import { Utils } from '../Utils';
import { ICON_SIZE, ROW_HEIGHT, styles as utilStyles } from './utils';
import {
    COLOR_NAME_CONNECTED_DARK,
    COLOR_NAME_CONNECTED_LIGHT,
    COLOR_NAME_DISCONNECTED_DARK,
    COLOR_NAME_DISCONNECTED_LIGHT,
    COLOR_NAME_ERROR_DARK,
    COLOR_NAME_ERROR_LIGHT,
    SMALL_BUTTON_SIZE,
} from './constants';

export const styles: Record<string, any> = {
    toolbar: {
        minHeight: 38, // Theme.toolbar.height,
        //        boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)'
    },
    toolbarButtons: {
        padding: 4,
        marginLeft: 4,
    },
    switchColumnAuto: {
        marginLeft: 16,
    },
    dialogColumns: {
        transition: 'opacity 1s',
    },
    dialogColumnsLabel: {
        fontSize: 12,
        paddingTop: 8,
    },
    columnCustom: {
        width: '100%',
        display: 'inline-block',
    },
    columnCustomEditable: {
        cursor: 'text',
    },
    columnCustom_center: {
        textAlign: 'center',
    },
    columnCustom_left: {
        textAlign: 'left',
    },
    columnCustom_right: {
        textAlign: 'right',
    },
    width100: {
        width: '100%',
    },
    transparent_10: {
        opacity: 0.1,
    },
    transparent_20: {
        opacity: 0.2,
    },
    transparent_30: {
        opacity: 0.3,
    },
    transparent_40: {
        opacity: 0.4,
    },
    transparent_50: {
        opacity: 0.5,
    },
    transparent_60: {
        opacity: 0.6,
    },
    transparent_70: {
        opacity: 0.7,
    },
    transparent_80: {
        opacity: 0.8,
    },
    transparent_90: {
        opacity: 0.9,
    },
    transparent_100: {
        opacity: 1,
    },
    // The header is a part of the scrolling container, so it scrolls horizontally together with the
    // rows and no synchronisation is required. `top: 0` pins it only vertically.
    headerRow: (theme: IobTheme): React.CSSProperties => ({
        paddingLeft: 8,
        height: 38,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        // the header uses the same layout rules as the rows, so both compute identical widths
        display: 'flex',
        flexWrap: 'nowrap',
        // the rows can be wider than the visible area
        width: 'fit-content',
        minWidth: '100%',
        // the rows are `border-box` (MUI), the padding must be inside of the width here too,
        // otherwise the growing column would be wider in the header than in the rows
        boxSizing: 'border-box',
        backgroundColor: theme.palette.background.paper,
    }),
    buttonClearFilter: {
        position: 'relative',
        float: 'right',
        padding: 0,
    },
    buttonClearFilterIcon: {
        zIndex: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        color: '#FF0000',
        opacity: 0.7,
    },

    // The header is rendered inside this container (see `headerRow`), so it uses the full height
    tableDiv: {
        paddingTop: 0,
        paddingLeft: 0,
        width: 'calc(100% - 8px)',
        height: '100%',
        overflow: 'auto',
        position: 'relative',
    },
    tableRow: (theme: IobTheme): SxProps => ({
        pl: 1,
        height: ROW_HEIGHT,
        lineHeight: `${ROW_HEIGHT}px`,
        verticalAlign: 'top',
        userSelect: 'none',
        position: 'relative',
        // rows outside the viewport keep their size but skip layout and paint
        contentVisibility: 'auto',
        containIntrinsicHeight: `${ROW_HEIGHT}px`,
        // The row is as wide as the sum of the columns, exactly like the header. If that is wider
        // than the container, the container scrolls horizontally and takes the header with it.
        // Without `flexShrink: 0` the cells would be squeezed and would not match the header anymore.
        width: 'fit-content',
        minWidth: '100%',
        '& > *': {
            flexShrink: 0,
            boxSizing: 'border-box',
        },
        '&:hover': {
            background: `${
                theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light
            } !important`,
            color: Utils.invertColor(theme.palette.primary.main, true),
        },
        whiteSpace: 'nowrap',
        flexWrap: 'nowrap',
    }),
    tableRowLines: (theme: IobTheme): SxProps => ({
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#8888882e' : '#8888882e'}`,
        '& > div': {
            borderRight: `1px solid ${theme.palette.mode === 'dark' ? '#8888882e' : '#8888882e'}`,
        },
    }),
    tableRowNoDragging: {
        cursor: 'pointer',
    },
    tableRowAlias: {
        height: ROW_HEIGHT + 10,
    },
    tableRowAliasReadWrite: {
        height: ROW_HEIGHT + 22,
    },
    tableRowFocused: (theme: IobTheme): SxProps => ({
        '&:after': {
            content: '""',
            position: 'absolute',
            top: 1,
            left: 1,
            right: 1,
            bottom: 1,
            border: theme.palette.mode ? '1px dotted #000' : '1px dotted #FFF',
        },
    }),
    checkBox: {
        padding: 0,
    },
    cellId: {
        position: 'relative',
        fontSize: '1rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        // verticalAlign: 'top',
        // position: 'relative',
        '& .copyButton': {
            display: 'none',
        },
        '&:hover .copyButton': {
            display: 'block',
        },
        '& .iconOwn': {
            display: 'block',
            width: ROW_HEIGHT - 4,
            height: ROW_HEIGHT - 4,
            mt: '2px',
            float: 'right',
        },
        '&:hover .iconOwn': {
            display: 'none',
        },
        '& *': {
            width: 'initial',
        },
    },
    cellIdSpan: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        // display: 'inline-block',
        // verticalAlign: 'top',
    },
    // This style is used for simple div. Do not migrate it to "secondary.main"
    cellIdIconFolder: (theme: IobTheme): React.CSSProperties => ({
        marginRight: 8,
        width: ROW_HEIGHT - 4,
        height: ROW_HEIGHT - 4,
        cursor: 'pointer',
        color: theme.palette.secondary.main || '#fbff7d',
        verticalAlign: 'top',
    }),
    cellIdIconDocument: {
        verticalAlign: 'middle',
        marginLeft: (ROW_HEIGHT - SMALL_BUTTON_SIZE) / 2,
        marginRight: 8,
        width: SMALL_BUTTON_SIZE,
        height: SMALL_BUTTON_SIZE,
    },
    cellIdIconOwn: {},
    cellCopyButton: {
        width: SMALL_BUTTON_SIZE,
        height: SMALL_BUTTON_SIZE,
        top: (ROW_HEIGHT - SMALL_BUTTON_SIZE) / 2,
        opacity: 0.8,
        position: 'absolute',
        right: 3,
    },
    cellCopyButtonInDetails: {
        width: SMALL_BUTTON_SIZE,
        height: SMALL_BUTTON_SIZE,
        top: (ROW_HEIGHT - SMALL_BUTTON_SIZE) / 2,
        opacity: 0.8,
    },
    cellEditButton: {
        width: SMALL_BUTTON_SIZE,
        height: SMALL_BUTTON_SIZE,
        color: 'white',
        position: 'absolute',
        top: (ROW_HEIGHT - SMALL_BUTTON_SIZE) / 2,
        right: SMALL_BUTTON_SIZE + 3,
        opacity: 0.7,
        '&:hover': {
            opacity: 1,
        },
    },
    cellName: {
        display: 'inline-block',
        verticalAlign: 'top',
        fontSize: 14,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        position: 'relative',
        '& .copyButton': {
            display: 'none',
        },
        '&:hover .copyButton': {
            display: 'block',
        },
    },
    cellNameWithDesc: {
        lineHeight: 'normal',
    },
    cellNameDivDiv: {},
    cellDescription: {
        fontSize: 10,
        opacity: 0.5,
        fontStyle: 'italic',
    },
    cellIdAlias: (theme: IobTheme): SxProps => ({
        fontStyle: 'italic',
        fontSize: 12,
        opacity: 0.7,
        '&:hover': {
            color: theme.palette.mode === 'dark' ? '#009900' : '#007700',
        },
    }),
    cellIdAliasReadWriteDiv: {
        height: 24,
        marginTop: -5,
    },
    cellIdAliasAlone: {
        lineHeight: 0,
    },
    cellIdAliasReadWrite: {
        lineHeight: '12px',
    },
    cellType: {
        display: 'inline-block',
        verticalAlign: 'top',
        '& .itemIcon': {
            verticalAlign: 'middle',
            width: ICON_SIZE,
            height: ICON_SIZE,
            display: 'inline-block',
        },
        '& .itemIconFolder': {
            marginLeft: 3,
        },
    },
    cellRole: {
        display: 'inline-block',
        verticalAlign: 'top',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    cellRoom: {
        display: 'inline-block',
        verticalAlign: 'top',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    cellEnumParent: {
        opacity: 0.4,
    },
    cellFunc: {
        display: 'inline-block',
        verticalAlign: 'top',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    cellValue: {
        display: 'inline-block',
        verticalAlign: 'top',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    cellValueButton: {
        marginTop: 5,
    },
    cellValueButtonFalse: {
        opacity: 0.3,
    },
    cellAdapter: {
        display: 'inline-block',
        verticalAlign: 'top',
    },
    cellValueTooltip: {
        fontSize: 12,
    },
    cellValueText: {
        width: '100%',
        height: ROW_HEIGHT,
        fontSize: 16,
        display: 'flex',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        position: 'relative',
        verticalAlign: 'top',
        '& .copyButton': {
            display: 'none',
        },
        '&:hover .copyButton': {
            display: 'block',
        },
    },
    cellValueFile: {
        color: '#2837b9',
    },
    cellValueTooltipTitle: {
        fontStyle: 'italic',
        width: 100,
        display: 'inline-block',
    },
    cellValueTooltipValue: {
        width: 120,
        display: 'inline-block',
        // overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    cellValueTooltipImage: {
        width: 100,
        height: 'auto',
    },
    cellValueTooltipBoth: {
        width: 220,
        display: 'inline-block',
        whiteSpace: 'nowrap',
    },
    cellValueTooltipBox: {
        width: 250,
        overflow: 'hidden',
        pointerEvents: 'none',
    },
    tooltip: {
        pointerEvents: 'none',
    },
    cellValueTextUnit: {
        marginLeft: 4,
        opacity: 0.8,
        display: 'inline-block',
    },
    cellValueTextState: {
        opacity: 0.7,
    },
    cellValueTooltipCopy: {
        position: 'absolute',
        bottom: 3,
        right: 3,
    },
    cellValueTooltipEdit: {
        position: 'absolute',
        bottom: 3,
        right: 15,
    },
    cellButtons: {
        display: 'inline-block',
        verticalAlign: 'top',
    },
    cellButtonsButton: {
        display: 'inline-block',
        opacity: 0.5,
        width: SMALL_BUTTON_SIZE + 4,
        height: SMALL_BUTTON_SIZE + 4,
        '&:hover': {
            opacity: 1,
        },
        p: 0,
        mt: '-2px',
    },
    cellButtonsEmptyButton: {
        fontSize: 12,
    },
    cellButtonMinWidth: {
        minWidth: 40,
    },
    cellButtonsButtonAlone: {
        ml: `${SMALL_BUTTON_SIZE + 6}px`,
        pt: 0,
        mt: '-2px',
    },
    cellButtonsButtonWithCustoms: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.secondary.main,
    }),
    cellButtonsButtonWithoutCustoms: {
        opacity: 0.2,
    },
    cellButtonsValueButton: (theme: IobTheme): SxProps => ({
        position: 'absolute',
        top: SMALL_BUTTON_SIZE / 2 - 2,
        opacity: 0.7,
        width: SMALL_BUTTON_SIZE - 2,
        height: SMALL_BUTTON_SIZE - 2,
        color: theme.palette.action.active,
        '&:hover': {
            opacity: 1,
        },
    }),
    cellButtonsValueButtonCopy: {
        right: 8,
        cursor: 'pointer',
    },
    cellButtonsValueButtonEdit: {
        right: SMALL_BUTTON_SIZE / 2 + 16,
    },
    cellDetailsLine: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: 32,
        fontSize: 16,
    },
    cellDetailsName: {
        fontWeight: 'bold',
        marginRight: 8,
        minWidth: 80,
    },

    filteredOut: {
        opacity: 0.5,
    },
    filteredParentOut: {
        opacity: 0.3,
    },
    filterInput: {
        mt: 0,
        mb: 0,
    },
    selectIcon: {
        width: 24,
        height: 24,
        marginRight: 4,
    },

    itemSelected: (theme: IobTheme): React.CSSProperties => ({
        background: `${theme.palette.primary.main} !important`,
        color: `${Utils.invertColor(theme.palette.primary.main, true)} !important`,
    }),
    header: {
        width: '100%',
    },
    headerCell: {
        display: 'inline-block',
        verticalAlign: 'top',
        flexShrink: 0,
        boxSizing: 'border-box',
    },
    headerCellValue: {
        paddingTop: 4,
        // paddingLeft: 5,
        fontSize: 16,
    },

    visibleButtons: {
        color: '#2196f3',
        opacity: 0.7,
    },
    grow: {
        flexGrow: 1,
    },
    enumIconDiv: {
        marginRight: 8,
        width: 32,
        height: 32,
        borderRadius: 8,
        background: '#FFFFFF',
    },
    enumIcon: {
        marginTop: 4,
        marginLeft: 4,
        width: 24,
        height: 24,
    },
    enumDialog: {
        overflow: 'hidden',
    },
    enumList: {
        minWidth: 250,
        height: 'calc(100% - 50px)',
        overflow: 'auto',
    },
    enumCheckbox: {
        minWidth: 0,
    },
    buttonDiv: {
        display: 'flex',
        height: '100%',
        alignItems: 'center',
    },
    aclText: {
        fontSize: 13,
        marginTop: 6,
    },
    rightsObject: {
        color: '#55ff55',
        paddingLeft: 3,
    },
    rightsState: {
        color: '#86b6ff',
        paddingLeft: 3,
    },
    textCenter: {
        padding: 12,
        textAlign: 'center',
    },
    tooltipAccessControl: {
        display: 'flex',
        flexDirection: 'column',
    },
    fontSizeTitle: {
        '@media screen and (max-width: 465px)': {
            '& *': {
                fontSize: 12,
            },
        },
    },
    draggable: {
        cursor: 'copy',
    },
    nonDraggable: {
        cursor: 'no-drop',
    },
    iconDeviceConnected: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? COLOR_NAME_CONNECTED_DARK : COLOR_NAME_CONNECTED_LIGHT,
        opacity: 0.8,
        position: 'absolute',
        top: 4,
        right: 32,
        width: 20,
    }),
    iconDeviceDisconnected: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? COLOR_NAME_DISCONNECTED_DARK : COLOR_NAME_DISCONNECTED_LIGHT,
        opacity: 0.8,
        position: 'absolute',
        top: 4,
        right: 32,
        width: 20,
    }),
    iconDeviceError: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? COLOR_NAME_ERROR_DARK : COLOR_NAME_ERROR_LIGHT,
        opacity: 0.8,
        position: 'absolute',
        top: 4,
        right: 50,
        width: 20,
    }),
    resizeHandle: {
        display: 'block',
        position: 'absolute',
        cursor: 'col-resize',
        width: 7,
        top: 2,
        bottom: 2,
        zIndex: 1,
    },
    resizeHandleRight: {
        right: 3,
        borderRight: '2px dotted #888',
        '&:hover': {
            borderColor: '#ccc',
            borderRightStyle: 'solid',
        },
        '&.active': {
            borderColor: '#517ea5',
            borderRightStyle: 'solid',
        },
    },
    invertedBackground: (theme: IobTheme): React.CSSProperties => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#9a9a9a' : '#565656',
        padding: '0 3px',
        borderRadius: '2px 0 0 2px',
    }),
    invertedBackgroundFlex: (theme: IobTheme): React.CSSProperties => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#9a9a9a' : '#565656',
        borderRadius: '0 2px 2px 0',
    }),
    contextMenuEdit: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? '#ffee48' : '#cbb801',
    }),
    contextMenuEditValue: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? '#5dff45' : '#1cd301',
    }),
    contextMenuView: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? '#FFF' : '#000',
    }),
    contextMenuCustom: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? '#42eaff' : '#01bbc2',
    }),
    contextMenuACL: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? '#e079ff' : '#500070',
    }),
    contextMenuRoom: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? '#ff9a33' : '#642a00',
    }),
    contextMenuRole: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? '#ffdb43' : '#562d00',
    }),
    contextMenuDelete: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? '#ff4f4f' : '#cf0000',
    }),
    contextMenuKeys: {
        marginLeft: 8,
        opacity: 0.7,
        fontSize: 'smaller',
    },
    contextMenuWithSubMenu: {
        display: 'flex',
    },
    ...utilStyles,
};
