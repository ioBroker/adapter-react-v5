import React, { Component, type JSX } from 'react';

import {
    Box,
    Fab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
    IconButton,
    Select,
    MenuItem,
    TextField,
    Checkbox,
    Tooltip,
} from '@mui/material';

import {
    Edit as IconEdit,
    Delete as IconDelete,
    NavigateNext as IconExpand,
    Check as IconCheck,
    Close as IconClose,
    Add as IconAdd,
    ViewHeadline as IconList,
} from '@mui/icons-material';

import type { Connection } from '../Connection';

import { DialogSelectID } from '../Dialogs/SelectID';
import { ColorPicker, parseColor } from './ColorPicker';
import { I18n } from '../i18n';
import { Utils } from './Utils';
import type { IobTheme, ThemeType } from '../types';

function getAttr(obj: Record<string, any>, attr: string | string[], lookup?: Record<string, string>): any {
    if (typeof attr === 'string') {
        attr = attr.split('.');
    }

    if (!obj) {
        return null;
    }

    if (attr.length === 1) {
        if (lookup && lookup[obj[attr[0]]]) {
            return lookup[obj[attr[0]]];
        }
        return obj[attr[0]];
    }

    const name: string = attr.shift() || '';
    return getAttr(obj[name], attr);
}

function setAttr(obj: Record<string, any>, attr: string | string[], value: any): void {
    if (typeof attr === 'string') {
        attr = attr.split('.');
    }

    if (attr.length === 1) {
        return (obj[attr[0]] = value);
    }
    const name: string = attr.shift()!;
    if (obj[name] === null || obj[name] === undefined) {
        obj[name] = {};
    }
    return setAttr(obj[name], attr, value);
}

/** Checkerboard, so a semi-transparent color is recognizable as such */
const ALPHA_BACKGROUND =
    'linear-gradient(45deg, #c0c0c0 25%, transparent 25%), linear-gradient(-45deg, #c0c0c0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #c0c0c0 75%), linear-gradient(-45deg, transparent 75%, #c0c0c0 75%)';

