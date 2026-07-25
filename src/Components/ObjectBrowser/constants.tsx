/**
 * Copyright 2020-2026, Denis Haev <dogafox@gmail.com>
 *
 * MIT License
 *
 */

import React, { type JSX } from 'react';

import {
    CalendarToday as IconSchedule,
    Code as IconScript,
    Description as IconMeta,
    ListAlt as IconEnum,
    PersonOutlined as IconUser,
    Router as IconHost,
    Settings as IconConfig,
    ShowChart as IconChart,
    SupervisedUserCircle as IconGroup,
} from '@mui/icons-material';

import { IconAdapter } from '../../icons/IconAdapter';
import { IconChannel } from '../../icons/IconChannel';
import { IconClosed } from '../../icons/IconClosed';
import { IconDevice } from '../../icons/IconDevice';
import { IconInstance } from '../../icons/IconInstance';
import { IconState } from '../../icons/IconState';

import type { ObjectBrowserFilter, ObjectBrowserPossibleColumns } from './types';

/** Indent of one level of the tree in pixels */
export const ITEM_LEVEL = 16;
export const SMALL_BUTTON_SIZE = 20;
export const COLOR_NAME_ERROR_DARK = '#ff413c';
export const COLOR_NAME_ERROR_LIGHT = '#86211f';
export const COLOR_NAME_CONNECTED_DARK = '#57ff45';
export const COLOR_NAME_CONNECTED_LIGHT = '#098c04';
export const COLOR_NAME_DISCONNECTED_DARK = '#f3ad11';
export const COLOR_NAME_DISCONNECTED_LIGHT = '#6c5008';

export const DEFAULT_DATE_FORMAT = 'YYYY.MM.DD';

/** Icons of the object types */
export const ITEM_IMAGES: Record<string, JSX.Element> = {
    state: (
        <IconState
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    channel: (
        <IconChannel
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    device: (
        <IconDevice
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    adapter: (
        <IconAdapter
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    meta: (
        <IconMeta
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    instance: (
        <IconInstance
            className="itemIcon"
            style={{ color: '#7da7ff', verticalAlign: 'middle' }}
        />
    ),
    enum: (
        <IconEnum
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    chart: (
        <IconChart
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    config: (
        <IconConfig
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    group: (
        <IconGroup
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    user: (
        <IconUser
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    host: (
        <IconHost
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    schedule: (
        <IconSchedule
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    script: (
        <IconScript
            className="itemIcon"
            style={{ verticalAlign: 'middle' }}
        />
    ),
    folder: (
        <IconClosed
            className="itemIcon itemIconFolder"
            style={{ verticalAlign: 'middle' }}
        />
    ),
};

/** Which columns are visible by which screen width */
export interface ScreenWidthOne {
    idWidth: string | number;
    widths: {
        room?: number;
        val?: number;
        name?: number;
        func?: number;
        buttons?: number;
        type?: number;
        role?: number;
        changedFrom?: number;
        qualityCode?: number;
        timestamp?: number;
        lastChange?: number;
    };
    fields: ObjectBrowserPossibleColumns[];
}

export interface ScreenWidth {
    xs: ScreenWidthOne;
    sm: ScreenWidthOne;
    md: ScreenWidthOne;
    lg: ScreenWidthOne;
    xl: ScreenWidthOne;
}

export const SCREEN_WIDTHS: ScreenWidth = {
    // extra-small: 0px
    xs: { idWidth: '100%', fields: [], widths: {} },
    // small: 600px
    sm: { idWidth: 300, fields: ['room', 'val'], widths: { room: 100, val: 200 } },
    // medium: 960px
    md: {
        idWidth: 300,
        fields: ['room', 'func', 'val', 'buttons'],
        widths: {
            name: 200,
            room: 150,
            func: 150,
            val: 120,
            buttons: 120,
        },
    },
    // large: 1280px
    lg: {
        idWidth: 300,
        fields: [
            'name',
            'type',
            'role',
            'room',
            'func',
            'val',
            'buttons',
            'changedFrom',
            'qualityCode',
            'timestamp',
            'lastChange',
        ],
        widths: {
            name: 300,
            type: 80,
            role: 120,
            room: 180,
            func: 180,
            val: 140,
            buttons: 120,
            changedFrom: 120,
            qualityCode: 100,
            timestamp: 165,
            lastChange: 165,
        },
    },
    // /////////////
    // extra-large: 1920px
    xl: {
        idWidth: 550,
        fields: [
            'name',
            'type',
            'role',
            'room',
            'func',
            'val',
            'buttons',
            'changedFrom',
            'qualityCode',
            'timestamp',
            'lastChange',
        ],
        widths: {
            name: 400,
            type: 80,
            role: 120,
            room: 180,
            func: 180,
            val: 140,
            buttons: 120,
            changedFrom: 120,
            qualityCode: 100,
            timestamp: 170,
            lastChange: 170,
        },
    },
};

/** Empty filter */
export const DEFAULT_FILTER: ObjectBrowserFilter = {
    id: '',
    name: '',
    room: [],
    func: [],
    role: [],
    type: [],
    custom: [],
    expertMode: false,
};
