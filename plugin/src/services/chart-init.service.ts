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

import {
    Disposable, ICommandService,
    type IMutationInfo, Inject, Injector, type IRange, IResourceManagerService,
    IUniverInstanceService,
    LifecycleStages, ObjectMatrix,
    OnLifecycle, Rectangle, RedoCommand, UndoCommand,
    UniverInstanceType,
    type Workbook,
} from '@univerjs/core';
import {
    type IInsertColMutationParams,
    type IMoveColumnsMutationParams,
    type IMoveRangeMutationParams,
    type IMoveRowsMutationParams,
    InsertColMutation,
    InsertRowMutation,
    type IRemoveRowsMutationParams,
    type IRemoveSheetCommandParams,
    type ISetRangeValuesMutationParams,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveRowMutation,
    RemoveSheetCommand,
    SetRangeValuesMutation,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { ISidebarService } from '@univerjs/ui';
import { ChartConfModel } from '../models/chart-conf-model';
import { ChartMenuController } from '../controllers/chart.menu.controller';
import type { IChart, IChartModelJson } from '../models/types';
import { CHART_PREVIEW_DIALOG_KEY, SHEET_CHART_PLUGIN } from '../common/const';
import { DeleteChartCommand, type IDeleteChartCommandParams } from '../commands/commands/delete-chart.command';
import type {
    IDeleteChartMutationParams,
} from '../commands/mutations/delete-chart.mutation';
import {
    DeleteChartMutation,
    DeleteChartMutationUndoFactory,
} from '../commands/mutations/delete-chart.mutation';

// const getUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
// const getSubUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!.getSheetId();

@OnLifecycle(LifecycleStages.Ready, ChartInitService)
export class ChartInitService extends Disposable {
    constructor(
        @Inject(ChartConfModel) private _chartConfModel: ChartConfModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(ISidebarService) private _sidebarService: ISidebarService,
        @Inject(ChartMenuController) private _chartMenuController: ChartMenuController
    ) {
        super();
        this._initCellChange();
        this._initSnapshot();
        this._initSheetChange();
        this._initChartConfListener();
        this._initSidebarChangeListener();
        this._initRedoUndoChangeListener();
        this._initCharts();
    }

    private _initCharts() {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (workbook && workbook.getActiveSheet()) {
            const unitId = workbook.getUnitId();
            const subunitId = workbook.getActiveSheet()!.getSheetId();
            const charts = this._chartConfModel.getSubunitChartConfs(unitId, subunitId);
            charts?.forEach((chart) => {
                if (chart.show !== false) this._chartMenuController.openChartDialog(chart);
            });
        }
    }

    private _initSnapshot() {
        const toJson = (unitID: string) => {
            const map = this._chartConfModel.getUnitChartConfs(unitID);
            const resultMap: IChartModelJson[keyof IChartModelJson] = {};
            if (map) {
                map.forEach((v, key) => {
                    resultMap[key] = v;
                });
                return JSON.stringify(resultMap);
            }
            return '';
        };
        const parseJson = (json: string): IChartModelJson[keyof IChartModelJson] => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };
        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<IChartModelJson[keyof IChartModelJson]>({
                pluginName: SHEET_CHART_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_SHEET],
                toJson: (unitID) => toJson(unitID),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitID) => {
                    this._chartConfModel.deleteUnitId(unitID);
                },
                onLoad: (unitID, value) => {
                    Object.keys(value).forEach((subunitId) => {
                        const confList = [...value[subunitId]].reverse();
                        confList.forEach((chart) => {
                            this._chartConfModel.addChartConf(unitID, subunitId, chart);
                        });
                    });
                },
            })
        );
    }

    private _initSheetChange() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const params = commandInfo.params as IRemoveSheetCommandParams;
                        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                        let uid = '';
                        let suid = '';
                        if (workbook && workbook.getActiveSheet()) {
                            uid = params.unitId || workbook.getUnitId();
                            suid = params.subUnitId || workbook.getActiveSheet()!.getSheetId();
                        }
                        const unitId = params.unitId || uid;
                        const subUnitId = params.subUnitId || suid;
                        const chartList = this._chartConfModel.getSubunitChartConfs(unitId, subUnitId);
                        if (!chartList) {
                            return { redos: [], undos: [] };
                        }

                        const chartIdsToDelete: string[] = [];
                        chartList.forEach((chart) => {
                            this._chartMenuController.closeChartDialog(chart);
                            chartIdsToDelete.push(chart.chartId);
                        });

                        this._commandService.syncExecuteCommand(DeleteChartCommand.id, { unitId, subUnitId, chartIds: chartIdsToDelete } as IDeleteChartCommandParams);

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];
                        // 删除sheet时，同时删除该sheet下的所有charts
                        const paramsToDelete: IDeleteChartMutationParams = {
                            unitId, subUnitId,
                            chartIds: chartIdsToDelete.filter(() => chartIdsToDelete.some((chartId) => chartId !== CHART_PREVIEW_DIALOG_KEY)),
                        };
                        redos.push({
                            id: DeleteChartMutation.id, params: paramsToDelete,
                        });
                        undos.push(...DeleteChartMutationUndoFactory(this._injector, paramsToDelete));

                        return {
                            redos,
                            undos,
                        };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command) => {
                if (command.id === SetWorksheetActiveOperation.id) {
                    // 切换sheet前，管理当前sheet的charts
                    // 切换sheet前，清除所有的preview chart conf，即切换sheet前所有的预览chart都会被清除
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                    if (workbook && workbook.getActiveSheet()) {
                        const unitId = workbook.getUnitId();
                        const subunitId = workbook.getActiveSheet()!.getSheetId();
                        this._chartMenuController.closeChartDialog({ chartId: CHART_PREVIEW_DIALOG_KEY });
                        this._commandService.syncExecuteCommand(DeleteChartCommand.id, {
                            unitId,
                            subunitId,
                            chartIds: [CHART_PREVIEW_DIALOG_KEY],
                        } as IDeleteChartCommandParams);
                    }
                }
            })
        );
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command, options) => {
                if (command.id === SetWorksheetActiveOperation.id) {
                    // 切换sheet后，管理当前sheet的charts
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                    if (workbook && workbook.getActiveSheet()) {
                        const unitId = workbook.getUnitId();
                        const subunitId = workbook.getActiveSheet()!.getSheetId();
                        // 关闭所有chart
                        const allCharts = this._chartConfModel.getUnitChartConfs(unitId);
                        allCharts?.forEach((value, _key) => {
                            value.forEach((chart) => {
                                this._chartMenuController.closeChartDialog(chart);
                            });
                        });
                        // 打开current active sheet charts
                        const charts = this._chartConfModel.getSubunitChartConfs(unitId, subunitId);
                        charts?.forEach((chart) => {
                            if (chart.show !== false) this._chartMenuController.openChartDialog(chart);
                        });
                    }
                }
            })
        );
    }

    private _initChartConfListener() {
        // chart conf 变化时， 管理charts的行为
        this.disposeWithMe(
            this._chartConfModel.$chartConfChange.subscribe(() => {
                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                if (workbook && workbook.getActiveSheet()) {
                    const unitId = workbook.getUnitId();
                    const subunitId = workbook.getActiveSheet()!.getSheetId();
                    const allChartConfMap = this._chartConfModel.getUnitChartConfs(unitId);
                    allChartConfMap?.forEach((value, _key) => {
                        value.forEach((chart) => {
                            this._chartMenuController.closeChartDialog(chart);
                        });
                    });
                    const charts = this._chartConfModel.getSubunitChartConfs(unitId, subunitId);
                    charts?.forEach((chart) => {
                        if (chart.show !== false) this._chartMenuController.openChartDialog(chart);
                    });
                }
            })
        );
    }

    private _initSidebarChangeListener() {
        // sidebar 变化时，管理charts的行为
        this.disposeWithMe(
            this._sidebarService.sidebarOptions$.subscribe(() => {
                this._sidebarService.sidebarOptions$.forEach((item) => {
                    // 关闭preview chart
                    this._chartMenuController.closeChartDialog({ chartId: CHART_PREVIEW_DIALOG_KEY });
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                    if (workbook && workbook.getActiveSheet()) {
                        const unitId = workbook.getUnitId();
                        const subunitId = workbook.getActiveSheet()!.getSheetId();
                        this._commandService.syncExecuteCommand(DeleteChartCommand.id, { unitId, subunitId, chartIds: [CHART_PREVIEW_DIALOG_KEY] } as IDeleteChartCommandParams);
                    }
                });
            })
        );
    }

    private _initCellChange() {
        // sheet cell 发生变化时， 重绘制相关的chart
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                const collectChart = (unitId: string, subUnitId: string, cellData: [number, number][]) => {
                    const chartIds: Set<string> = new Set();
                    cellData.forEach(([row, col]) => {
                        const chartItems = this._chartConfModel.getIntersectCharts(unitId, subUnitId, row, col);
                        chartItems?.forEach((chart) => chartIds.add(chart.chartId));
                    });
                    return [...chartIds].map((chartId) => this._chartConfModel.getChartConf(unitId, subUnitId, chartId) as IChart).filter((chart) => !!chart);
                };

                switch (commandInfo.id) {
                    case SetRangeValuesMutation.id: {
                        const params = commandInfo.params as ISetRangeValuesMutationParams;
                        const { subUnitId, unitId, cellValue } = params;
                        const cellMatrix: [number, number][] = [];
                        new ObjectMatrix(cellValue).forValue((row, col, value) => {
                            // When P and V are involved
                            const result = value && Object.keys(value).some((key) => ['p', 'v'].includes(key));
                            if (result) {
                                cellMatrix.push([row, col]);
                            }
                        });
                        const charts = collectChart(unitId, subUnitId, cellMatrix);
                        charts.forEach((chart) => {
                            this._chartConfModel.markDirty(unitId, subUnitId, chart);
                        });
                        break;
                    }
                    case InsertColMutation.id:
                    case RemoveColMutation.id: {
                        const { range, unitId, subUnitId } = commandInfo.params as IInsertColMutationParams;
                        const allCharts = this._chartConfModel.getSubunitChartConfs(unitId, subUnitId);
                        const effectRange: IRange = { ...range, endColumn: Number.MAX_SAFE_INTEGER };
                        if (allCharts) {
                            const effectChart = allCharts.filter((chart) => chart.ranges.some((chartRange) => Rectangle.intersects(chartRange, effectRange)));
                            effectChart.forEach((chart) => {
                                this._chartConfModel.markDirty(unitId, subUnitId, chart);
                            });
                        }
                        break;
                    }
                    case RemoveRowMutation.id:
                    case InsertRowMutation.id: {
                        const { range, unitId, subUnitId } = commandInfo.params as IRemoveRowsMutationParams;
                        const allCharts = this._chartConfModel.getSubunitChartConfs(unitId, subUnitId);
                        const effectRange: IRange = { ...range, endRow: Number.MAX_SAFE_INTEGER };
                        if (allCharts) {
                            const effectChart = allCharts.filter((chart) => chart.ranges.some((chartRange) => Rectangle.intersects(chartRange, effectRange)));
                            effectChart.forEach((chart) => {
                                this._chartConfModel.markDirty(unitId, subUnitId, chart);
                            });
                        }
                        break;
                    }
                    case MoveRowsMutation.id: {
                        const { sourceRange, targetRange, unitId, subUnitId } = commandInfo.params as IMoveRowsMutationParams;
                        const allCharts = this._chartConfModel.getSubunitChartConfs(unitId, subUnitId);
                        const effectRange: IRange = {
                            startRow: Math.min(sourceRange.startRow, targetRange.startRow),
                            endRow: Number.MAX_SAFE_INTEGER,
                            startColumn: 0,
                            endColumn: Number.MAX_SAFE_INTEGER,
                        };
                        if (allCharts) {
                            const effectChart = allCharts.filter((chart) => chart.ranges.some((chartRange) => Rectangle.intersects(chartRange, effectRange)));
                            effectChart.forEach((chart) => {
                                this._chartConfModel.markDirty(unitId, subUnitId, chart);
                            });
                        }
                        break;
                    }
                    case MoveColsMutation.id: {
                        const { sourceRange, targetRange, unitId, subUnitId } = commandInfo.params as IMoveColumnsMutationParams;
                        const allCharts = this._chartConfModel.getSubunitChartConfs(unitId, subUnitId);
                        const effectRange: IRange = {
                            startRow: 0,
                            endRow: Number.MAX_SAFE_INTEGER,
                            startColumn: Math.min(sourceRange.startColumn, targetRange.startColumn),
                            endColumn: Number.MAX_SAFE_INTEGER,
                        };
                        if (allCharts) {
                            const effectChart = allCharts.filter((chart) => chart.ranges.some((chartRange) => Rectangle.intersects(chartRange, effectRange)));
                            effectChart.forEach((chart) => {
                                this._chartConfModel.markDirty(unitId, subUnitId, chart);
                            });
                        }
                        break;
                    }
                    case MoveRangeMutation.id: {
                        const { unitId, to, from } = commandInfo.params as IMoveRangeMutationParams;
                        const handleSubUnit = (value: IMoveRangeMutationParams['from']) => {
                            const cellMatrix: [number, number][] = [];
                            new ObjectMatrix(value.value).forValue((row, col) => {
                                cellMatrix.push([row, col]);
                            });
                            const charts = collectChart(unitId, value.subUnitId, cellMatrix);
                            charts.forEach((chart) => {
                                this._chartConfModel.markDirty(unitId, value.subUnitId, chart);
                            });
                        };
                        handleSubUnit(to);
                        handleSubUnit(from);
                        break;
                    }
                }
            }));
    }

    private _initRedoUndoChangeListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command) => {
                if (command.id === RedoCommand.id || command.id === UndoCommand.id) {
                    // 关闭所有chart
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                    if (workbook) {
                        const unitId = workbook.getUnitId();
                        const allCharts = this._chartConfModel.getUnitChartConfs(unitId);
                        allCharts?.forEach((value, _key) => {
                            value.forEach((chart) => {
                                this._chartMenuController.closeChartDialog(chart);
                            });
                        });
                    }
                }
            })
        );
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command, options) => {
                if (command.id === RedoCommand.id || command.id === UndoCommand.id) {
                    // // 切换sheet后，管理当前sheet的charts
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                    if (workbook && workbook.getActiveSheet()) {
                        const unitId = workbook.getUnitId();
                        const subunitId = workbook.getActiveSheet()!.getSheetId();
                        // 打开current active sheet charts
                        const charts = this._chartConfModel.getSubunitChartConfs(unitId, subunitId);
                        charts?.forEach((chart) => {
                            if (chart.show !== false) this._chartMenuController.openChartDialog(chart);
                        });
                    }
                }
            })
        );
    }
}
