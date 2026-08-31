import React from 'react';
import { Box } from '@mui/material';

import {
    Cleaner,
    DeviceTypeIcon,
    DoorClosed,
    DoorOpened,
    FireOff,
    FireOn,
    FloodOff,
    FloodOn,
    Gate,
    HeatValve,
    Home,
    Humidity,
    IconAdapter,
    IconAlias,
    IconChannel,
    IconClearFilter,
    IconClosed,
    IconCopy,
    IconDevice,
    IconDocument,
    IconDocumentReadOnly,
    IconExpert,
    IconFx,
    IconHome,
    IconInstance,
    IconLogout,
    IconNoIcon,
    IconOpen,
    IconState,
    IconVacuum,
    Jalousie,
    LoaderMV,
    LoaderNW,
    LoaderPT,
    LoaderVendor,
    Material,
    MotionOff,
    MotionOn,
    PushButton,
    RGB,
    RepairExpert,
    Socket,
    Thermometer,
    ThermometerSimple,
    Thermostat,
    Valve,
    WindowClosed,
    WindowOpened,
    WindowTilted,
    type ThemeType,
} from '../../../src';
import DemoCard, { DemoPage } from './DemoCard';

/** The icons of src/icons - they take the usual MUI icon props */
const UI_ICONS: Record<string, React.FC<any>> = {
    IconAdapter,
    IconAlias,
    IconChannel,
    IconClearFilter,
    IconClosed,
    IconCopy,
    IconDevice,
    IconDocument,
    IconDocumentReadOnly,
    IconExpert,
    IconFx,
    IconInstance,
    IconLogout,
    IconNoIcon,
    IconOpen,
    IconState,
    IconVacuum,
};

/** The device icons of src/Components/DeviceType/icons */
const DEVICE_ICONS: Record<string, React.FC<any>> = {
    Cleaner,
    DoorClosed,
    DoorOpened,
    FireOff,
    FireOn,
    FloodOff,
    FloodOn,
    Gate,
    HeatValve,
    Home,
    Humidity,
    IconHome,
    Jalousie,
    Material,
    MotionOff,
    MotionOn,
    PushButton,
    RGB,
    RepairExpert,
    Socket,
    Thermometer,
    ThermometerSimple,
    Thermostat,
    Valve,
    WindowClosed,
    WindowOpened,
    WindowTilted,
};

/** A few types of `@iobroker/type-detector`, so DeviceTypeIcon is covered as well */
const DEVICE_TYPES = ['light', 'dimmer', 'rgb', 'blind', 'thermostat', 'motion', 'window', 'door', 'vacuumCleaner'];

function IconGrid(props: { icons: Record<string, React.FC<any>> }): React.JSX.Element {
    return (
        <Box
            component="div"
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}
        >
            {Object.keys(props.icons).map(name => {
                const IconComponent = props.icons[name];
                return (
                    <Box
                        component="div"
                        key={name}
                        title={name}
                        sx={{
                            width: 78,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        <IconComponent style={{ width: 26, height: 26 }} />
                        <Box
                            component="span"
                            sx={{ fontSize: '0.62rem', opacity: 0.7, textAlign: 'center', wordBreak: 'break-all' }}
                        >
                            {name}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}

export default function IconsDemo(props: { themeType: ThemeType }): React.JSX.Element {
    return (
        <DemoPage>
            <DemoCard
                title="UI icons"
                hint="src/icons - the icons the object browser and the dialogs use"
                wide
            >
                <IconGrid icons={UI_ICONS} />
            </DemoCard>

            <DemoCard
                title="Device icons"
                hint="src/Components/DeviceType/icons"
                wide
            >
                <IconGrid icons={DEVICE_ICONS} />
            </DemoCard>

            <DemoCard
                title="DeviceTypeIcon"
                hint="icon for a type of @iobroker/type-detector"
                wide
            >
                <Box
                    component="div"
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}
                >
                    {DEVICE_TYPES.map(type => (
                        <Box
                            component="div"
                            key={type}
                            sx={{
                                width: 78,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            <DeviceTypeIcon
                                type={type as any}
                                style={{ width: 26, height: 26 }}
                            />
                            <Box
                                component="span"
                                sx={{ fontSize: '0.62rem', opacity: 0.7 }}
                            >
                                {type}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </DemoCard>

            <DemoCard
                title="Loaders"
                hint="the vendor specific splash screens"
                wide
            >
                <Box
                    component="div"
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}
                >
                    {[
                        { name: 'LoaderVendor', Component: LoaderVendor },
                        { name: 'LoaderPT', Component: LoaderPT },
                        { name: 'LoaderMV', Component: LoaderMV },
                        { name: 'LoaderNW', Component: LoaderNW },
                    ].map(({ name, Component }) => (
                        <Box
                            component="div"
                            key={name}
                            sx={{
                                width: 150,
                                height: 150,
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: 2,
                                border: theme => `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Component
                                size={100}
                                themeType={props.themeType}
                            />
                            <Box
                                component="span"
                                sx={{
                                    position: 'absolute',
                                    bottom: 4,
                                    left: 0,
                                    right: 0,
                                    textAlign: 'center',
                                    fontSize: '0.62rem',
                                    opacity: 0.7,
                                }}
                            >
                                {name}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </DemoCard>
        </DemoPage>
    );
}
