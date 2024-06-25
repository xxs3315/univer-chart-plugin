/**
 * Copyright 2024-present xxs3315
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CloseSingle } from '@univerjs/icons';
import RcDialog from 'rc-dialog';
import React, { useContext, useEffect, useRef, useState } from 'react';
import type { DraggableData, DraggableEvent, DraggableEventHandler } from 'react-draggable';
import Draggable from 'react-draggable';
import type { ResizeCallbackData } from 'react-resizable';
import { ResizableBox } from 'react-resizable';

import { ConfigContext } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useObservable } from '@univerjs/ui';
import { IDialogPlusService } from '../../services/dialog-plus/dialog-plus.service';
import { DESKTOP_DIALOG_PLUS_BASE_Z_INDEX } from '../../services/dialog-plus/desktop-dialog-plus.service';
import { IChartService } from '../../services/chart.service';
import styles from '../../styles/index.module.less';
import '../../styles/resize.css';

export interface IDialogPlusProps {
    id: string;

    children: React.ReactNode;

    /**
     * The style of the dialog.
     */
    style?: React.CSSProperties;

    /**
     * Whether the dialog is visible.
     * @default false
     */
    visible?: boolean;

    /**
     * The width of the dialog.
     */
    width?: number;

    /**
     * The height of the dialog.
     */
    height?: number;

    /**
     * The title of the dialog.
     */
    title?: React.ReactNode;

    /**
     * Whether the dialog can be dragged. If a dialog is draggable, the backdrop would be hidden and
     * the wrapper container would not response to user's mouse events.
     *
     * @default false
     */
    draggable?: boolean;

    /**
     * The close icon of the dialog.
     */
    closeIcon?: React.ReactNode;

    /**
     * The default position of the dialog.
     */
    defaultPosition?: { x: number; y: number };

    /**
     * Whether the dialog should be destroyed on close.
     * @default false
     */
    destroyOnClose?: boolean;

    /**
     * Whether the dialog should preserve its position on destroy.
     * @default false
     */
    preservePositionOnDestroy?: boolean;

    /**
     * The footer of the dialog.
     */
    footer?: React.ReactNode;

    /**
     * Callback when the dialog is closed.
     */
    onClose?: () => void;

    /**
     * Callback when the dialog is stopped resizing.
     */
    onResized?: (width: number, height: number) => void;

    /**
     * Callback when the dialog is moved.
     */
    onMoved?: (left: number, top: number) => void;

    onMouseDown?: (currentZIndex: number) => void;

    className?: string;

    zIndex?: number;
}

