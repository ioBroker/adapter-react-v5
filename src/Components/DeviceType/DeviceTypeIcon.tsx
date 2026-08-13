import React, { useEffect } from 'react';

import { Box, Tooltip } from '@mui/material';

import { AiOutlineLineChart as TypeIconChart } from 'react-icons/ai';
import { GoDeviceCameraVideo as TypeIconCamera } from 'react-icons/go';

import {
    // FaExternalLinkSquareAlt as TypeIconURL,
    FaImage as TypeIconImage,
    FaRegLightbulb as TypeIconDimmer,
    FaInfoCircle as TypeIconInfo,
    FaLightbulb as TypeIconLight,
    FaLock as TypeIconLock,
    FaStreetView as TypeIconLocation,
    FaStepForward as TypeIconMedia,
    FaSlidersH as TypeIconSlider,
    FaVolumeDown as TypeIconVolume,
    FaVolumeUp as TypeIconVolumeGroup,
    FaFan as TypeIconAC,
    FaWrench as TypeIconInstance,
} from 'react-icons/fa';

import {
    MdFormatColorFill as TypeIconHUE,
    MdFormatColorFill as TypeIconCT,
    MdWarning as TypeIconWarning,
    MdQuestionMark as TypeIconUnknown,
    MdOutlineMyLocation as TypeIconLocationOne,
    MdDeviceHub as TypeIconHub3,
    MdPolyline as TypeIconNode,
    MdHub as TypeIconHub5,
    MdControlCamera as TypeIconController,
    MdAir as TypeIconAirQuality,
    MdElectricMeter as TypeIconElectricity,
} from 'react-icons/md';
import { WiCloudy as TypeIconWeather } from 'react-icons/wi';
import { IoIosRadioButtonOn as TypeIconButtonSensor } from 'react-icons/io';
import {
    TbSunElectricity as TypeIconIlluminance,
    TbAlarmSmoke as TypeIconCoAlarm,
    TbBarrel as TypeIconFillLevel,
    TbRipple as TypeIconFlow,
    TbGauge as TypeIconPressure,
    TbEngine as TypeIconPump,
    TbCircuitSwitchClosed as TypeIconContact,
} from 'react-icons/tb';
import { PiPaletteDuotone as TypeIconRGBWSingle, PiFan as TypeIconFan } from 'react-icons/pi';
import { LuAirVent as TypeIconAirPurifier } from 'react-icons/lu';

import { Types } from '@iobroker/type-detector';

import { I18n } from '../../i18n';
import { Icon } from '../Icon';

import {
    Cleaner as TypeIconVacuumCleaner,
    Humidity as TypeIconHumidity,
    Jalousie as TypeIconBlinds,
    PushButton as TypeIconButton,
    DoorOpened as TypeIconDoor,
    FireOn as TypeIconFireAlarm,
    FloodOn as TypeIconFloodAlarm,
    Gate as TypeIconGate,
    MotionOn as TypeIconMotion,
    RGB as TypeIconRGB,
    Socket as TypeIconSocket,
    Thermometer as TypeIconTemperature,
    Thermostat as TypeIconThermostat,
    // HeatValve as TypeIconValve,
    WindowOpened as TypeIconWindow,
    WindowTilted as TypeIconWindowTilt,
    type IconPropsSVG,
} from './icons';
import { extendDeviceTypeTranslation } from './deviceTypeTranslations';

export type TypesExtended = Types | 'invalid' | 'hub3' | 'node' | 'hub5' | 'controller';

/**
 * Icon for every device type.
 *
 * This map is deliberately a complete `Record` over `TypesExtended`: when `@iobroker/type-detector`
 * adds a new member to `Types`, the build fails here until an icon is assigned. Never add keys that
 * are not part of `TypesExtended` (a single `@ts-expect-error` inside the literal would suppress the
 * completeness check for the whole object) — put those in `ROLE_ICONS` below.
 */
