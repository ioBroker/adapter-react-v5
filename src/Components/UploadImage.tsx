import React, { Component, createRef, type JSX } from 'react';
import Dropzone, { type FileRejection } from 'react-dropzone';
import { Cropper, type ReactCropperElement } from 'react-cropper';

import { Menu, MenuItem, Tooltip, IconButton, Box } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';

import { Close as IconClose, Crop as CropIcon } from '@mui/icons-material';

import { I18n } from '../i18n';
import { Icon } from './Icon';
import { IconUpload } from './AnimatedIcons/IconUpload';
import { IconResult } from './AnimatedIcons/IconResult';
import { play } from './AnimatedIcons/common';

/** How long the result of an upload stays visible */
const RESULT_DURATION = 2500;

// import 'cropperjs/dist/cropper.css';
const cropperStyles = `
/*!
 * Cropper.js v1.5.12
 * https://fengyuanchen.github.io/cropperjs
 *
 * Copyright 2015-present Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2021-06-12T08:00:11.623Z
 */

.cropper-container {
  direction: ltr;
  font-size: 0;
  line-height: 0;
  position: relative;
  -ms-touch-action: none;
  touch-action: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.cropper-container img {
  display: block;
  height: 100%;
  image-orientation: 0deg;
  max-height: none !important;
  max-width: none !important;
  min-height: 0 !important;
  min-width: 0 !important;
  width: 100%;
}

.cropper-wrap-box,
.cropper-canvas,
.cropper-drag-box,
.cropper-crop-box,
.cropper-modal {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.cropper-wrap-box,
.cropper-canvas {
  overflow: hidden;
}

.cropper-drag-box {
  background-color: #fff;
  opacity: 0;
}

.cropper-modal {
  background-color: #000;
  opacity: 0.5;
}

.cropper-view-box {
  display: block;
  height: 100%;
  outline: 1px solid #39f;
  outline-color: rgba(51, 153, 255, 0.75);
  overflow: hidden;
  width: 100%;
}

.cropper-dashed {
  border: 0 dashed #eee;
  display: block;
  opacity: 0.5;
  position: absolute;
}

.cropper-dashed.dashed-h {
  border-bottom-width: 1px;
  border-top-width: 1px;
  height: calc(100% / 3);
  left: 0;
  top: calc(100% / 3);
  width: 100%;
}

.cropper-dashed.dashed-v {
  border-left-width: 1px;
  border-right-width: 1px;
  height: 100%;
  left: calc(100% / 3);
  top: 0;
  width: calc(100% / 3);
}

.cropper-center {
  display: block;
  height: 0;
  left: 50%;
  opacity: 0.75;
  position: absolute;
  top: 50%;
  width: 0;
}

.cropper-center::before,
.cropper-center::after {
  background-color: #eee;
  content: ' ';
  display: block;
  position: absolute;
}

.cropper-center::before {
  height: 1px;
  left: -3px;
  top: 0;
  width: 7px;
}

.cropper-center::after {
  height: 7px;
  left: 0;
  top: -3px;
  width: 1px;
}

.cropper-face,
.cropper-line,
.cropper-point {
  display: block;
  height: 100%;
  opacity: 0.1;
  position: absolute;
  width: 100%;
}

.cropper-face {
  background-color: #fff;
  left: 0;
  top: 0;
}

.cropper-line {
  background-color: #39f;
}

.cropper-line.line-e {
  cursor: ew-resize;
  right: -3px;
  top: 0;
  width: 5px;
}

.cropper-line.line-n {
  cursor: ns-resize;
  height: 5px;
  left: 0;
  top: -3px;
}

.cropper-line.line-w {
  cursor: ew-resize;
  left: -3px;
  top: 0;
  width: 5px;
}

.cropper-line.line-s {
  bottom: -3px;
  cursor: ns-resize;
  height: 5px;
  left: 0;
}

.cropper-point {
  background-color: #39f;
  height: 5px;
  opacity: 0.75;
  width: 5px;
}

.cropper-point.point-e {
  cursor: ew-resize;
  margin-top: -3px;
  right: -3px;
  top: 50%;
}

.cropper-point.point-n {
  cursor: ns-resize;
  left: 50%;
  margin-left: -3px;
  top: -3px;
}

.cropper-point.point-w {
  cursor: ew-resize;
  left: -3px;
  margin-top: -3px;
  top: 50%;
}

.cropper-point.point-s {
  bottom: -3px;
  cursor: s-resize;
  left: 50%;
  margin-left: -3px;
}

.cropper-point.point-ne {
  cursor: nesw-resize;
  right: -3px;
  top: -3px;
}

.cropper-point.point-nw {
  cursor: nwse-resize;
  left: -3px;
  top: -3px;
}

.cropper-point.point-sw {
  bottom: -3px;
  cursor: nesw-resize;
  left: -3px;
}

.cropper-point.point-se {
  bottom: -3px;
  cursor: nwse-resize;
  height: 20px;
  opacity: 1;
  right: -3px;
  width: 20px;
}

@media (min-width: 768px) {
  .cropper-point.point-se {
    height: 15px;
    width: 15px;
  }
}

@media (min-width: 992px) {
  .cropper-point.point-se {
    height: 10px;
    width: 10px;
  }
}

@media (min-width: 1200px) {
  .cropper-point.point-se {
    height: 5px;
    opacity: 0.75;
    width: 5px;
  }
}

.cropper-point.point-se::before {
  background-color: #39f;
  bottom: -50%;
  content: ' ';
  display: block;
  height: 200%;
  opacity: 0;
  position: absolute;
  right: -50%;
  width: 200%;
}

.cropper-invisible {
  opacity: 0;
}

.cropper-bg {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
}

.cropper-hide {
  display: block;
  height: 0;
  position: absolute;
  width: 0;
}

.cropper-hidden {
  display: none !important;
}

.cropper-move {
  cursor: move;
}

.cropper-crop {
  cursor: crosshair;
}

.cropper-disabled .cropper-drag-box,
.cropper-disabled .cropper-face,
.cropper-disabled .cropper-line,
.cropper-disabled .cropper-point {
  cursor: not-allowed;
}
`;

