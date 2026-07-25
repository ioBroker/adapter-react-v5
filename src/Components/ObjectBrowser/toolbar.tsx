/**
 * Copyright 2020-2026, Denis Haev <dogafox@gmail.com>
 *
 * MIT License
 *
 * Part of the object browser, see ./ObjectBrowserClass.tsx
 */
import React, { type JSX } from 'react';
import { Badge, Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, type Theme, Tooltip } from '@mui/material';
import {
    Add as AddIcon,
    Build as BuildIcon,
    Close as IconClose,
    LooksOne as LooksOneIcon,
    Publish as PublishIcon,
    Refresh as RefreshIcon,
    TextFields as TextFieldsIcon,
    ViewColumn as IconColumns,
    ContentPaste,
    UploadFile,
} from '@mui/icons-material';
import { Utils } from '../Utils';
import { IconExpert } from '../../icons/IconExpert';
import { IconClosed } from '../../icons/IconClosed';
import { IconOpen } from '../../icons/IconOpen';
import { IconClearFilter } from '../../icons/IconClearFilter';
import { Icon } from '../Icon';
import {
    colGrow,
    colWidth,
    CustomFilterInput,
    CustomFilterSelect,
    getName,
    getSelectIdIconFromObjects,
    getVisibleItems,
} from './utils';
import { type InputSelectItem } from './types';
import { styles } from './styles';
import { ITEM_IMAGES } from './constants';
import type { ObjectBrowserClass } from './ObjectBrowserClass';

export function getFilterInput(that: ObjectBrowserClass, name: 'id' | 'name'): JSX.Element {
    return (
        <CustomFilterInput
            key={`${name}_${that.state.filterKey}`}
            styles={that.styles.filterInput}
            name={name}
            texts={that.texts}
            t={that.props.t}
            initialValue={that.state.filter[name]}
            onChange={(name, value) => {
                const filter = { ...that.state.filter };
                if (value === undefined) {
                    delete filter[name];
                } else {
                    filter[name] = value;
                }
                that.setState({ filter }, () => {
                    that.doFilter();
                    that.props.onFilterChanged?.(filter);
                });
            }}
        />
    );
}

export function getFilterSelect(
    that: ObjectBrowserClass,
    name: 'room' | 'func' | 'type' | 'custom' | 'role',
    values?: (string | InputSelectItem)[],
): JSX.Element {
    return (
        <CustomFilterSelect
            key={`${name}_${that.state.filterKey}`}
            name={name}
            texts={that.texts}
            initialValue={that.state.filter[name] || []}
            values={values || []}
            onChange={(name, value) => {
                const filter = { ...that.state.filter };
                if (value === undefined) {
                    delete filter[name];
                } else {
                    filter[name] = value;
                }
                that.setState({ filter }, () => {
                    that.doFilter();
                    that.props.onFilterChanged?.(filter);
                });
            }}
        />
    );
}

export function getFilterSelectRole(that: ObjectBrowserClass): JSX.Element {
    return getFilterSelect(
        that,
        'role',
        that.info.roles.map(it => it.role),
    );
}

export function getFilterSelectRoom(that: ObjectBrowserClass): JSX.Element {
    const rooms: InputSelectItem[] = that.info.roomEnums.map(
        id =>
            ({
                name: getName(that.objects[id]?.common?.name, that.props.lang) || id.split('.').pop(),
                value: id,
                icon: (
                    <Icon
                        src={that.objects[id]?.common?.icon || ''}
                        style={styles.selectIcon}
                    />
                ),
            }) as InputSelectItem,
    );

    return getFilterSelect(that, 'room', rooms);
}

export function getFilterSelectFunction(that: ObjectBrowserClass): JSX.Element {
    const func: InputSelectItem[] = that.info.funcEnums.map(
        id =>
            ({
                name: getName(that.objects[id]?.common?.name, that.props.lang) || id.split('.').pop(),
                value: id,
                icon: (
                    <Icon
                        src={that.objects[id]?.common?.icon || ''}
                        style={styles.selectIcon}
                    />
                ),
            }) as InputSelectItem,
    );

    return getFilterSelect(that, 'func', func);
}

