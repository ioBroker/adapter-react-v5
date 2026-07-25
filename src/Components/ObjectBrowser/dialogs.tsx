/**
 * Copyright 2020-2026, Denis Haev <dogafox@gmail.com>
 *
 * MIT License
 *
 * Part of the object browser, see ./ObjectBrowserClass.tsx
 */
import React, { type JSX } from 'react';
import { Utils } from '../Utils';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fab,
    FormControlLabel,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Snackbar,
    Switch,
    TextField,
} from '@mui/material';
import { Check as IconCheck, Close as IconClose } from '@mui/icons-material';
import { IconExpert } from '../../icons/IconExpert';
import { getCustomValue, getName, getSelectIdIconFromObjects } from './utils';
import { type ObjectBrowserPossibleColumns } from './types';
import { styles } from './styles';
import { DEFAULT_DATE_FORMAT } from './constants';
import type { ObjectBrowserClass } from './ObjectBrowserClass';

/**
 * Renders the error dialog.
 */
export function renderErrorDialog(that: ObjectBrowserClass): JSX.Element | null {
    return that.state.error ? (
        <Dialog
            open={!0}
            maxWidth="sm"
            fullWidth
            onClose={() => that.setState({ error: '' })}
            aria-labelledby="error-dialog-title"
            aria-describedby="error-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{that.props.t('ra_Error')}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{that.state.error}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => that.setState({ error: '' })}
                    color="primary"
                    autoFocus
                    startIcon={<IconCheck />}
                >
                    {that.props.t('ra_Ok')}
                </Button>
            </DialogActions>
        </Dialog>
    ) : null;
}

export function _renderDefinedList(that: ObjectBrowserClass, isLast: boolean): JSX.Element[] {
    const cols = [...that.possibleCols];
    cols.unshift('id');
    if (that.props.columns && !that.props.columns.includes('buttons')) {
        const pos = cols.indexOf('buttons');
        if (pos !== -1) {
            cols.splice(pos, 1);
        }
    }
    return cols
        .filter(id => (isLast && (id === 'val' || id === 'buttons')) || (!isLast && id !== 'val' && id !== 'buttons'))
        .map(id => (
            <ListItemButton
                onClick={() => {
                    if (!that.state.columnsAuto && id !== 'id') {
                        const columns = [...(that.state.columns || [])];
                        const pos = columns.indexOf(id);
                        if (pos === -1) {
                            columns.push(id);
                            columns.sort();
                        } else {
                            columns.splice(pos, 1);
                        }
                        that.localStorage.setItem(`${that.props.dialogName || 'App'}.columns`, JSON.stringify(columns));
                        that.calculateColumnsVisibility(null, columns);
                        that.setState({ columns });
                    }
                }}
                key={id}
            >
                <Checkbox
                    edge="start"
                    disabled={id === 'id' || that.state.columnsAuto}
                    checked={
                        id === 'id' ||
                        !!(that.state.columnsAuto ? that.visibleCols.includes(id) : that.state.columns?.includes(id))
                    }
                    disableRipple
                />
                <ListItemText primary={that.texts[`filter_${id}`] || that.props.t(`ra_${id}`)} />
            </ListItemButton>
        ));
}

/**
 * Renders the columns' selector.
 */