const styles: Record<string, any> = {
    tableContainer: {
        width: '100%',
        height: '100%',
        overflow: 'auto',
    },
    table: {
        width: '100%',
        minWidth: 800,
        maxWidth: 1920,
        borderCollapse: 'separate',
    },
    cell: (theme: IobTheme) => ({
        py: '4px',
        px: '8px',
        borderBottom: `1px solid ${theme.palette.divider}`,
    }),
    row: (theme: IobTheme) => ({
        transition: 'background-color 0.15s ease-in-out',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        // Show the row actions only while the row is hovered or focused. Only the buttons are faded out -
        // the cell itself must stay visible, else its bottom border would disappear too.
        '& .iob-table-actions .MuiIconButton-root': {
            opacity: 0,
            transition: 'opacity 0.15s ease-in-out',
        },
        '&:hover .iob-table-actions .MuiIconButton-root, &:focus-within .iob-table-actions .MuiIconButton-root': {
            opacity: 1,
        },
    }),
    rowMainWithChildren: {},
    rowMainWithoutChildren: {},
    rowNoEdit: {
        opacity: 0.35,
    },
    rowEditing: (theme: IobTheme) => ({
        backgroundColor: theme.palette.action.selected,
        '& .iob-table-actions .MuiIconButton-root': {
            opacity: 1,
        },
    }),
    cellExpand: {
        width: 36,
        pr: 0,
    },
    cellButton: {
        width: 40,
        textAlign: 'center',
    },
    cellHeader: (theme: IobTheme) => ({
        fontWeight: 600,
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        lineHeight: 1.4,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.secondary,
        borderBottom: `2px solid ${theme.palette.divider}`,
        height: 44,
        wordBreak: 'break-word',
        whiteSpace: 'nowrap',
        '& .MuiTableSortLabel-root': {
            color: 'inherit',
        },
        '& .MuiTableSortLabel-root:hover, & .MuiTableSortLabel-root.Mui-active': {
            color: theme.palette.text.primary,
        },
    }),
    width_name_nicknames: {
        maxWidth: 150,
    },
    width_ioType: {
        maxWidth: 100,
    },
    width_type: {
        maxWidth: 100,
    },
    width_displayTraits: {
        maxWidth: 100,
    },
    width_roomHint: {
        maxWidth: 100,
    },
    rowSecondary: {},
    cellSecondary: (theme: IobTheme) => ({
        fontSize: '0.8rem',
        color: theme.palette.text.secondary,
    }),
    /** Vertical guide in front of a child row, so the hierarchy stays readable */
    childIndent: (theme: IobTheme) => ({
        display: 'inline-block',
        borderLeft: `1px solid ${theme.palette.divider}`,
        height: 20,
        mr: '8px',
        verticalAlign: 'middle',
    }),
    expandButton: {
        transition: 'transform 0.15s ease-in-out',
    },
    expandButtonOpened: {
        transform: 'rotate(90deg)',
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
    fieldEditWithButton: {
        width: 'calc(100% - 33px)',
        display: 'inline-block',
    },
    fieldEdit: {
        width: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
    },
    fieldButton: {
        width: 30,
        display: 'inline-block',
    },
    mainText: {
        fontSize: '0.875rem',
    },
    subText: {
        fontSize: '0.7rem',
        opacity: 0.7,
    },
    /** Color cell: swatch plus the value in a monospace font */
    colorCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    colorSwatch: {
        width: 22,
        height: 22,
        flexShrink: 0,
        borderRadius: '5px',
        boxShadow: '0 0 0 1px rgba(128,128,128,.35) inset',
        backgroundImage: ALPHA_BACKGROUND,
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
    },
    colorSwatchEmpty: {
        border: '1px dashed',
        borderColor: 'divider',
        backgroundImage: 'none',
        boxSizing: 'border-box',
    },
    colorSwatchFill: {
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
    },
    colorValue: {
        fontFamily: 'monospace',
        fontSize: '0.78rem',
        whiteSpace: 'nowrap',
    },
    colorValueInvalid: {
        color: 'error.main',
    },
    glow: {
        animation: 'glow 0.2s 2 alternate',
    },
};

function descendingComparator(
    a: Record<string, any>,
    b: Record<string, any>,
    orderBy: string,
    lookup?: Record<string, string>,
): number {
    const _a = getAttr(a, orderBy, lookup) || '';
    const _b = getAttr(b, orderBy, lookup) || '';

    if (_b < _a) {
        return -1;
    }
    if (_b > _a) {
        return 1;
    }
    return 0;
}

function getComparator(
    order: 'desc' | 'asc',
    orderBy: string,
    lookup?: Record<string, string>,
): (a: Record<string, any>, b: Record<string, any>) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy, lookup)
        : (a, b) => -descendingComparator(a, b, orderBy, lookup);
}

function stableSort(
    array: Record<string, any>[],
    comparator: (a: Record<string, any>, b: Record<string, any>) => number,
): Record<string, any>[] {
    const stabilizedThis: { e: Record<string, any>; i: number }[] = array.map((el, index) => ({ e: el, i: index }));

    stabilizedThis.sort((a, b) => {
        const order = comparator(a.e, b.e);
        if (order) {
            return order;
        }
        return a.i - b.i;
    });

    return stabilizedThis.map(item => item.e);
}

interface Column {
    cellStyle?: Record<string, any>;
    editComponent?: React.FC<{ value: any; rowData: Record<string, any>; onChange: (newValue: any) => void }>;
    field: string;
    headerStyle?: Record<string, any>;
    hidden?: boolean;
    lookup?: Record<string, string>;
    editable?: boolean | 'never';
    title?: string;
    type?: 'string' | 'boolean' | 'numeric' | 'icon' | 'oid' | 'color';
    subField?: string;
    subLookup?: Record<string, string>;
    subStyle?: Record<string, any>;
}