export function getFilterSelectType(that: ObjectBrowserClass): JSX.Element {
    const types = that.info.types.map(type => ({
        name: type,
        value: type,
        icon: ITEM_IMAGES[type] || null,
    }));

    return getFilterSelect(that, 'type', types);
}

export function getFilterSelectCustoms(that: ObjectBrowserClass): JSX.Element | null {
    if (that.info.customs.length > 1) {
        const customs = that.info.customs.map(id => ({
            name: id === '_' ? that.texts.filterCustomsWithout : id,
            value: id,
            icon:
                id === '_' ? null : (
                    <Icon
                        src={getSelectIdIconFromObjects(that.objects, id, that.props.lang, that.imagePrefix) || ''}
                        style={styles.selectIcon}
                    />
                ),
        }));
        return getFilterSelect(that, 'custom', customs);
    }
    return null;
}

/**
 * Renders the toolbar.
 */
export function getToolbar(that: ObjectBrowserClass): JSX.Element {
    let allowObjectCreation = false;
    if (that.state.selected.length || that.state.selectedNonObject) {
        const id = that.state.selected[0] || that.state.selectedNonObject;

        if (id.split('.').length < 2 || (that.objects[id] && that.objects[id].type === 'state')) {
            allowObjectCreation = false;
        } else if (that.state.filter.expertMode) {
            allowObjectCreation = true;
        } else if (id.startsWith('alias.0') || id.startsWith('0_userdata')) {
            allowObjectCreation = true;
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                overflowX: 'auto',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                }}
            >
                <Tooltip
                    title={that.props.t('ra_Refresh tree')}
                    slotProps={{ popper: { sx: styles.tooltip } }}
                >
                    <div>
                        <IconButton
                            onClick={() => that.refreshComponent()}
                            disabled={that.state.updating}
                            size="large"
                        >
                            <RefreshIcon />
                        </IconButton>
                    </div>
                </Tooltip>
                {that.props.showExpertButton && !that.props.expertMode && (
                    <Tooltip
                        title={that.props.t('ra_expertMode')}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <IconButton
                            key="expertMode"
                            color={that.state.filter.expertMode ? 'secondary' : 'default'}
                            onClick={() => {
                                const filter = { ...that.state.filter };
                                filter.expertMode = !filter.expertMode;
                                that.localStorage.setItem(
                                    `${that.props.dialogName || 'App'}.objectFilter`,
                                    JSON.stringify(filter),
                                );

                                that.setState({
                                    filter,
                                });
                            }}
                            size="large"
                        >
                            <IconExpert />
                        </IconButton>
                    </Tooltip>
                )}
                {!that.props.disableColumnSelector && that.width !== 'xs' && (
                    <Tooltip
                        title={that.props.t('ra_Configure')}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <IconButton
                            key="columnSelector"
                            color={that.state.columnsAuto ? 'primary' : 'default'}
                            onClick={() => that.setState({ columnsSelectorShow: true })}
                            size="large"
                        >
                            <IconColumns />
                        </IconButton>
                    </Tooltip>
                )}
                {that.width !== 'xs' && that.state.expandAllVisible && (
                    <Tooltip
                        title={that.props.t('ra_Expand all nodes')}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <IconButton
                            key="expandAll"
                            onClick={() => that.onExpandAll()}
                            size="large"
                        >
                            <IconOpen />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip
                    title={that.props.t('ra_Collapse all nodes')}
                    slotProps={{ popper: { sx: styles.tooltip } }}
                >
                    <IconButton
                        key="collapseAll"
                        onClick={() => that.onCollapseAll()}
                        size="large"
                    >
                        <IconClosed />
                    </IconButton>
                </Tooltip>
                {that.width !== 'xs' && (
                    <Tooltip
                        title={that.props.t('ra_Expand one step node')}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <IconButton
                            key="expandVisible"
                            color="primary"
                            onClick={() => that.onExpandVisible()}
                            size="large"
                        >
                            <Badge
                                badgeContent={that.state.depth}
                                color="secondary"
                                sx={(theme: Theme) => ({
                                    badge: {
                                        right: 3,
                                        top: 3,
                                        border: `2px solid ${theme.palette.background.paper}`,
                                        padding: '0 4px',
                                    },
                                })}
                            >
                                <IconOpen />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                )}
                {that.width !== 'xs' && (
                    <Tooltip
                        title={that.props.t('ra_Collapse one step node')}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <IconButton
                            key="collapseVisible"
                            color="primary"
                            onClick={() => that.onCollapseVisible()}
                            size="large"
                        >
                            <Badge
                                sx={(theme: Theme) => ({
                                    badge: {
                                        right: 3,
                                        top: 3,
                                        border: `2px solid ${theme.palette.background.paper}`,
                                        padding: '0 4px',
                                    },
                                })}
                                badgeContent={that.state.depth}
                                color="secondary"
                            >
                                <IconClosed />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                )}
                {that.props.objectStatesView && (
                    <Tooltip
                        title={that.props.t('ra_Toggle the states view')}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <IconButton
                            onClick={() => that.onStatesViewVisible()}
                            size="large"
                        >
                            <LooksOneIcon color={that.state.statesView ? 'primary' : 'inherit'} />
                        </IconButton>
                    </Tooltip>
                )}

                <Tooltip
                    title={that.props.t('ra_Show/Hide object descriptions')}
                    slotProps={{ popper: { sx: styles.tooltip } }}
                >
                    <IconButton
                        onClick={() => {
                            that.localStorage.setItem(
                                `${that.props.dialogName || 'App'}.desc`,
                                that.state.showDescription ? 'false' : 'true',
                            );
                            that.setState({ showDescription: !that.state.showDescription });
                        }}
                        size="large"
                    >
                        <TextFieldsIcon color={that.state.showDescription ? 'primary' : 'inherit'} />
                    </IconButton>
                </Tooltip>

                {that.props.objectAddBoolean ? (
                    <Tooltip
                        title={that.toolTipObjectCreating()}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <div>
                            <IconButton
                                disabled={!allowObjectCreation}
                                onClick={() =>
                                    that.setState({
                                        modalNewObj: {
                                            id: that.state.selected[0] || that.state.selectedNonObject,
                                        },
                                    })
                                }
                                size="large"
                            >
                                <AddIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                ) : null}

                {that.props.objectImportExport && (
                    <Tooltip
                        title={that.props.t('ra_Add objects tree from JSON file')}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <IconButton
                            onClick={e => {
                                if (that.props.objectBrowserInsertJsonObjects) {
                                    that.setState({ showImportMenu: e.currentTarget });
                                } else {
                                    that.onOpenFile();
                                }
                            }}
                            size="large"
                        >
                            <PublishIcon />
                        </IconButton>
                    </Tooltip>
                )}
                {that.props.objectBrowserInsertJsonObjects ? (
                    <Menu
                        anchorEl={that.state.showImportMenu}
                        open={!!that.state.showImportMenu}
                        onClose={() => that.setState({ showImportMenu: null })}
                    >
                        <MenuItem onClick={() => that.setState({ showImportMenu: null }, () => that.onOpenFile())}>
                            <ListItemIcon>
                                <UploadFile />
                            </ListItemIcon>
                            <ListItemText>{that.props.t('ra_From file')}</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => that.setState({ showImportMenu: null, showImportDialog: true })}>
                            <ListItemIcon>
                                <ContentPaste />
                            </ListItemIcon>
                            <ListItemText>{that.props.t('ra_From text')}</ListItemText>
                        </MenuItem>
                    </Menu>
                ) : null}
                {that.props.objectImportExport && (!!that.state.selected.length || that.state.selectedNonObject) && (
                    <Tooltip
                        title={that.props.t('ra_Save objects tree as JSON file')}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <IconButton
                            onClick={() => that.setState({ showExportDialog: that._getSelectedIdsForExport().length })}
                            size="large"
                        >
                            <PublishIcon style={{ transform: 'rotate(180deg)' }} />
                        </IconButton>
                    </Tooltip>
                )}
            </div>
            {!!that.props.objectBrowserEditObject && that.width !== 'xs' && (
                <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                    {`${that.props.t('ra_Objects')}: ${Object.keys(that.info.objects).length}, ${that.props.t(
                        'ra_States',
                    )}: ${Object.keys(that.info.objects).filter(el => that.info.objects[el].type === 'state').length}`}
                </div>
            )}
            {that.props.objectEditBoolean && (
                <Tooltip
                    title={that.props.t('ra_Edit custom config')}
                    slotProps={{ popper: { sx: styles.tooltip } }}
                >
                    <IconButton
                        onClick={() => {
                            // get all visible states
                            const ids = that.root ? getVisibleItems(that.root, 'state', that.objects) : [];

                            if (ids.length) {
                                that.pauseSubscribe(true);

                                if (ids.length === 1) {
                                    that.localStorage.setItem(
                                        `${that.props.dialogName || 'App'}.objectSelected`,
                                        that.state.selected[0],
                                    );
                                    that.props.router?.doNavigate(null, 'custom', that.state.selected[0]);
                                }
                                that.setState({ customDialog: ids, customDialogAll: true });
                            } else {
                                that.setState({ toast: that.props.t('ra_please select object') });
                            }
                        }}
                        size="large"
                    >
                        <BuildIcon />
                    </IconButton>
                </Tooltip>
            )}
        </div>
    );
}