export function renderColumnsSelectorDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.columnsSelectorShow) {
        return null;
    }
    return (
        <Dialog
            onClose={() => that.setState({ columnsSelectorShow: false })}
            open={!0}
            sx={{
                '& .MuiPaper-root': Utils.getStyle(
                    that.props.theme,
                    styles.dialogColumns,
                    styles[`transparent_${that.state.columnsDialogTransparent}`],
                ),
            }}
        >
            <DialogTitle sx={styles.fontSizeTitle}>{that.props.t('ra_Configure')}</DialogTitle>
            <DialogContent sx={styles.fontSizeTitle}>
                <FormControlLabel
                    style={styles.switchColumnAuto}
                    control={
                        <Switch
                            checked={that.state.foldersFirst}
                            onChange={() => {
                                that.localStorage.setItem(
                                    `${that.props.dialogName || 'App'}.foldersFirst`,
                                    that.state.foldersFirst ? 'false' : 'true',
                                );
                                that.setState({ foldersFirst: !that.state.foldersFirst });
                            }}
                        />
                    }
                    label={that.props.t('ra_Folders always first')}
                />
                <FormControlLabel
                    style={styles.switchColumnAuto}
                    control={
                        <Switch
                            checked={that.state.linesEnabled}
                            onChange={() => {
                                that.localStorage.setItem(
                                    `${that.props.dialogName || 'App'}.lines`,
                                    that.state.linesEnabled ? 'false' : 'true',
                                );
                                that.setState({ linesEnabled: !that.state.linesEnabled });
                            }}
                        />
                    }
                    label={that.props.t('ra_Show lines between rows')}
                />
                <FormControlLabel
                    style={styles.switchColumnAuto}
                    control={
                        <Switch
                            checked={that.state.columnsAuto}
                            onChange={() => {
                                that.localStorage.setItem(
                                    `${that.props.dialogName || 'App'}.columnsAuto`,
                                    that.state.columnsAuto ? 'false' : 'true',
                                );
                                if (!that.state.columnsAuto) {
                                    that.calculateColumnsVisibility(true);
                                    that.setState({ columnsAuto: true });
                                } else if (!that.state.columns) {
                                    that.calculateColumnsVisibility(false, [...that.visibleCols]);
                                    that.setState({ columnsAuto: false, columns: [...that.visibleCols] });
                                } else {
                                    that.calculateColumnsVisibility(false);
                                    that.setState({ columnsAuto: false });
                                }
                            }}
                        />
                    }
                    label={that.props.t('ra_Auto (no custom columns)')}
                />
                <List>
                    {_renderDefinedList(that, false)}

                    {that.state.columnsForAdmin &&
                        Object.keys(that.state.columnsForAdmin)
                            .sort()
                            .map(adapter =>
                                that.state.columnsForAdmin?.[adapter].map(column => (
                                    <ListItemButton
                                        onClick={() => {
                                            if (!that.state.columnsAuto) {
                                                const columns = [...(that.state.columns || [])];
                                                const id: ObjectBrowserPossibleColumns =
                                                    `_${adapter}_${column.path}` as ObjectBrowserPossibleColumns;
                                                const pos = columns.indexOf(id);
                                                if (pos === -1) {
                                                    columns.push(id);
                                                    columns.sort();
                                                } else {
                                                    columns.splice(pos, 1);
                                                }
                                                that.calculateColumnsVisibility(null, columns);
                                                that.localStorage.setItem(
                                                    `${that.props.dialogName || 'App'}.columns`,
                                                    JSON.stringify(columns),
                                                );
                                                that.setState({ columns });
                                            }
                                        }}
                                        key={`${adapter}_${column.name}`}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                disabled={that.state.columnsAuto}
                                                edge="start"
                                                checked={
                                                    !that.state.columnsAuto &&
                                                    that.state.columns?.includes(
                                                        `_${adapter}_${column.path}` as ObjectBrowserPossibleColumns,
                                                    )
                                                }
                                                disableRipple
                                            />
                                        </ListItemIcon>
                                        <ListItemText primary={`${column.name} (${adapter})`} />
                                    </ListItemButton>
                                )),
                            )}
                    {_renderDefinedList(that, true)}
                </List>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => that.setState({ columnsSelectorShow: false })}
                    color="primary"
                    startIcon={<IconClose />}
                >
                    {that.texts.close}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function renderExportDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (that.state.showExportDialog === false) {
        return null;
    }
    return (
        <Dialog
            open={!0}
            maxWidth="lg"
        >
            <DialogTitle>{that.props.t('ra_Select type of export')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {that.state.filter.expertMode || that.state.showAllExportOptions ? (
                        <>
                            {that.props.t('ra_You can export all objects or just the selected branch.')}
                            <br />
                            {that.props.t('ra_Selected %s object(s)', that.state.showExportDialog)}
                            <br />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={that.state.noStatesByExportImport}
                                        onChange={e => that.setState({ noStatesByExportImport: e.target.checked })}
                                    />
                                }
                                label={that.props.t('ra_Do not export values of states')}
                            />
                            <br />
                            {that.props.t('These options can reduce the size of the export file:')}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={that.state.beautifyJsonExport}
                                        onChange={e => that.setState({ beautifyJsonExport: e.target.checked })}
                                    />
                                }
                                label={that.props.t('Beautify JSON output')}
                            />
                            <br />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={that.state.excludeSystemRepositoriesFromExport}
                                        onChange={e =>
                                            that.setState({ excludeSystemRepositoriesFromExport: e.target.checked })
                                        }
                                    />
                                }
                                label={that.props.t('Exclude system repositories from export JSON')}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={that.state.excludeTranslations}
                                        onChange={e => that.setState({ excludeTranslations: e.target.checked })}
                                    />
                                }
                                label={that.props.t('Exclude translations (except english) from export JSON')}
                            />
                        </>
                    ) : null}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {that.state.filter.expertMode || that.state.showAllExportOptions ? (
                    <Button
                        color="grey"
                        variant="outlined"
                        onClick={() =>
                            that.setState({ showExportDialog: false, showAllExportOptions: false }, () =>
                                that._exportObjects({
                                    isAll: true,
                                    noStatesByExportImport: that.state.noStatesByExportImport,
                                    beautify: that.state.beautifyJsonExport,
                                    excludeSystemRepositories: that.state.excludeSystemRepositoriesFromExport,
                                    excludeTranslations: that.state.excludeTranslations,
                                }),
                            )
                        }
                    >
                        <span style={{ marginRight: 8 }}>{that.props.t('ra_All objects')}</span>(
                        {Object.keys(that.objects).length})
                    </Button>
                ) : (
                    <Button
                        color="grey"
                        variant="outlined"
                        startIcon={<IconExpert />}
                        onClick={() => that.setState({ showAllExportOptions: true })}
                    >
                        {that.props.t('ra_Advanced options')}
                    </Button>
                )}
                <Button
                    color="primary"
                    variant="contained"
                    autoFocus
                    onClick={() =>
                        that.setState({ showExportDialog: false, showAllExportOptions: false }, () =>
                            that._exportObjects({
                                isAll: false,
                                noStatesByExportImport: that.state.noStatesByExportImport,
                                beautify: that.state.beautifyJsonExport,
                                excludeSystemRepositories: that.state.excludeSystemRepositoriesFromExport,
                                excludeTranslations: that.state.excludeTranslations,
                            }),
                        )
                    }
                >
                    <span style={{ marginRight: 8 }}>{that.props.t('ra_Only selected')}</span>(
                    {that.state.showExportDialog})
                </Button>
                <Button
                    color="grey"
                    variant="contained"
                    onClick={() => that.setState({ showExportDialog: false, showAllExportOptions: false })}
                    startIcon={<IconClose />}
                >
                    {that.props.t('ra_Cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function renderRenameDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.showRenameDialog) {
        return null;
    }
    const ObjectMoveRenameDialog = that.props.objectMoveRenameDialog!;
    return (
        <ObjectMoveRenameDialog
            expertMode={!!that.props.expertMode}
            onClose={() => that.setState({ showRenameDialog: null })}
            id={that.state.showRenameDialog.id}
            childrenIds={that.state.showRenameDialog.childrenIds}
            theme={that.props.theme}
            socket={that.props.socket}
            t={that.props.t}
            objectType={that.objects[that.state.showRenameDialog.id]?.type}
        />
    );
}