interface TreeTableProps {
    data: Record<string, any>[];
    className?: string;
    /** name of table to save settings in localStorage */
    name?: string;
    columns: Column[];
    noSort?: boolean;
    onUpdate?: ((newData: Record<string, any>, oldData: Record<string, any>) => void) | ((addNew: true) => void);
    onDelete?: (oldData: Record<string, any>) => void;
    /** hide add button */
    noAdd?: boolean;
    themeType?: ThemeType;
    glowOnChange?: boolean;
    /** only if an oid type is used */
    socket?: Connection;
    /** Shift in pixels for every level */
    levelShift?: number;
    adapterName: string;
    theme: IobTheme;
}

interface TreeTableState {
    opened: string[];
    editMode: number | false;
    deleteMode: number | false;
    editData: Record<string, any> | null;
    order: 'desc' | 'asc';
    update: string[] | null;
    orderBy: string;
    selectIdValue?: string | null;
    showSelectId?: boolean;
    data?: Record<string, any>[];
}

export class TreeTable extends Component<TreeTableProps, TreeTableState> {
    private selectCallback: ((selected: string) => void) | null = null;

    private updateTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(props: TreeTableProps) {
        super(props);

        let opened =
            ((window as any)._localStorage || window.localStorage).getItem(this.props.name || 'iob-table') || '[]';
        try {
            opened = JSON.parse(opened) || [];
        } catch {
            opened = [];
        }
        if (!Array.isArray(opened)) {
            opened = [];
        }

        this.state = {
            opened,
            editMode: false,
            deleteMode: false,
            editData: null,
            order: 'asc',
            update: null,
            orderBy: this.props.columns[0].field,
        };
    }