const styles: Record<string, React.CSSProperties> = {
    dropZone: {
        width: '100%',
        height: 100,
        position: 'relative',
    },
    dropZoneEmpty: {},
    image: {
        objectFit: 'contain',
        margin: 'auto',
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    /** The new image fades in */
    imageWrapper: {
        display: 'flex',
        width: '100%',
        height: '100%',
    },

    uploadDiv: {
        position: 'relative',
        width: '100%',
        height: 300,
        opacity: 0.9,
        marginTop: 30,
        cursor: 'pointer',
        outline: 'none',
    },
    uploadDivDragging: {
        opacity: 1,
        background: 'rgba(128,255,128,0.1)',
    },

    /** The border is set with `dropAreaSx`, so that it can pulse */
    uploadCenterDiv: {
        margin: 5,
        borderRadius: 5,
        width: 'calc(100% - 10px)',
        height: 'calc(100% - 10px)',
        position: 'relative',
        display: 'flex',
    },
    uploadCenterIcon: {
        marginTop: 10,
    },
    uploadCenterText: {
        fontSize: 16,
    },
    /** A file is dragged over an existing image */
    dropOverImage: {
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
    },
    /** Upload and its result in the corner of the image */
    uploadIndicator: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 223,
        display: 'flex',
        padding: 4,
        borderRadius: '50%',
        pointerEvents: 'none',
    },
    uploadCenterTextAndIcon: {
        textAlign: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledOpacity: {
        opacity: 0.3,
        cursor: 'default',
    },
    buttonRemoveWrapper: {
        position: 'absolute',
        zIndex: 222,
        right: 0,
    },
    buttonCropWrapper: {
        position: 'absolute',
        zIndex: 222,
        right: 0,
        top: 50,
    },
};

/** Border of the drop area: red on error, and it pulses while a file is dragged over it */
function dropAreaSx(theme: Theme, error: boolean, dragging: boolean): any {
    if (error) {
        return { border: '2px solid red', boxSizing: 'border-box' };
    }
    if (!dragging) {
        return { border: '3px dashed grey' };
    }
    return {
        border: `3px dashed ${theme.palette.primary.main}`,
        animation: 'iob-upload-image-pulse 1.2s ease-in-out infinite',
        '@keyframes iob-upload-image-pulse': {
            '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}` },
            '70%, 100%': { boxShadow: `0 0 0 14px ${alpha(theme.palette.primary.main, 0)}` },
        },
        '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
        },
    };
}

