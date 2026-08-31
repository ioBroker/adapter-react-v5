import React, { useState } from 'react';
import { Box, Button, Grid, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Storage as IconStorage, Memory as IconMemory, Cloud as IconCloud } from '@mui/icons-material';

import {
    ColorPicker,
    CustomModal,
    DeviceTypeIcon,
    DeviceTypeSelector,
    Icon,
    IconPicker,
    Image,
    InfoBox,
    SaveCloseButtons,
    SelectWithIcon,
    StatCard,
    TabContainer,
    TabContent,
    TabHeader,
    TableResize,
    TextWithIcon,
    UploadImage,
    Utils,
    copy,
    type IobTheme,
    type ThemeType,
} from '../../../src';
import { I18n } from '../../../src/i18n';
import DemoCard, { DemoPage } from './DemoCard';

/** Objects used by SelectWithIcon and TextWithIcon */
const DEMO_OBJECTS: ioBroker.Object[] = [
    {
        _id: 'enum.rooms.living',
        type: 'enum',
        common: { name: { en: 'Living room', de: 'Wohnzimmer' }, color: '#e53935', icon: '' },
        native: {},
    } as unknown as ioBroker.Object,
    {
        _id: 'enum.rooms.kitchen',
        type: 'enum',
        common: { name: { en: 'Kitchen', de: 'Küche' }, color: '#1e88e5', icon: '' },
        native: {},
    } as unknown as ioBroker.Object,
    {
        _id: 'enum.rooms.bath',
        type: 'enum',
        common: { name: { en: 'Bathroom', de: 'Bad' }, color: '#43a047', icon: '' },
        native: {},
    } as unknown as ioBroker.Object,
];