export function renderInputJsonDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.showImportDialog) {
        return null;
    }
    const ObjectBrowserInsertJsonObjects = that.props.objectBrowserInsertJsonObjects!;
    return (
        <ObjectBrowserInsertJsonObjects
            onClose={(text?: string): void => {
                that.setState({ showImportDialog: false });
                if (text) {
                    void that.parseJsonFile(text);
                }
            }}
            themeName={that.props.themeName}
            themeType={that.props.themeType}
            t={that.props.t}
        />
    );
}

export function renderEnumDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.enumDialog) {
        return null;
    }
    const type = that.state.enumDialog.type;
    const item = that.state.enumDialog.item;
    const itemEnums: string[] = that.state.enumDialogEnums!;
    const enumsOriginal = that.state.enumDialog.enumsOriginal;

    const enums = (type === 'room' ? that.info.roomEnums : that.info.funcEnums)
        .map(id => ({
            name: getName(that.objects[id]?.common?.name || id.split('.').pop() || '', that.props.lang),
            value: id,
            icon: getSelectIdIconFromObjects(that.objects, id, that.props.lang, that.imagePrefix),
        }))
        .sort((a, b) => (a.name > b.name ? 1 : -1));

    enums.forEach(_item => {
        if (_item.icon && typeof _item.icon === 'string') {
            _item.icon = (
                <Box style={styles.enumIconDiv}>
                    <img
                        src={_item.icon}
                        style={styles.enumIcon}
                        alt={_item.name}
                    />
                </Box>
            );
        }
    });

    // const hasIcons = !!enums.find(item => item.icon);

    return (
        <Dialog
            sx={{ '& .MuiPaper-root': styles.enumDialog }}
            onClose={() => that.setState({ enumDialog: null })}
            aria-labelledby="enum-dialog-title"
            open={!0} // true
        >
            <DialogTitle
                id="enum-dialog-title"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    flexWrap: 'nowrap',
                    gap: 8,
                    paddingRight: 12,
                }}
            >
                {type === 'func' ? that.props.t('ra_Define functions') : that.props.t('ra_Define rooms')}
                <Fab
                    color="primary"
                    disabled={enumsOriginal === JSON.stringify(itemEnums)}
                    size="small"
                    onClick={() =>
                        that
                            .syncEnum(item.data.id, type, itemEnums)
                            .then(() => that.setState({ enumDialog: null, enumDialogEnums: null }))
                    }
                >
                    <IconCheck />
                </Fab>
            </DialogTitle>
            <List sx={{ '&.MuiList-root': styles.enumList }}>
                {enums.map(_item => {
                    let id;
                    let name;
                    let icon;

                    if (typeof _item === 'object') {
                        id = _item.value;
                        name = _item.name;
                        icon = _item.icon;
                    } else {
                        id = _item;
                        name = _item;
                    }
                    const labelId = `checkbox-list-label-${id}`;

                    return (
                        <ListItem
                            sx={styles.headerCellSelectItem}
                            key={id}
                            onClick={() => {
                                const pos = itemEnums.indexOf(id);
                                const enumDialogEnums: string[] = JSON.parse(
                                    JSON.stringify(that.state.enumDialogEnums),
                                );
                                if (pos === -1) {
                                    enumDialogEnums.push(id);
                                    enumDialogEnums.sort();
                                } else {
                                    enumDialogEnums.splice(pos, 1);
                                }
                                that.setState({ enumDialogEnums });
                            }}
                            secondaryAction={icon}
                        >
                            <ListItemIcon sx={{ '&.MuiListItemIcon-root': styles.enumCheckbox }}>
                                <Checkbox
                                    edge="start"
                                    checked={itemEnums.includes(id)}
                                    tabIndex={-1}
                                    disableRipple
                                    slotProps={{
                                        input: { 'aria-labelledby': labelId },
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId}>{name}</ListItemText>
                        </ListItem>
                    );
                })}
            </List>
        </Dialog>
    );
}