const TYPE_ICONS: Record<TypesExtended, React.FC<IconPropsSVG>> = {
    [Types.airCondition]: TypeIconAC,
    [Types.airPurifier]: TypeIconAirPurifier,
    [Types.airQuality]: TypeIconAirQuality,
    [Types.blind]: TypeIconBlinds,
    [Types.blindButtons]: TypeIconBlinds,
    [Types.button]: TypeIconButton,
    [Types.buttonSensor]: TypeIconButtonSensor,
    [Types.camera]: TypeIconCamera,
    [Types.chart]: TypeIconChart,
    [Types.coAlarm]: TypeIconCoAlarm,
    [Types.contact]: TypeIconContact,
    // [Types.url]: TypeIconURL,
    [Types.image]: TypeIconImage,
    [Types.dimmer]: TypeIconDimmer,
    [Types.door]: TypeIconDoor,
    [Types.electricity]: TypeIconElectricity,
    [Types.fan]: TypeIconFan,
    [Types.fillLevel]: TypeIconFillLevel,
    [Types.fireAlarm]: TypeIconFireAlarm,
    [Types.floodAlarm]: TypeIconFloodAlarm,
    [Types.flow]: TypeIconFlow,
    [Types.gate]: TypeIconGate,
    [Types.humidity]: TypeIconHumidity,
    [Types.illuminance]: TypeIconIlluminance,
    [Types.info]: TypeIconInfo,
    [Types.light]: TypeIconLight,
    [Types.lock]: TypeIconLock,
    [Types.location]: TypeIconLocation,
    [Types.locationOne]: TypeIconLocationOne,
    [Types.media]: TypeIconMedia,
    [Types.motion]: TypeIconMotion,
    [Types.ct]: TypeIconCT,
    [Types.percentage]: TypeIconSlider,
    [Types.pressure]: TypeIconPressure,
    [Types.pump]: TypeIconPump,
    [Types.rgb]: TypeIconRGB,
    [Types.rgbSingle]: TypeIconRGB,
    [Types.rgbwSingle]: TypeIconRGBWSingle,
    [Types.hue]: TypeIconHUE,
    [Types.cie]: TypeIconRGB,
    [Types.slider]: TypeIconSlider,
    [Types.socket]: TypeIconSocket,
    [Types.temperature]: TypeIconTemperature,
    [Types.thermostat]: TypeIconThermostat,
    // [Types.valve]: TypeIconValve,
    [Types.vacuumCleaner]: TypeIconVacuumCleaner,
    [Types.volume]: TypeIconVolume,
    [Types.volumeGroup]: TypeIconVolumeGroup,
    [Types.window]: TypeIconWindow,
    [Types.windowTilt]: TypeIconWindowTilt,
    [Types.weatherCurrent]: TypeIconWeather,
    [Types.weatherForecast]: TypeIconWeather,
    [Types.warning]: TypeIconWarning,

    [Types.unknown]: TypeIconUnknown,
    [Types.instance]: TypeIconInstance,

    // Special matter types
    invalid: TypeIconWarning,
    hub3: TypeIconHub3,
    node: TypeIconNode,
    hub5: TypeIconHub5,
    controller: TypeIconController,
};

/** Icons for state roles that may be given as `src` instead of a device type */
const ROLE_ICONS: Record<string, React.FC<IconPropsSVG>> = {
    'sensor.alarm.fire': TypeIconFireAlarm,
    'sensor.alarm.flood': TypeIconFloodAlarm,
};

const ALL_ICONS: Record<string, React.FC<IconPropsSVG>> = { ...TYPE_ICONS, ...ROLE_ICONS };

function isKnownIcon(src: unknown): src is TypesExtended {
    return typeof src === 'string' && Object.prototype.hasOwnProperty.call(ALL_ICONS, src);
}

const defaultStyle: React.CSSProperties = {
    width: 32,
    height: 32,
};

export interface IconProps {
    /** URL, UTF-8 character, or svg code (data:image/svg...) */
    src?: string | React.JSX.Element | null | undefined;
    /** Class name */
    className?: string;
    /** Style for image */
    style?: React.CSSProperties;
    /** Styles for mui */
    sx?: Record<string, any>;
    /** Tooltip */
    title?: string | true;
    /** Styles for utf-8 characters */
    styleUTF8?: React.CSSProperties;
    /** On error handler */
    onError?: React.ReactEventHandler<HTMLImageElement>;
    /** Reference to image */
    ref?: React.RefObject<HTMLImageElement>;
    /** Alternative text for image */
    alt?: string;
    /** On click handler */
    onClick?: React.MouseEventHandler<any>;
}

export type TypeIconProps = IconProps & { type?: TypesExtended };

export function DeviceTypeIcon(props: TypeIconProps): React.JSX.Element | null {
    const [loaded, setLoaded] = React.useState(false);

    useEffect(() => {
        if (props.title && !loaded) {
            extendDeviceTypeTranslation();
            setLoaded(true);
        }
    }, [props.title, loaded]);

    if (!loaded && props.title) {
        return (
            <Box
                style={{ ...defaultStyle, ...(props.style || undefined) }}
                className={props.className}
                sx={props.sx}
            />
        );
    }
    // src could contain a device type or a state role too, so detect if it is a type
    const type: TypesExtended | undefined = props.type || (isKnownIcon(props.src) ? props.src : undefined);

    if (!type && props.src) {
        return (
            <Icon
                style={defaultStyle}
                {...props}
                title={props.title === true ? undefined : props.title}
                src={props.src}
            />
        );
    }

    const TypeIcon = type && ALL_ICONS[type];
    if (!TypeIcon) {
        // Show the first letter of a type
        return type ? (
            <span style={{ ...defaultStyle, ...(props.style || undefined) }}>{type[0].toUpperCase()}</span>
        ) : null;
    }

    const icon = (
        <TypeIcon
            style={{ ...defaultStyle, ...(props.style || undefined) }}
            onClick={props.onClick}
            className={props.className}
            sx={props.sx}
        />
    );

    if (props.title) {
        return (
            <Tooltip
                slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                title={props.title === true ? I18n.t(`type-${type}`) : props.title}
            >
                <div style={{ display: 'flex' }}>{icon}</div>
            </Tooltip>
        );
    }

    return icon;
}