    componentWillUnmount(): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = null;
        }
    }

    static getDerivedStateFromProps(props: TreeTableProps, state: TreeTableState): Partial<TreeTableState> {
        if (props.glowOnChange) {
            const update: string[] = [];
            let count = 0;
            if (props.data && state.data) {
                props.data.forEach(line => {
                    count++;
                    const oldLine = state.data?.find(it => it.id === line.id);
                    if (oldLine) {
                        if (JSON.stringify(oldLine) !== JSON.stringify(line)) {
                            update.push(line.id);
                        }
                    } else {
                        update.push(line.id);
                    }
                });
            }

            if (update.length && update.length !== count) {
                return { data: props.data, update };
            }
            return { data: props.data };
        }

        return { data: props.data };
    }

    renderCellEdit(item: Record<string, any>, col: Column): JSX.Element | null {
        let val = getAttr(item, col.field);
        if (Array.isArray(val)) {
            val = val[0];
        }

        if (col.lookup) {
            return this.renderCellEditSelect(col, val);
        }
        if (col.editComponent) {
            return this.renderCellEditCustom(col, val, item);
        }
        if (col.type === 'boolean' || (!col.type && typeof val === 'boolean')) {
            return this.renderCellEditBoolean(col, val);
        }
        if (col.type === 'color') {
            return this.renderCellEditColor(col, val);
        }
        if (col.type === 'oid') {
            return this.renderCellEditObjectID(col, val);
        }
        if (col.type === 'numeric') {
            return this.renderCellEditNumber(col, val);
        }

        return this.renderCellEditString(col, val);
    }

    onChange(col: Column, oldValue: string | number | boolean, newValue: string | number | boolean): void {
        const editData = this.state.editData ? { ...this.state.editData } : {};
        if (newValue === oldValue) {
            delete editData[col.field];
        } else {
            editData[col.field] = newValue;
        }
        this.setState({ editData });
    }

    renderCellEditSelect(col: Column, val: string | number): JSX.Element {
        return (
            <Select
                variant="standard"
                onChange={e => this.onChange(col, val, e.target.value)}
                value={(this.state.editData && this.state.editData[col.field]) || val}
            >
                {col.lookup &&
                    Object.keys(col.lookup).map((v, i) => (
                        <MenuItem
                            key={i}
                            value={v}
                        >
                            {col.lookup?.[v]}
                        </MenuItem>
                    ))}
            </Select>
        );
    }

    renderCellEditString(col: Column, val: string): JSX.Element {
        return (
            <TextField
                variant="standard"
                style={styles.fieldEdit}
                fullWidth
                value={
                    this.state.editData && this.state.editData[col.field] !== undefined
                        ? this.state.editData[col.field]
                        : val
                }
                onChange={e => this.onChange(col, val, e.target.value)}
            />
        );
    }

    renderCellEditNumber(col: Column, val: number): JSX.Element {
        return (
            <TextField
                variant="standard"
                style={styles.fieldEdit}
                type="number"
                fullWidth
                value={
                    this.state.editData && this.state.editData[col.field] !== undefined
                        ? this.state.editData[col.field]
                        : val
                }
                onChange={e => this.onChange(col, val, e.target.value)}
            />
        );
    }

    renderCellEditCustom(col: Column, val: any, item: Record<string, any>): JSX.Element | null {
        const EditComponent = col.editComponent;

        // use new value if exists
        if (this.state.editData && this.state.editData[col.field] !== undefined) {
            val = this.state.editData[col.field];
            item = JSON.parse(JSON.stringify(item));
            item[col.field] = val;
        }

        return EditComponent ? (
            <EditComponent
                value={val}
                rowData={item}
                onChange={(newVal: any) => this.onChange(col, val, newVal as string | number)}
            />
        ) : null;
    }

    renderCellEditBoolean(col: Column, val: boolean): JSX.Element {
        return (
            <Checkbox
                checked={
                    this.state.editData && this.state.editData[col.field] !== undefined
                        ? !!this.state.editData[col.field]
                        : !!val
                }
                onChange={e => this.onChange(col, !!val, e.target.checked)}
                slotProps={{ input: { 'aria-label': 'checkbox' } }}
            />
        );
    }

    renderCellEditColor(col: Column, val: string): JSX.Element {
        const _val =
            this.state.editData && this.state.editData[col.field] !== undefined ? this.state.editData[col.field] : val;
        return (
            <ColorPicker
                id={`ar_tree_table_color_${col.field}`}
                style={styles.fieldEdit}
                value={(_val as string) || ''}
                onChange={color => this.onChange(col, val, color)}
            />
        );
    }

    renderSelectIdDialog(): JSX.Element | null {
        if (this.state.showSelectId && this.props.socket) {
            return (
                <DialogSelectID
                    key="tableSelect"
                    imagePrefix="../.."
                    dialogName={this.props.adapterName}
                    themeType={this.props.themeType}
                    theme={this.props.theme}
                    socket={this.props.socket}
                    selected={this.state.selectIdValue || undefined}
                    onClose={() => this.setState({ showSelectId: false })}
                    onOk={(selected: string | string[] | undefined) => {
                        this.setState({ showSelectId: false, selectIdValue: null });
                        const selectedStr: string | undefined = Array.isArray(selected) ? selected[0] : selected;
                        if (selectedStr && this.selectCallback) {
                            this.selectCallback && this.selectCallback(selectedStr);
                            this.selectCallback = null;
                        }
                    }}
                />
            );
        }

        return null;
    }

    renderCellEditObjectID(col: Column, val: string): JSX.Element {
        return (
            <div style={styles.fieldEdit}>
                <TextField
                    variant="standard"
                    fullWidth
                    style={styles.fieldEditWithButton}
                    value={
                        this.state.editData && this.state.editData[col.field] !== undefined
                            ? this.state.editData[col.field]
                            : val
                    }
                    onChange={e => this.onChange(col, val, e.target.value)}
                />

                <IconButton
                    style={styles.fieldButton}
                    onClick={() => {
                        this.selectCallback = selected => this.onChange(col, val, selected);
                        this.setState({ showSelectId: true, selectIdValue: val });
                    }}
                    size="large"
                >
                    <IconList />
                </IconButton>
            </div>
        );
    }

    /**
     * Show a color as swatch together with its value.
     *
     * @param color The color in any CSS notation.
     */
    static renderColorValue(color: string): JSX.Element {
        const isValid = !!color && !!parseColor(color);

        return (
            <Box
                component="div"
                sx={styles.colorCell}
            >
                <Box
                    component="div"
                    sx={{ ...styles.colorSwatch, ...(isValid ? undefined : styles.colorSwatchEmpty) }}
                    title={color || undefined}
                >
                    {isValid ? (
                        <Box
                            component="div"
                            sx={styles.colorSwatchFill}
                            style={{ background: color }}
                        />
                    ) : null}
                </Box>
                <Box
                    component="span"
                    sx={{ ...styles.colorValue, ...(color && !isValid ? styles.colorValueInvalid : undefined) }}
                >
                    {color || ''}
                </Box>
            </Box>
        );
    }

    static renderCellNonEdit(item: Record<string, any>, col: Column): JSX.Element | string | number | null {
        let val = getAttr(item, col.field, col.lookup);
        if (Array.isArray(val)) {
            val = val[0];
        }

        if (col.type === 'boolean') {
            return (
                <Checkbox
                    checked={!!val}
                    disabled
                    size="small"
                    slotProps={{ input: { 'aria-label': 'checkbox' } }}
                />
            );
        }

        if (col.type === 'color') {
            return TreeTable.renderColorValue(typeof val === 'string' ? val : '');
        }

        return val;
    }

    renderCell(item: Record<string, any>, col: Column, level: number, i: number): JSX.Element {
        const isEdit = this.state.editMode === i && col.editable !== 'never' && col.editable !== false;

        return (
            <TableCell
                key={col.field}
                sx={Utils.getStyle(this.props.theme, styles.cell, level ? styles.cellSecondary : undefined)}
                style={col.cellStyle}
                component="th"
            >
                {isEdit ? this.renderCellEdit(item, col) : TreeTable.renderCellNonEdit(item, col)}
            </TableCell>
        );
    }

    static renderCellWithSubField(item: Record<string, any>, col: Column): JSX.Element {
        const main = getAttr(item, col.field, col.lookup);
        if (col.subField) {
            const sub = getAttr(item, col.subField, col.subLookup);
            return (
                <div>
                    <div style={styles.mainText}>{main}</div>
                    <div style={{ ...styles.subText, ...(col.subStyle || undefined) }}>{sub}</div>
                </div>
            );
        }
        return (
            <div>
                <div style={styles.mainText}>{main}</div>
            </div>
        );
    }

    renderLine(item: Record<string, any>, level?: number): JSX.Element | JSX.Element[] | null {
        const levelShift = this.props.levelShift === undefined ? 24 : this.props.levelShift;

        level = level || 0;
        const i = this.props.data.indexOf(item);
        if (!item) {
            return null;
        }
        if (!level && item.parentId) {
            return null;
        }
        if (level && !item.parentId) {
            return null; // should never happen
        }
        // try to find children
        const opened = this.state.opened.includes(item.id);
        const children = this.props.data.filter(it => it.parentId === item.id);

        const isEditingThis = this.state.editMode === i || this.state.deleteMode === i;
        const isBlurred =
            (this.state.editMode !== false && this.state.editMode !== i) ||
            (this.state.deleteMode !== false && this.state.deleteMode !== i);

        const row = (
            <TableRow
                key={item.id}
                className={`table-row-${(item.id || '').toString().replace(/[.$]/g, '_')}`}
                sx={Utils.getStyle(
                    this.props.theme,
                    styles.row,
                    level ? styles.rowSecondary : undefined,
                    !level && children.length ? styles.rowMainWithChildren : undefined,
                    !level && !children.length ? styles.rowMainWithoutChildren : undefined,
                    isEditingThis ? styles.rowEditing : undefined,
                    isBlurred ? styles.rowNoEdit : undefined,
                )}
                style={
                    this.state.update && this.state.update.includes(item.id)
                        ? { ...(styles.glow as React.CSSProperties) }
                        : undefined
                }
            >
                <TableCell
                    sx={Utils.getStyle(
                        this.props.theme,
                        styles.cell,
                        styles.cellExpand,
                        level ? styles.cellSecondary : undefined,
                    )}
                >
                    {children.length ? (
                        <IconButton
                            sx={{
                                ...styles.expandButton,
                                ...(opened ? styles.expandButtonOpened : undefined),
                            }}
                            title={I18n.t(opened ? 'ra_Collapse' : 'ra_Expand')}
                            onClick={() => {
                                const _opened = [...this.state.opened];
                                const pos = _opened.indexOf(item.id);
                                if (pos === -1) {
                                    _opened.push(item.id);
                                    _opened.sort();
                                } else {
                                    _opened.splice(pos, 1);
                                }

                                ((window as any)._localStorage || window.localStorage).setItem(
                                    this.props.name || 'iob-table',
                                    JSON.stringify(_opened),
                                );

                                this.setState({ opened: _opened });
                            }}
                            size="small"
                        >
                            <IconExpand fontSize="small" />
                        </IconButton>
                    ) : null}
                </TableCell>
                <TableCell
                    scope="row"
                    sx={Utils.getStyle(this.props.theme, styles.cell, level ? styles.cellSecondary : undefined)}
                    style={{ ...this.props.columns[0].cellStyle, paddingLeft: levelShift * level }}
                >
                    <Box
                        component="div"
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        {level ? (
                            <Box
                                component="span"
                                sx={styles.childIndent}
                            />
                        ) : null}
                        {this.props.columns[0].subField
                            ? TreeTable.renderCellWithSubField(item, this.props.columns[0])
                            : getAttr(item, this.props.columns[0].field, this.props.columns[0].lookup)}
                    </Box>
                </TableCell>

                {this.props.columns.map((col, ii) =>
                    !ii && !col.hidden ? null : this.renderCell(item, col, level, i),
                )}

                {this.props.onUpdate ? (
                    <TableCell
                        className="iob-table-actions"
                        sx={Utils.getStyle(this.props.theme, styles.cell, styles.cellButton)}
                    >
                        {isEditingThis ? (
                            <Tooltip title={I18n.t(this.state.editMode !== false ? 'ra_Save' : 'ra_Delete')}>
                                <span>
                                    <IconButton
                                        color={this.state.deleteMode !== false ? 'error' : 'primary'}
                                        disabled={
                                            this.state.editMode !== false &&
                                            (!this.state.editData || !Object.keys(this.state.editData).length)
                                        }
                                        onClick={() => {
                                            if (this.state.editMode !== false) {
                                                const newData = JSON.parse(JSON.stringify(item));
                                                this.state.editData &&
                                                    Object.keys(this.state.editData).forEach(attr =>
                                                        setAttr(newData, attr, this.state.editData?.[attr]),
                                                    );
                                                this.setState(
                                                    { editMode: false },
                                                    () => this.props.onUpdate && this.props.onUpdate(newData, item),
                                                );
                                            } else {
                                                this.setState(
                                                    { deleteMode: false },
                                                    () => this.props.onDelete && this.props.onDelete(item),
                                                );
                                            }
                                        }}
                                        size="small"
                                    >
                                        <IconCheck fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip title={I18n.t('ra_Edit')}>
                                <span>
                                    <IconButton
                                        disabled={this.state.editMode !== false}
                                        onClick={() => this.setState({ editMode: i, editData: null })}
                                        size="small"
                                    >
                                        <IconEdit fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                    </TableCell>
                ) : null}

                {this.props.onDelete && !this.props.onUpdate ? (
                    <TableCell
                        className="iob-table-actions"
                        sx={Utils.getStyle(this.props.theme, styles.cell, styles.cellButton)}
                    >
                        {this.state.deleteMode === i ? (
                            <Tooltip title={I18n.t('ra_Delete')}>
                                <span>
                                    <IconButton
                                        color="error"
                                        disabled={
                                            this.state.editMode !== false &&
                                            (!this.state.editData || !Object.keys(this.state.editData).length)
                                        }
                                        onClick={() =>
                                            this.setState(
                                                { deleteMode: false },
                                                () => this.props.onDelete && this.props.onDelete(item),
                                            )
                                        }
                                        size="small"
                                    >
                                        <IconCheck fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : null}
                    </TableCell>
                ) : null}

                {this.props.onUpdate || this.props.onDelete ? (
                    <TableCell
                        className="iob-table-actions"
                        sx={Utils.getStyle(this.props.theme, styles.cell, styles.cellButton)}
                    >
                        {isEditingThis ? (
                            <Tooltip title={I18n.t('ra_Cancel')}>
                                <IconButton
                                    onClick={() => this.setState({ editMode: false, deleteMode: false })}
                                    size="small"
                                >
                                    <IconClose fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        ) : this.props.onDelete ? (
                            <Tooltip title={I18n.t('ra_Delete')}>
                                <span>
                                    <IconButton
                                        disabled={this.state.deleteMode !== false}
                                        onClick={() => this.setState({ deleteMode: i })}
                                        size="small"
                                    >
                                        <IconDelete fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : null}
                    </TableCell>
                ) : null}
            </TableRow>
        );

        if (!level && opened) {
            const items: JSX.Element[] = children.map(it => this.renderLine(it, level + 1)) as JSX.Element[];
            items.unshift(row);
            return items;
        }
        return row;
    }

    handleRequestSort(property: string): void {
        const isAsc = this.state.orderBy === property && this.state.order === 'asc';
        this.setState({ order: isAsc ? 'desc' : 'asc', orderBy: property });
    }

    renderHead(): JSX.Element {
        return (
            <TableHead>
                <TableRow key="headerRow">
                    <TableCell
                        component="th"
                        sx={Utils.getStyle(this.props.theme, styles.cell, styles.cellHeader, styles.cellExpand)}
                    />
                    <TableCell
                        component="th"
                        sx={Utils.getStyle(
                            this.props.theme,
                            styles.cell,
                            styles.cellHeader,
                            styles[`width_${this.props.columns[0].field.replace(/\./g, '_')}`],
                        )}
                        style={this.props.columns[0].headerStyle || this.props.columns[0].cellStyle}
                        sortDirection={
                            this.props.noSort
                                ? false
                                : this.state.orderBy === this.props.columns[0].field
                                  ? this.state.order
                                  : false
                        }
                    >
                        {this.props.noSort ? null : (
                            <TableSortLabel
                                active={this.state.orderBy === this.props.columns[0].field}
                                direction={
                                    this.state.orderBy === this.props.columns[0].field ? this.state.order : 'asc'
                                }
                                onClick={() => this.handleRequestSort(this.props.columns[0].field)}
                            >
                                {this.props.columns[0].title || this.props.columns[0].field}
                                {this.state.orderBy === this.props.columns[0].field ? (
                                    <span style={styles.visuallyHidden}>
                                        {this.state.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </span>
                                ) : null}
                            </TableSortLabel>
                        )}
                    </TableCell>
                    {this.props.columns.map((col, i) =>
                        !i && !col.hidden ? null : (
                            <TableCell
                                key={col.field}
                                sx={Utils.getStyle(
                                    this.props.theme,
                                    styles.cell,
                                    styles.cellHeader,
                                    styles[`width_${col.field.replace(/\./g, '_')}`],
                                )}
                                style={col.headerStyle || col.cellStyle}
                                component="th"
                            >
                                {this.props.noSort ? null : (
                                    <TableSortLabel
                                        active={this.state.orderBy === col.field}
                                        direction={this.state.orderBy === col.field ? this.state.order : 'asc'}
                                        onClick={() => this.handleRequestSort(col.field)}
                                    >
                                        {col.title || col.field}
                                        {this.state.orderBy === col.field ? (
                                            <span style={styles.visuallyHidden}>
                                                {this.state.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                            </span>
                                        ) : null}
                                    </TableSortLabel>
                                )}
                            </TableCell>
                        ),
                    )}
                    {this.props.onUpdate ? (
                        <TableCell
                            component="th"
                            sx={Utils.getStyle(this.props.theme, styles.cell, styles.cellHeader, styles.cellButton)}
                        >
                            {!this.props.noAdd ? (
                                <Tooltip title={I18n.t('ra_Add')}>
                                    <span>
                                        <Fab
                                            color="primary"
                                            size="small"
                                            sx={{ width: 30, height: 30, minHeight: 30, boxShadow: 2 }}
                                            disabled={this.state.editMode !== false}
                                            onClick={() =>
                                                this.props.onUpdate &&
                                                (this.props.onUpdate as (addNew: true) => void)(true)
                                            }
                                        >
                                            <IconAdd fontSize="small" />
                                        </Fab>
                                    </span>
                                </Tooltip>
                            ) : null}
                        </TableCell>
                    ) : null}
                    {this.props.onDelete || this.props.onUpdate ? (
                        <TableCell
                            component="th"
                            sx={Utils.getStyle(this.props.theme, styles.cell, styles.cellHeader, styles.cellButton)}
                        />
                    ) : null}
                </TableRow>
            </TableHead>
        );
    }

    render(): JSX.Element | null {
        const col = this.props.columns.find(_col => _col.field === this.state.orderBy);
        if (col) {
            const lookup = col.lookup;
            const table = stableSort(this.props.data, getComparator(this.state.order, this.state.orderBy, lookup));

            if (this.state.update && this.state.update.length) {
                this.updateTimeout && clearTimeout(this.updateTimeout);
                this.updateTimeout = setTimeout(() => {
                    this.updateTimeout = null;
                    this.setState({ update: null });
                }, 500);
            }

            return (
                <div
                    style={styles.tableContainer}
                    className={this.props.className}
                >
                    <Table
                        style={styles.table}
                        aria-label="simple table"
                        size="small"
                        stickyHeader
                    >
                        {this.renderHead()}
                        <TableBody>{table.map(it => this.renderLine(it))}</TableBody>
                    </Table>
                    {this.renderSelectIdDialog()}
                </div>
            );
        }

        return null;
    }
}
/*
const columns = [
    {
        title: 'Name of field', // required, else it will be "field"
        field: 'fieldIdInData', // required
        editable: false,        // or true [default - true]
        cellStyle: {            // CSS style - // optional
            maxWidth: '12rem',
            overflow: 'hidden',
            wordBreak: 'break-word'
        },
        lookup: {               // optional => edit will be automatically "SELECT"
            'value1': 'text1',
            'value2': 'text2',
        }
    },
    {
        title: 'Type',          // required, else it will be "field"
        field: 'myType',        // required
        editable: true,         // or true [default - true]
        lookup: {               // optional => edit will be automatically "SELECT"
            'number': 'Number',
            'string': 'String',
            'boolean': 'Boolean',
        },
        type: 'number/string/color/oid/icon/boolean', // oid=ObjectID,icon=base64-icon
        editComponent: props =>
            <div>Prefix&#123; <br/>
                <textarea
                    rows={4}
                    style={{width: '100%', resize: 'vertical'}}
                    value={props.value}
                    onChange={e => props.onChange(e.target.value)}
                />
                Suffix
            </div>,
    },
];
*/
/* const data = [
    {
        id: 'UniqueID1' // required
        fieldIdInData: 'Name1',
        myType: 'number',
    },
    {
        id: 'UniqueID2' // required
        fieldIdInData: 'Name12',
        myType: 'string',
    },
];
 */

/*
// STYLES
const styles = theme => ({
    tableDiv: {
        width: '100%',
        overflow: 'hidden',
        height: 'calc(100% - 48px)',
    },
});
// renderTable
renderTable() {
    return <div style={styles.tableDiv}>
        <TreeTable
            columns={this.columns}
            data={lines}
            onUpdate={(newData, oldData) => console.log('Update: ' + JSON.stringify(newData))}
            onDelete={oldData => console.log('Delete: ' + JSON.stringify(oldData))}
        />
    </div>;
}
 */