export function DialogPlus(props: IDialogPlusProps) {
    const dialogPlusService = useDependency(IDialogPlusService);
    const {
        id,
        className,
        children,
        style,
        visible = false,
        title,
        width,
        height,
        draggable = false,
        closeIcon = <CloseSingle />,
        defaultPosition,
        destroyOnClose = false,
        preservePositionOnDestroy = false,
        footer,
        zIndex,
        onClose,
        onResized = () => {},
        onMoved = () => {},
        onMouseDown = () => {},
    } = props;
    const [dragDisabled, setDragDisabled] = useState(false);
    const [positionOffset, setPositionOffset] = useState<{ x: number; y: number } | null>(null);
    const [calcWidth, calcWidthSet] = useState((width || 600) + 2);
    const initWidth = width || 600;
    const [calcHeight, calcHeightSet] = useState((height || 400));
    const initHeight = height || 400;
    const { clientWidth, clientHeight } = window.document.documentElement;
    const { mountContainer } = useContext(ConfigContext);
    const [currentZIndex, currentZIndexSet] = useState(dialogPlusService.getZIndex(zIndex));
    const chartService = useDependency(IChartService);
    const chartHighlightState = useObservable(chartService.highlightState$, undefined, true);
    const { chartId: chartHighlightId } = chartHighlightState;

    useEffect(() => {
        currentZIndexSet(dialogPlusService.getZIndex(zIndex));
    }, [zIndex]);

    const TitleIfDraggable = draggable
        ? (
            <div
                className={styles.dialogPlusTitleContent}
                style={{
                    width: '100%',
                    cursor: 'pointer',
                }}
                onMouseOver={() => {
                    if (dragDisabled) {
                        setDragDisabled(false);
                    }
                }}
                onMouseOut={() => {
                    setDragDisabled(true);
                }}
                onFocus={() => {
                    // empty
                }}
                onBlur={() => {
                    // empty
                }}
            >
                {title}
            </div>
        )
        : (
            <div className={styles.dialogPlusTitleContent}>{title}</div>
        );

    const modalRender = (modal: React.ReactNode) => {
        const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
        const draggleRef = useRef<HTMLDivElement>(null);

        function handleStop(_event: MouseEvent, data: DraggableData) {
            if (preservePositionOnDestroy) {
                const targetRect = draggleRef.current?.getBoundingClientRect();
                setPositionOffset({ x: data.x, y: data.y });
                if (targetRect) {
                    onMoved?.(targetRect.left, targetRect.top);
                }
            }
        }

        function handleMouseDown(e: MouseEvent) {
            const currentZIndex = dialogPlusService.getLatestMaxZIndex() + 1;
            currentZIndexSet(currentZIndex + DESKTOP_DIALOG_PLUS_BASE_Z_INDEX);
            onMouseDown?.(currentZIndex);
        }

        const { clientWidth, clientHeight } = window.document.documentElement;
        const position = positionOffset || defaultPosition || { x: (clientWidth - calcWidth) / 2, y: (clientHeight - calcHeight) / 2 };

        const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
            const { clientWidth, clientHeight } = window.document.documentElement;
            const targetRect = draggleRef.current?.getBoundingClientRect();
            if (!targetRect) {
                return;
            }

            setBounds({
                left: -targetRect.left + uiData.x,
                right: clientWidth - (targetRect.right - uiData.x),
                top: -targetRect.top + uiData.y,
                bottom: clientHeight - (targetRect.bottom - uiData.y),
            });
        };

        return draggable
            ? (
                <Draggable
                    disabled={dragDisabled}
                    defaultPosition={position}
                    bounds={bounds}
                    nodeRef={draggleRef}
                    handle=".univer-dialog-plus-title"
                    onStart={(event, uiData) => onStart(event, uiData)}
                    onStop={handleStop as DraggableEventHandler}
                    onMouseDown={handleMouseDown}
                >
                    <div ref={draggleRef} className={`${chartHighlightId === id ? 'univer-dialog-plus-highlight' : ''}`}>{modal}</div>
                </Draggable>
            )
            : modal;
    };

    const onResize = (event: React.SyntheticEvent, { node, size, handle }: ResizeCallbackData) => {
        calcWidthSet(size.width + 2);
        calcHeightSet(size.height);
    };

    const onResizeStop = (event: React.SyntheticEvent, { node, size, handle }: ResizeCallbackData) => {
        onResized?.(size.width, size.height);
    };

    return mountContainer && (
        <RcDialog
            className={className}
            width={calcWidth}
            height={calcHeight}
            prefixCls={styles.dialogPlus}
            rootClassName={draggable ? styles.dialogPlusRootDraggable : styles.dialogPlusRoot}
            getContainer={() => mountContainer}
            visible={visible}
            title={TitleIfDraggable}
            modalRender={modalRender}
            closeIcon={closeIcon}
            destroyOnClose={destroyOnClose}
            footer={footer}
            mask={!draggable}
            style={style}
            onClose={onClose}
            zIndex={currentZIndex}
        >
            <ResizableBox
                width={initWidth}
                height={initHeight}
                minConstraints={[100, 100]}
                maxConstraints={[clientWidth - 200, clientHeight - 200]}
                onResize={onResize}
                onResizeStop={onResizeStop}
            >
                {children}
            </ResizableBox>
        </RcDialog>

    );
}
