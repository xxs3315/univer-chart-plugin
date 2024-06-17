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

import React, { useEffect, useRef, useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { SelectionManagerService, SetWorksheetActiveOperation } from '@univerjs/sheets';
import type { IRange, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { DeleteSingle, EditRegionSingle, EyelashSingle, SequenceSingle, ViweModeSingle } from '@univerjs/icons';
import GridLayout from 'react-grid-layout';
import { serializeRange } from '@univerjs/engine-formula';
import { debounceTime, Observable } from 'rxjs';
import { Injector } from '@wendellhu/redi';
import type { IDeleteChartCommandParams } from '../../../commands/commands/delete-chart.command.ts';
import { DeleteChartCommand } from '../../../commands/commands/delete-chart.command.ts';
import type { IChart } from '../../../models/types.ts';
import { ChartConfModel } from '../../../models/chart-conf-model.ts';
import { createDefaultNewChart } from '../../../utils/utils.ts';
import type { IMoveChartCommand } from '../../../commands/commands/move-chart.command.ts';
import { MoveChartCommand } from '../../../commands/commands/move-chart.command.ts';
import { ChartMenuController } from '../../../controllers/chart.menu.controller.ts';
import { CHART_PREVIEW_DIALOG_KEY } from '../../../common/const.ts';
import { type ISetChartCommandParams, SetChartCommand } from '../../../commands/commands/set-chart.command.ts';
import styles from './index.module.less';
import 'react-grid-layout/css/styles.css';

interface IChartListProps {
    onClick: (chart: IChart) => void;
    onCreate: (chart: IChart) => void;
}
let defaultWidth = 0;
export const ChartSideList = (props: IChartListProps) => {
    const { onClick, onCreate } = props;

    const chartConfModel = useDependency(ChartConfModel);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const injector = useDependency(Injector);
    const chartMenuController = useDependency(ChartMenuController);
    const selectionManagerService = useDependency(SelectionManagerService);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook.getUnitId();
    const worksheet = workbook.getActiveSheet();
    const subUnitId = worksheet.getSheetId();

    const layoutContainerRef = useRef<HTMLDivElement>(null);

    const getChartConfList = () => {
        const chartConfList = chartConfModel.getSubunitChartConfs(unitId, subUnitId);
        if (!chartConfList || !chartConfList.length) {
            return [];
        }
        return chartConfList;
    };
    const [chartConfList, chartConfListSet] = useState(getChartConfList);

    const [layoutWidth, layoutWidthSet] = useState(defaultWidth);
    const [draggingId, draggingIdSet] = useState<number>(-1);
    const [currentChartRanges, currentChartRangesSet] = useState<IRange[]>([]);
    const [fetchChartConfListId, fetchChartConfListIdSet] = useState(0);

    const layout = chartConfList.map((chart, index) => ({ i: chart.chartId, x: 0, w: 12, y: index, h: 1, isResizable: false }));

    const handleDelete = (chart: IChart) => {
        // 关闭对应的chart
        chartMenuController.closeChartDialog(chart);
        const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
        const subUnitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId();
        commandService.syncExecuteCommand(DeleteChartCommand.id, { unitId, subUnitId, chartIds: [chart.chartId] } as IDeleteChartCommandParams);
    };

    const handleShowHide = (chart: IChart) => {
        const c = { ...chart, show: !(chart.show) };
        commandService.executeCommand(SetChartCommand.id, { unitId, subUnitId, chart: c } as ISetChartCommandParams);
    };

    const handleDragStart = (_layout: unknown, from: { y: number }) => {
        draggingIdSet(from.y);
    };

    const handleDragStop = (_layout: unknown, from: { y: number }, to: { y: number }) => {
        draggingIdSet(-1);
        const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
        const subUnitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId();
        const getSaveIndex = (index: number) => {
            const length = chartConfList.length;
            return Math.min(length - 1, Math.max(0, index));
        };
        const chartId = chartConfList[getSaveIndex(from.y)].chartId;
        const targetChartId = chartConfList[getSaveIndex(to.y)].chartId;
        if (chartId !== targetChartId) {
            commandService.executeCommand(MoveChartCommand.id, { unitId, subUnitId, start: { id: chartId, type: 'self' }, end: { id: targetChartId, type: to.y > from.y ? 'after' : 'before' } } as IMoveChartCommand);
        }
    };

    useEffect(() => {
        chartConfListSet(getChartConfList);
    }, [fetchChartConfListId, unitId, subUnitId]);

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetWorksheetActiveOperation.id) {
                fetchChartConfListIdSet(Math.random());
            }
        });
        return () => disposable.dispose();
    });

    useEffect(() => {
        const dispose = chartConfModel.$chartConfChange.subscribe(() => {
            fetchChartConfListIdSet(Math.random());
        });
        return () => dispose.unsubscribe();
    }, [chartConfModel]);

    useEffect(() => {
        // Because univer-sidebar contains animations, accurate width values can not be obtained in real time。
        // Also set a global width as the default width to avoid a gap before the first calculation.
        const getWidth = () => {
            // 8 is padding-left
            const width = Math.max(0, (layoutContainerRef.current?.getBoundingClientRect().width || 0) - 8);
            defaultWidth = width;
            return width;
        };
        const observer = new Observable((subscribe) => {
            const targetElement = document.querySelector('.univer-sidebar');
            if (targetElement) {
                let time = setTimeout(() => {
                    subscribe.next();
                }, 150);
                const clearTime = () => {
                    time && clearTimeout(time);
                    time = null as any;
                };
                const handle: any = (e: TransitionEvent) => {
                    if (e.propertyName === 'width') {
                        clearTime();
                        subscribe.next();
                    }
                };
                targetElement.addEventListener('transitionend', handle);
                return () => {
                    clearTime();
                    targetElement.removeEventListener('transitionend', handle);
                };
            }
        });
        const subscription = observer.pipe(debounceTime(16)).subscribe(() => {
            layoutWidthSet(getWidth());
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className={styles.chartConfList}>
            <div ref={layoutContainerRef} className={styles.gridLayoutWrap}>
                {layoutWidth
                    ? (
                        <GridLayout
                            onDragStop={handleDragStop}
                            onDragStart={handleDragStart}
                            layout={layout}
                            cols={12}
                            rowHeight={60}
                            width={layoutWidth}
                            margin={[0, 10]}
                            draggableHandle=".draggableHandle"
                        >
                            {chartConfList?.map((chart, index) => {
                                return (
                                    <div key={`${chart.chartId}`}>
                                        <div
                                            onMouseMove={() => {
                                                chart.ranges !== currentChartRanges && currentChartRangesSet(chart.ranges);
                                            }}
                                            onMouseLeave={() => currentChartRangesSet([])}
                                            onClick={() => {
                                                // onClick(chart);
                                            }}
                                            className={`${styles.confItem} ${draggingId === index ? styles.active : ''}`}
                                        >
                                            <div
                                                className={`${styles.draggableHandle} draggableHandle`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <SequenceSingle />
                                            </div>
                                            <div className={styles.confDescribe}>
                                                <div className={styles.confType}>{chart.conf.title}</div>
                                                <div
                                                    className={styles.confRange}
                                                >
                                                    {chart.ranges.map((range) => serializeRange(range)).join(',')}
                                                </div>
                                            </div>
                                            <div
                                                className={`${styles.deleteItem} ${draggingId === index ? styles.active : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(chart);
                                                }}
                                            >
                                                <DeleteSingle />
                                            </div>
                                            <div
                                                className={`${styles.editItem} ${draggingId === index ? styles.active : ''}`}
                                                onClick={(_e) => {
                                                    onClick(chart);
                                                }}
                                            >
                                                <EditRegionSingle />
                                            </div>
                                            <div
                                                className={`${styles.viewItem} ${draggingId === index ? styles.active : ''}`}
                                                onClick={(_e) => {
                                                    handleShowHide(chart);
                                                }}
                                            >
                                                {chart.show !== false ? <EyelashSingle /> : <ViweModeSingle />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </GridLayout>
                    )
                    : null}
                <div className={styles.listButtons}>
                    <Button
                        className={styles.listButton}
                        type="primary"
                        onClick={() => {
                            const ranges = selectionManagerService.getSelectionRanges() || [];
                            const chart = {
                                ...createDefaultNewChart(injector),
                                ranges,
                                chartId: CHART_PREVIEW_DIALOG_KEY,
                            };
                            onCreate(chart);
                        }}
                    >
                        {localeService.t('chart.panel.add')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