interface UploadImageProps {
    maxSize?: number;
    disabled?: boolean;
    crop?: boolean;
    error?: boolean;
    onChange: (base64: string) => void | undefined;
    icon: string | null;
    removeIconFunc: () => void | null;
    accept?: Record<string, string[]>;
    /**
     * The parent uploads the image given with `onChange`, e.g. writes it into a file: the upload arrow moves up in
     * the corner of the image. When it becomes false, a check mark is shown there for a moment.
     */
    uploading?: boolean;
    /** The upload failed: when `uploading` becomes false, a cross is shown instead of the check mark */
    uploadError?: boolean;
}

interface UploadImageState {
    uploadFile: boolean | 'dragging';
    anchorEl: HTMLElement | null;
    cropHandler: boolean;
    /** The dropped file is being read */
    reading: boolean;
    /** Result of the last upload of the parent, shown for a moment */
    result: { type: 'success' | 'error'; count: number } | null;
}

export class UploadImage extends Component<UploadImageProps, UploadImageState> {
    private readonly cropperRef: React.RefObject<ReactCropperElement | null>;

    private readonly imageRef: React.RefObject<HTMLDivElement | null>;

    private resultTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(props: UploadImageProps) {
        super(props);

        this.state = {
            uploadFile: false,
            anchorEl: null,
            cropHandler: false,
            reading: false,
            result: null,
        };
        this.cropperRef = createRef();
        this.imageRef = createRef();

        if (!window.document.getElementById('cropper-style-json-component')) {
            const style = window.document.createElement('style');
            style.setAttribute('id', 'cropper-style-json-component');
            style.innerHTML = cropperStyles;
            window.document.head.appendChild(style);
        }
    }