export function renderEditRoleDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.roleDialog || !that.props.objectBrowserEditRole) {
        return null;
    }

    if (that.state.roleDialog && that.props.objectBrowserEditRole) {
        const ObjectBrowserEditRole = that.props.objectBrowserEditRole;

        return (
            <ObjectBrowserEditRole
                key="objectBrowserEditRole"
                id={that.state.roleDialog}
                socket={that.props.socket}
                t={that.props.t}
                roleArray={that.info.roles}
                commonType={that.info.objects[that.state.roleDialog]?.common?.type}
                onClose={(obj?: ioBroker.Object | null) => {
                    if (obj && that.state.roleDialog) {
                        that.info.objects[that.state.roleDialog] = obj;
                    }
                    that.setState({ roleDialog: null });
                }}
            />
        );
    }
    return null;
}

export function renderColumnsEditCustomDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.columnsEditCustomDialog) {
        return null;
    }
    if (!that.customColumnDialog) {
        const value = getCustomValue(that.state.columnsEditCustomDialog.obj, that.state.columnsEditCustomDialog.it);
        that.customColumnDialog = {
            type: (that.state.columnsEditCustomDialog.it.type || typeof value) as 'boolean' | 'string' | 'number',
            initValue: (value === null || value === undefined ? '' : value).toString(),
            value: (value === null || value === undefined ? '' : value).toString(),
        };
    }

    return (
        <Dialog
            onClose={() => that.setState({ columnsEditCustomDialog: null })}
            maxWidth="md"
            aria-labelledby="custom-dialog-title"
            open={!0}
        >
            <DialogTitle id="custom-dialog-title">
                {`${that.props.t('ra_Edit object field')}: ${that.state.columnsEditCustomDialog.obj._id}`}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {that.customColumnDialog.type === 'boolean' ? (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    onKeyUp={e => e.key === 'Enter' && that.onColumnsEditCustomDialogClose(true)}
                                    defaultChecked={that.customColumnDialog.value === 'true'}
                                    onChange={e => {
                                        const customColumnDialog: {
                                            value: boolean | number | string;
                                            type: 'boolean' | 'number' | 'string';
                                            initValue: boolean | number | string;
                                        } = that.customColumnDialog as {
                                            value: boolean | number | string;
                                            type: 'boolean' | 'number' | 'string';
                                            initValue: boolean | number | string;
                                        };

                                        customColumnDialog.value = e.target.checked.toString();
                                        const changed = customColumnDialog.value !== customColumnDialog.initValue;
                                        if (changed === !that.state.customColumnDialogValueChanged) {
                                            that.setState({ customColumnDialogValueChanged: changed });
                                        }
                                    }}
                                />
                            }
                            label={`${that.state.columnsEditCustomDialog.it.name} (${that.state.columnsEditCustomDialog.it.pathText})`}
                        />
                    ) : (
                        <TextField
                            variant="standard"
                            defaultValue={that.customColumnDialog.value}
                            fullWidth
                            onKeyUp={e => e.key === 'Enter' && that.onColumnsEditCustomDialogClose(true)}
                            label={`${that.state.columnsEditCustomDialog.it.name} (${that.state.columnsEditCustomDialog.it.pathText})`}
                            onChange={e => {
                                const customColumnDialog: {
                                    value: boolean | number | string;
                                    type: 'boolean' | 'number' | 'string';
                                    initValue: boolean | number | string;
                                } = that.customColumnDialog as {
                                    value: boolean | number | string;
                                    type: 'boolean' | 'number' | 'string';
                                    initValue: boolean | number | string;
                                };

                                customColumnDialog.value = e.target.value;
                                const changed = customColumnDialog.value !== customColumnDialog.initValue;
                                if (changed === !that.state.customColumnDialogValueChanged) {
                                    that.setState({ customColumnDialogValueChanged: changed });
                                }
                            }}
                            autoFocus
                        />
                    )}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => that.onColumnsEditCustomDialogClose(true)}
                    disabled={!that.state.customColumnDialogValueChanged}
                    color="primary"
                    startIcon={<IconCheck />}
                >
                    {that.props.t('ra_Update')}
                </Button>
                <Button
                    color="grey"
                    variant="contained"
                    onClick={() => that.onColumnsEditCustomDialogClose()}
                    startIcon={<IconClose />}
                >
                    {that.props.t('ra_Cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function renderToast(that: ObjectBrowserClass): JSX.Element {
    return (
        <Snackbar
            open={!!that.state.toast}
            autoHideDuration={3000}
            onClick={() => that.setState({ toast: '' })}
            onClose={() => that.setState({ toast: '' })}
            message={that.state.toast}
            action={
                <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={() => that.setState({ toast: '' })}
                >
                    <IconClose fontSize="small" />
                </IconButton>
            }
        />
    );
}

export function renderCustomDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (that.state.customDialog && that.props.objectCustomDialog && that.systemConfig) {
        const ObjectCustomDialog = that.props.objectCustomDialog;

        return (
            <ObjectCustomDialog
                reportChangedIds={(changedIds: string[]) => (that.changedIds = [...changedIds])}
                objectIDs={that.state.customDialog}
                allVisibleObjects={!!that.state.customDialogAll}
                expertMode={that.state.filter.expertMode}
                isFloatComma={
                    that.props.isFloatComma === undefined
                        ? (that.systemConfig?.common.isFloatComma ?? true)
                        : that.props.isFloatComma
                }
                t={that.props.t}
                lang={that.props.lang}
                socket={that.props.socket}
                themeName={that.props.themeName}
                themeType={that.props.themeType}
                theme={that.props.theme}
                objects={that.objects}
                customsInstances={that.info.customs}
                onClose={() => {
                    that.pauseSubscribe(false);
                    that.setState({ customDialog: null });
                    if (that.changedIds) {
                        that.changedIds = null;
                        // update all changed IDs
                        that.forceUpdate();
                    }

                    that.props.router?.doNavigate('tab-objects');
                }}
                systemConfig={that.systemConfig}
            />
        );
    }
    return null;
}