export default function ComponentsDemo(props: { theme: IobTheme; themeType: ThemeType }): React.JSX.Element {
    const { theme, themeType } = props;
    const [color, setColor] = useState('rgba(62, 122, 224, 0.65)');
    const [room, setRoom] = useState('enum.rooms.kitchen');
    const [icon, setIcon] = useState('');
    const [deviceType, setDeviceType] = useState<any>('dimmer');
    const [uploadedIcon, setUploadedIcon] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalValue, setModalValue] = useState('Some text');
    const [changed, setChanged] = useState(false);
    const [tab, setTab] = useState(0);

    return (
        <DemoPage>
            <DemoCard
                title="InfoBox"
                hint="type: info | warning | error | ok, optionally closeable"
            >
                <Box
                    component="div"
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                    <InfoBox type="info">This is an information</InfoBox>
                    <InfoBox type="warning">Careful with this setting</InfoBox>
                    <InfoBox type="error">Something went wrong</InfoBox>
                    <InfoBox
                        type="ok"
                        closeable
                        storeId="demo-infobox"
                    >
                        Everything is fine - and this one is closeable
                    </InfoBox>
                </Box>
            </DemoCard>

            <DemoCard
                title="StatCard"
                hint="dashboard tile with icon, value, hint and chip"
                wide
            >
                <Box
                    component="div"
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}
                >
                    <StatCard
                        title="Adapters"
                        value="108"
                        hint="6 active / 102 inactive"
                        color="#1e88e5"
                        icon={<IconStorage />}
                        chip={{ label: '3 updates', color: 'warning' }}
                    />
                    <StatCard
                        title="Memory"
                        value="1.4 GB"
                        hint="of 8 GB"
                        color="#43a047"
                        icon={<IconMemory />}
                    />
                    <StatCard
                        title="Cloud"
                        value="--"
                        hint="not connected"
                        color="#8e24aa"
                        valueColor="#8e24aa"
                        icon={<IconCloud />}
                        onClick={() => window.alert('StatCard clicked')}
                    />
                </Box>
            </DemoCard>

            <DemoCard
                title="ColorPicker"
                hint="alpha channel, eye dropper, HEX/RGB/HSL"
                value={color}
            >
                <ColorPicker
                    label="Color"
                    id="demo_components_color"
                    value={color}
                    onChange={setColor}
                />
            </DemoCard>

            <DemoCard
                title="SelectWithIcon"
                hint="select over ioBroker objects, shows icon and color"
                value={room}
            >
                <SelectWithIcon
                    t={I18n.t}
                    lang={I18n.getLanguage()}
                    themeType={themeType}
                    label="Room"
                    fullWidth
                    list={DEMO_OBJECTS}
                    value={room}
                    onChange={setRoom}
                />
            </DemoCard>

            <DemoCard
                title="TextWithIcon"
                hint="renders one object as text with its icon and color"
            >
                <Box
                    component="div"
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                    {DEMO_OBJECTS.map(obj => (
                        // `removePrefix` is the part that is added back before the object is looked up,
                        // so the value must be given without it
                        <TextWithIcon
                            key={obj._id}
                            lang={I18n.getLanguage()}
                            themeType={themeType}
                            list={DEMO_OBJECTS}
                            value={obj._id.replace('enum.rooms.', '')}
                            removePrefix="enum.rooms."
                        />
                    ))}
                </Box>
            </DemoCard>

            <DemoCard
                title="IconPicker"
                hint="pick one of the built-in room/device icons"
                value={icon ? `${icon.substring(0, 40)}...` : ''}
            >
                <IconPicker
                    label="Icon"
                    value={icon}
                    onChange={setIcon}
                />
            </DemoCard>

            <DemoCard
                title="DeviceTypeSelector / DeviceTypeIcon"
                hint="the types of @iobroker/type-detector"
                value={String(deviceType)}
            >
                <Box
                    component="div"
                    sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                    <DeviceTypeSelector
                        themeType={themeType}
                        value={deviceType}
                        onChange={setDeviceType}
                        label="Device type"
                        style={{ flexGrow: 1 }}
                    />
                    <DeviceTypeIcon
                        type={deviceType}
                        style={{ width: 32, height: 32 }}
                    />
                </Box>
            </DemoCard>

            <DemoCard
                title="Icon / Image"
                hint="Icon renders base64, URL or icon names; Image can recolor SVGs"
            >
                <Box
                    component="div"
                    sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                    <Icon
                        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzFlODhlNSIgZD0iTTEyIDJMMiA3djEwbDEwIDUgMTAtNVY3eiIvPjwvc3ZnPg=="
                        style={{ width: 32, height: 32 }}
                    />
                    <Image
                        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTIgMkwyIDd2MTBsMTAgNSAxMC01Vjd6Ii8+PC9zdmc+"
                        color="#fb8c00"
                        sx={{ width: 32, height: 32 }}
                    />
                    <Box
                        component="span"
                        sx={{ fontSize: '0.78rem', opacity: 0.7 }}
                    >
                        base64 SVG, recolored
                    </Box>
                </Box>
            </DemoCard>

            <DemoCard
                title="UploadImage"
                hint="drop zone with cropper"
                wide
                value={uploadedIcon ? `${uploadedIcon.substring(0, 50)}...` : ''}
            >
                <Box
                    component="div"
                    sx={{ height: 180 }}
                >
                    <UploadImage
                        crop
                        icon={uploadedIcon}
                        removeIconFunc={() => setUploadedIcon(null)}
                        onChange={setUploadedIcon}
                    />
                </Box>
            </DemoCard>

            <DemoCard
                title="CustomModal"
                hint="dialog with an apply button and an optional text input"
                value={modalValue}
            >
                <Button
                    variant="contained"
                    onClick={() => setModalOpen(true)}
                >
                    Open modal
                </Button>
                {modalOpen ? (
                    <CustomModal
                        open
                        theme={theme}
                        title="Edit the value"
                        textInput
                        defaultValue={modalValue}
                        onApply={value => {
                            setModalValue(value);
                            setModalOpen(false);
                        }}
                        onClose={() => setModalOpen(false)}
                    >
                        {null}
                    </CustomModal>
                ) : null}
            </DemoCard>

            <DemoCard
                title="TabContainer / TabHeader / TabContent"
                hint="the frame most adapter config pages are built from"
                wide
            >
                <Box
                    component="div"
                    sx={{ height: 200 }}
                >
                    <TabContainer>
                        <TabHeader>
                            <Grid>
                                <Button
                                    variant={tab === 0 ? 'contained' : 'text'}
                                    onClick={() => setTab(0)}
                                >
                                    First
                                </Button>
                                <Button
                                    variant={tab === 1 ? 'contained' : 'text'}
                                    onClick={() => setTab(1)}
                                >
                                    Second
                                </Button>
                            </Grid>
                        </TabHeader>
                        <TabContent overflow="auto">
                            <div>{tab === 0 ? 'Content of the first tab' : 'Content of the second tab'}</div>
                        </TabContent>
                    </TabContainer>
                </Box>
            </DemoCard>

            <DemoCard
                title="TableResize"
                hint="table with columns the user can drag"
                wide
            >
                <TableResize
                    name="demo-table-resize"
                    ready
                    size="small"
                    initialWidths={[200, 150, 'auto']}
                    minWidths={[80, 80, 80]}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {DEMO_OBJECTS.map(obj => (
                            <TableRow key={obj._id}>
                                <TableCell>{obj._id}</TableCell>
                                <TableCell>{Utils.getObjectNameFromObj(obj, I18n.getLanguage())}</TableCell>
                                <TableCell>Drag the column borders in the header</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </TableResize>
            </DemoCard>

            <DemoCard
                title="SaveCloseButtons"
                hint="the button bar GenericApp shows at the bottom"
                wide
            >
                <Box
                    component="div"
                    sx={{ position: 'relative', height: 130 }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => setChanged(!changed)}
                    >
                        {changed ? 'Mark as unchanged' : 'Mark as changed'}
                    </Button>
                    <SaveCloseButtons
                        theme={theme}
                        newReact
                        changed={changed}
                        onSave={close => window.alert(`onSave(${close})`)}
                        onClose={() => setChanged(false)}
                    />
                </Box>
            </DemoCard>

            <DemoCard
                title="copy() / Utils"
                hint="clipboard helper and the color/name utilities"
            >
                <Box
                    component="div"
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => copy('Copied from the gui-components demo')}
                    >
                        copy(text)
                    </Button>
                    <Box
                        component="span"
                        sx={{ fontSize: '0.78rem', opacity: 0.8 }}
                    >
                        Utils.isUseBright(&apos;#1e88e5&apos;) = {String(Utils.isUseBright('#1e88e5'))}
                        <br />
                        Utils.getObjectNameFromObj(...) ={' '}
                        {Utils.getObjectNameFromObj(DEMO_OBJECTS[0], I18n.getLanguage())}
                    </Box>
                </Box>
            </DemoCard>
        </DemoPage>
    );
}