    componentDidUpdate(prevProps: UploadImageProps): void {
        if (prevProps.uploading && !this.props.uploading) {
            this.showResult(this.props.uploadError ? 'error' : 'success');
        }
        if (this.props.icon && prevProps.icon !== this.props.icon) {
            // the new image fades in
            play(
                this.imageRef.current,
                [
                    { opacity: 0, transform: 'scale(0.92)' },
                    { opacity: 1, transform: 'scale(1)' },
                ],
                { duration: 280, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
            );
        }
    }

    componentWillUnmount(): void {
        if (this.resultTimeout) {
            clearTimeout(this.resultTimeout);
            this.resultTimeout = null;
        }
    }

    /** Shows a check mark or a cross in the corner of the image for a moment */
    showResult(type: 'success' | 'error'): void {
        if (this.resultTimeout) {
            clearTimeout(this.resultTimeout);
        }
        this.setState({ result: { type, count: (this.state.result?.count || 0) + 1 } });
        this.resultTimeout = setTimeout(() => {
            this.resultTimeout = null;
            this.setState({ result: null });
        }, RESULT_DURATION);
    }

    onDrop(acceptedFiles: File[]): void {
        const onChange = this.props.onChange;
        const maxSize = this.props.maxSize || 10 * 1024;

        const file = acceptedFiles[0];
        const reader = new FileReader();

        // the upload arrow moves up while the file is read
        reader.onabort = () => {
            console.log('file reading was aborted');
            this.setState({ reading: false });
        };
        reader.onerror = () => {
            console.log('file reading has failed');
            this.setState({ reading: false });
        };
        reader.onload = () => {
            this.setState({ reading: false });
            if (!file || !file.name) {
                return;
            }
            const parts = file.name?.split('.');
            let ext = parts?.length ? `image/${parts.pop()?.toLowerCase()}` : 'image/jpeg';
            if (ext === 'image/jpg') {
                ext = 'image/jpeg';
            } else if (ext.includes('svg')) {
                ext = 'image/svg+xml';
            }
            if (file.size > maxSize) {
                window.alert(I18n.t('ra_File is too big. Max %sk allowed. Try use SVG.', Math.round(maxSize / 1024)));
            } else {
                const base64 = `data:${ext};base64,${btoa(
                    new Uint8Array(reader.result as ArrayBufferLike).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        '',
                    ),
                )}`;

                if (onChange) {
                    onChange(base64);
                } else {
                    console.log(base64);
                }
            }
        };
        this.setState({ reading: true });
        reader.readAsArrayBuffer(file);
    }

    /** Upload of the parent and its result in the corner of the image (without image, the big upload symbol shows it) */
    renderUploadIndicator(): JSX.Element | null {
        const { result } = this.state;
        if (!this.props.icon || (!result && !this.props.uploading)) {
            return null;
        }
        return (
            <Box
                style={styles.uploadIndicator}
                sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
            >
                {result ? (
                    <IconResult
                        type={result.type}
                        replay={result.count}
                    />
                ) : (
                    <IconUpload uploading />
                )}
            </Box>
        );
    }

    render(): JSX.Element {
        const { disabled, icon, removeIconFunc, error, crop, onChange } = this.props;
        const maxSize = this.props.maxSize || 10 * 1024;
        let accept = this.props.accept || { 'image/*': [] };
        const { uploadFile, anchorEl, cropHandler } = this.state;
        const dragging = uploadFile === 'dragging';

        // covert '"image/png"' to { 'image/*': [] }
        if (typeof accept === 'string') {
            accept = { [accept]: [] };
        } else if (Array.isArray(accept)) {
            const result: Record<string, string[]> = {};
            accept.forEach(item => {
                result[item] = [];
            });
            accept = result;
        }

        return (
            <Dropzone
                disabled={!!disabled || cropHandler}
                key="dropzone"
                multiple={false}
                accept={accept}
                maxSize={maxSize}
                onDragEnter={() => this.setState({ uploadFile: 'dragging' })}
                onDragLeave={() => this.setState({ uploadFile: true })}
                onDrop={(acceptedFiles: File[], errors: FileRejection[]) => {
                    this.setState({ uploadFile: false });
                    if (!acceptedFiles.length) {
                        window.alert(errors?.[0]?.errors?.[0]?.message || I18n.t('ra_Cannot upload'));
                    } else {
                        this.onDrop(acceptedFiles);
                    }
                }}
            >
                {({ getRootProps, getInputProps }) => (
                    <div
                        style={{
                            ...styles.uploadDiv,
                            ...(uploadFile === 'dragging' ? styles.uploadDivDragging : undefined),
                            ...styles.dropZone,
                            ...(disabled ? styles.disabledOpacity : undefined),
                            ...(!icon ? styles.dropZoneEmpty : undefined),
                        }}
                        {...getRootProps()}
                    >
                        <input {...getInputProps()} />
                        <Box
                            style={styles.uploadCenterDiv}
                            sx={(theme: Theme) => dropAreaSx(theme, !!error, dragging)}
                        >
                            {!icon ? (
                                <div style={styles.uploadCenterTextAndIcon}>
                                    {/* bobs while a file is dragged over it, moves up while it is read or uploaded */}
                                    <IconUpload
                                        fontSize={48}
                                        style={styles.uploadCenterIcon}
                                        ready={dragging}
                                        uploading={this.state.reading || !!this.props.uploading}
                                    />
                                    <div style={styles.uploadCenterText}>
                                        {dragging
                                            ? I18n.t('ra_Drop file here')
                                            : I18n.t(
                                                  'ra_Place your files here or click here to open the browse dialog',
                                              )}
                                    </div>
                                </div>
                            ) : (
                                removeIconFunc &&
                                !cropHandler && (
                                    <div style={styles.buttonRemoveWrapper}>
                                        <Tooltip
                                            title={I18n.t('ra_Clear')}
                                            slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                        >
                                            <IconButton
                                                size="large"
                                                onClick={e => {
                                                    removeIconFunc && removeIconFunc();
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <IconClose />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                )
                            )}
                            {icon && crop && (
                                <div style={styles.buttonCropWrapper}>
                                    <Tooltip
                                        title={I18n.t('ra_Crop')}
                                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                    >
                                        <IconButton
                                            size="large"
                                            onClick={e => {
                                                if (!cropHandler) {
                                                    this.setState({ cropHandler: true });
                                                } else {
                                                    this.setState({ anchorEl: e.currentTarget });
                                                }
                                                e.stopPropagation();
                                            }}
                                        >
                                            <CropIcon color={cropHandler ? 'primary' : 'inherit'} />
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={anchorEl}
                                        keepMounted
                                        open={Boolean(anchorEl)}
                                        onClose={() => this.setState({ anchorEl: null })}
                                    >
                                        <MenuItem
                                            onClick={() =>
                                                this.setState({ anchorEl: null, cropHandler: false }, () => {
                                                    const imageElement = this.cropperRef?.current?.cropper;
                                                    if (imageElement) {
                                                        if (onChange) {
                                                            onChange(imageElement.getCroppedCanvas().toDataURL());
                                                        } else {
                                                            console.log(imageElement.getCroppedCanvas().toDataURL());
                                                        }
                                                    }
                                                })
                                            }
                                        >
                                            {I18n.t('ra_Save')}
                                        </MenuItem>
                                        <MenuItem onClick={() => this.setState({ anchorEl: null, cropHandler: false })}>
                                            {I18n.t('ra_Close')}
                                        </MenuItem>
                                    </Menu>
                                </div>
                            )}
                            {icon && !cropHandler ? (
                                <div
                                    ref={this.imageRef}
                                    style={styles.imageWrapper}
                                >
                                    <Icon
                                        src={icon}
                                        style={styles.image}
                                        alt="icon"
                                    />
                                </div>
                            ) : null}
                            {icon && dragging ? (
                                // a new image is dragged over the existing one
                                <Box
                                    style={{ ...styles.uploadCenterTextAndIcon, ...styles.dropOverImage }}
                                    sx={(theme: Theme) => ({
                                        bgcolor: alpha(theme.palette.background.paper, 0.85),
                                    })}
                                >
                                    <IconUpload
                                        fontSize={48}
                                        style={styles.uploadCenterIcon}
                                        ready
                                    />
                                    <div style={styles.uploadCenterText}>{I18n.t('ra_Drop file here')}</div>
                                </Box>
                            ) : null}
                            {this.renderUploadIndicator()}

                            {icon && crop && cropHandler ? (
                                <Cropper
                                    ref={this.cropperRef}
                                    style={styles.image}
                                    src={icon}
                                    initialAspectRatio={1}
                                    viewMode={1}
                                    guides={false}
                                    minCropBoxHeight={10}
                                    minCropBoxWidth={10}
                                    background={false}
                                    checkOrientation={false}
                                />
                            ) : null}
                        </Box>
                    </div>
                )}
            </Dropzone>
        );
    }
}