export function renderEditObjectDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.editObjectDialog || !that.props.objectBrowserEditObject) {
        return null;
    }

    // Guard against opening the editor for a node without a real object (e.g. a virtual folder
    // that only exists because child states share an ID prefix). Its constructor reads obj._id.
    if (!that.objects[that.state.editObjectDialog]) {
        return null;
    }

    const ObjectBrowserEditObject = that.props.objectBrowserEditObject;

    return (
        <ObjectBrowserEditObject
            key={that.state.editObjectDialog}
            obj={that.objects[that.state.editObjectDialog]}
            roleArray={that.info.roles}
            objects={that.objects}
            dateFormat={that.props.dateFormat || that.systemConfig?.common.dateFormat || DEFAULT_DATE_FORMAT}
            isFloatComma={
                that.props.isFloatComma === undefined
                    ? (that.systemConfig?.common.isFloatComma ?? true)
                    : that.props.isFloatComma
            }
            themeType={that.props.themeType}
            theme={that.props.theme}
            socket={that.props.socket}
            dialogName={that.props.dialogName}
            aliasTab={that.state.editObjectAlias}
            t={that.props.t}
            expertMode={!!that.state.filter.expertMode}
            onNewObject={(obj: ioBroker.AnyObject) =>
                that.props.socket
                    .setObject(obj._id, obj)
                    .then(() =>
                        that.setState({ editObjectDialog: obj._id, editObjectAlias: false }, () =>
                            that.onSelect(obj._id),
                        ),
                    )
                    .catch(e => that.showError(`Cannot write object: ${e}`))
            }
            onClose={(obj?: ioBroker.AnyObject) => {
                if (obj) {
                    let updateAlias: string;
                    if (that.state.editObjectDialog.startsWith('alias.')) {
                        if (
                            JSON.stringify(that.objects[that.state.editObjectDialog].common?.alias) !==
                            JSON.stringify((obj as ioBroker.StateObject).common?.alias)
                        ) {
                            updateAlias = that.state.editObjectDialog;
                        }
                    }

                    that.props.socket
                        .setObject(obj._id, obj)
                        .then(() => {
                            if (updateAlias && that.subscribes.includes(updateAlias)) {
                                that.unsubscribe(updateAlias);
                                setTimeout(() => that.subscribe(updateAlias), 100);
                            }
                        })
                        .catch(e => that.showError(`Cannot write object: ${e}`));
                }
                that.setState({ editObjectDialog: '', editObjectAlias: false });
            }}
            width={that.width}
        />
    );
}