/**
 * Render the right handle for resizing
 */
export function renderHandleRight(that: ObjectBrowserClass): JSX.Element {
    return (
        <Box
            component="div"
            className="iob-ob-resize-handler"
            sx={{ ...styles.resizeHandle, ...styles.resizeHandleRight }}
            onMouseDown={that.resizerMouseDown}
            onDoubleClick={that.resizerReset}
            title={that.props.t('ra_Double click to reset table layout')}
        />
    );
}

export function renderHeader(that: ObjectBrowserClass): JSX.Element {
    let filterClearInValue = null;

    if (!that.columnsVisibility.buttons && !that.isFilterEmpty()) {
        filterClearInValue = (
            <IconButton
                onClick={() => that.clearFilter()}
                style={styles.buttonClearFilter}
                title={that.props.t('ra_Clear filter')}
                size="large"
            >
                <IconClearFilter />
                <IconClose style={styles.buttonClearFilterIcon} />
            </IconButton>
        );
    }

    if (that.width === 'xs') {
        return (
            <div style={Utils.getStyle(that.props.theme, styles.headerRow)}>
                <div style={{ ...styles.headerCell, width: '100%' }}>{getFilterInput(that, 'id')}</div>
            </div>
        );
    }

    return (
        <div style={Utils.getStyle(that.props.theme, styles.headerRow)}>
            <div
                style={{ ...styles.headerCell, width: colWidth('id'), flexGrow: colGrow('id'), position: 'relative' }}
                data-min={240}
                data-name="id"
            >
                {getFilterInput(that, 'id')}
                {renderHandleRight(that)}
            </div>
            {that.columnsVisibility.name ? (
                <div
                    style={{
                        ...styles.headerCell,
                        width: colWidth('name'),
                        flexGrow: colGrow('name'),
                        position: 'relative',
                    }}
                    data-min={100}
                    data-name="name"
                >
                    {getFilterInput(that, 'name')}
                    {renderHandleRight(that)}
                </div>
            ) : null}
            {!that.state.statesView && (
                <>
                    {that.columnsVisibility.type ? (
                        <div
                            style={{
                                ...styles.headerCell,
                                width: colWidth('type'),
                                position: 'relative',
                            }}
                            data-min={100}
                            data-name="type"
                        >
                            {getFilterSelectType(that)}
                            {renderHandleRight(that)}
                        </div>
                    ) : null}
                    {that.columnsVisibility.role ? (
                        <div
                            style={{
                                ...styles.headerCell,
                                width: colWidth('role'),
                                position: 'relative',
                            }}
                            data-min={100}
                            data-name="role"
                        >
                            {getFilterSelectRole(that)}
                            {renderHandleRight(that)}
                        </div>
                    ) : null}
                    {that.columnsVisibility.room ? (
                        <div
                            style={{
                                ...styles.headerCell,
                                width: colWidth('room'),
                                position: 'relative',
                            }}
                            data-min={100}
                            data-name="room"
                        >
                            {getFilterSelectRoom(that)}
                            {renderHandleRight(that)}
                        </div>
                    ) : null}
                    {that.columnsVisibility.func ? (
                        <div
                            style={{
                                ...styles.headerCell,
                                width: colWidth('func'),
                                position: 'relative',
                            }}
                            data-min={100}
                            data-name="func"
                        >
                            {getFilterSelectFunction(that)}
                            {renderHandleRight(that)}
                        </div>
                    ) : null}
                </>
            )}
            {that.state.statesView && (
                <>
                    <div
                        style={{
                            ...styles.headerCell,
                            ...styles.headerCellValue,
                            width: colWidth('changedFrom'),
                            position: 'relative',
                        }}
                        data-min={100}
                        data-name="changedFrom"
                    >
                        {that.props.t('ra_Changed from')}
                        {renderHandleRight(that)}
                    </div>
                    <div
                        style={{
                            ...styles.headerCell,
                            ...styles.headerCellValue,
                            width: colWidth('qualityCode'),
                            position: 'relative',
                        }}
                        data-min={100}
                        data-name="qualityCode"
                    >
                        {that.props.t('ra_Quality code')}
                        {renderHandleRight(that)}
                    </div>
                    <div
                        style={{
                            ...styles.headerCell,
                            ...styles.headerCellValue,
                            width: colWidth('timestamp'),
                            position: 'relative',
                        }}
                        data-min={100}
                        data-name="timestamp"
                    >
                        {that.props.t('ra_Timestamp')}
                        {renderHandleRight(that)}
                    </div>
                    <div
                        style={{
                            ...styles.headerCell,
                            ...styles.headerCellValue,
                            width: colWidth('lastChange'),
                            position: 'relative',
                        }}
                        data-min={100}
                        data-name="lastChange"
                    >
                        {that.props.t('ra_Last change')}
                        {renderHandleRight(that)}
                    </div>
                </>
            )}
            {that.adapterColumns.map(item => (
                <div
                    style={{
                        ...styles.headerCell,
                        ...styles.headerCellValue,
                        width: (that.columnsVisibility as Record<string, number | string>)[item.id],
                    }}
                    title={item.adapter}
                    key={item.id}
                    data-min={100}
                    data-name={item.id}
                >
                    {item.name}
                </div>
            ))}
            {that.columnsVisibility.val ? (
                <div
                    style={{
                        ...styles.headerCell,
                        ...styles.headerCellValue,
                        width: colWidth('val'),
                        position: 'relative',
                    }}
                    data-min={120}
                    data-name="val"
                >
                    {that.props.t('ra_Value')}
                    {filterClearInValue}
                </div>
            ) : null}
            {that.columnsVisibility.buttons ? (
                <div
                    title={that.texts.filter_custom}
                    style={{ ...styles.headerCell, width: colWidth('buttons') }}
                >
                    {' '}
                    {getFilterSelectCustoms(that)}
                </div>
            ) : null}
        </div>
    );
}