export function renderViewObjectFileDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.viewFileDialog || !that.props.objectBrowserViewFile) {
        return null;
    }
    const ObjectBrowserViewFile = that.props.objectBrowserViewFile;

    return (
        <ObjectBrowserViewFile
            key="viewFile"
            obj={that.objects[that.state.viewFileDialog]}
            socket={that.props.socket}
            t={that.props.t}
            onClose={() => that.setState({ viewFileDialog: '' })}
        />
    );
}

export function renderAliasEditorDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.props.objectBrowserAliasEditor || !that.state.showAliasEditor) {
        return null;
    }
    const ObjectBrowserAliasEditor = that.props.objectBrowserAliasEditor;

    return (
        <ObjectBrowserAliasEditor
            key="editAlias"
            obj={that.objects[that.state.showAliasEditor]}
            roleArray={that.info.roles}
            objects={that.objects}
            socket={that.props.socket}
            t={that.props.t}
            onClose={() => that.setState({ showAliasEditor: '' })}
            onRedirect={(id: string, timeout?: number) =>
                setTimeout(
                    () =>
                        that.onSelect(id, false, () =>
                            that.expandAllSelected(() => {
                                that.scrollToItem(id);
                                setTimeout(
                                    () =>
                                        that.setState({
                                            editObjectDialog: id,
                                            showAliasEditor: '',
                                            editObjectAlias: true,
                                        }),
                                    300,
                                );
                            }),
                        ),
                    timeout || 0,
                )
            }
        />
    );
}

export function renderAliasMenu(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.aliasMenu) {
        return null;
    }

    return (
        <Menu
            key="aliasmenu"
            open={!0}
            anchorEl={window.document.getElementById(`alias_${that.state.aliasMenu}`)}
            onClose={() => that.setState({ aliasMenu: '' })}
        >
            {that.info.aliasesMap[that.state.aliasMenu].map((aliasId, i) => (
                <MenuItem
                    key={aliasId}
                    onClick={() => that.onSelect(aliasId)}
                >
                    <ListItemText>
                        {that.renderAliasLink(that.state.aliasMenu, i, {
                            '& .admin-browser-arrow': {
                                mr: '8px',
                            },
                        })}
                    </ListItemText>
                </MenuItem>
            ))}
        </Menu>
    );
}

export function renderEditValueDialog(that: ObjectBrowserClass): JSX.Element | null {
    if (!that.state.updateOpened || !that.props.objectBrowserValue) {
        return null;
    }

    if (!that.edit.id) {
        console.error(`Invalid ID for edit: ${JSON.stringify(that.edit)}`);
        return null;
    }

    if (!that.objects[that.edit.id]) {
        console.error(`Something went wrong. Possibly the object ${that.edit.id} was deleted.`);
        return null;
    }

    const type = that.objects[that.edit.id].common?.type
        ? that.objects[that.edit.id].common.type
        : typeof that.edit.val;

    const role = that.objects[that.edit.id].common.role;

    const ObjectBrowserValue = that.props.objectBrowserValue;

    return (
        <ObjectBrowserValue
            t={that.props.t}
            lang={that.props.lang}
            type={type}
            role={role || ''}
            states={Utils.getStates(that.objects[that.edit.id] as ioBroker.StateObject)}
            themeType={that.props.themeType}
            theme={that.props.theme}
            expertMode={!!that.state.filter.expertMode}
            value={that.edit.val}
            socket={that.props.socket}
            object={that.objects[that.edit.id] as ioBroker.StateObject}
            defaultHistory={that.defaultHistory}
            dateFormat={that.props.dateFormat || that.systemConfig?.common.dateFormat || DEFAULT_DATE_FORMAT}
            isFloatComma={
                that.props.isFloatComma === undefined
                    ? (that.systemConfig?.common.isFloatComma ?? true)
                    : that.props.isFloatComma
            }
            onClose={(res?: {
                val: ioBroker.StateValue;
                ack: boolean;
                q: ioBroker.STATE_QUALITY[keyof ioBroker.STATE_QUALITY];
                expire: number | undefined;
            }) => {
                that.setState({ updateOpened: false });
                if (res) {
                    that.onUpdate(res);
                }
            }}
            width={that.width}
        />
    );
}
