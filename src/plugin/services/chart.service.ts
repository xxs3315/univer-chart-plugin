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

import type { IMutationInfo, IRange, Workbook } from '@univerjs/core';
import { afterInitApply,
    Disposable,
    ICommandService,
    IResourceManagerService, IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    Rectangle, UniverInstanceType,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import type {
    IInsertColMutationParams, IMoveColumnsMutationParams, IMoveRangeMutationParams, IMoveRowsMutationParams, IRemoveRowsMutationParams,
    IRemoveSheetCommandParams,
    ISetRangeValuesMutationParams } from '@univerjs/sheets';
import {
    InsertColMutation, InsertRowMutation, MoveColsMutation, MoveRangeMutation, MoveRowsMutation,
    RemoveColMutation, RemoveRowMutation,
    RemoveSheetCommand, SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import { ChartConfModel } from '../models/chart-conf-model.ts';
import type { IChart, IChartModelJson } from '../models/types.ts';
import { SHEET_CHART_PLUGIN } from '../common/const.ts';
import type {
    IDeleteChartMutationParams,
} from '../commands/mutations/delete-chart.mutation.ts';
import {
    DeleteChartMutation,
    DeleteChartMutationUndoFactory,
} from '../commands/mutations/delete-chart.mutation.ts';

const getUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId();

@OnLifecycle(LifecycleStages.Starting, ChartService)
export class ChartService extends Disposable {
    private _afterInitApplyPromise: Promise<void>;

    constructor(
        @Inject(ChartConfModel) private _chartConfModel: ChartConfModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._initCellChange();
        this._initSnapshot();
        this._initSheetChange();
        this._afterInitApplyPromise = afterInitApply(_commandService);
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
                        const unitId = params.unitId || getUnitId(this._univerInstanceService);
                        const subUnitId = params.subUnitId || getSubUnitId(this._univerInstanceService);
                        const chartList = this._chartConfModel.getSubunitChartConfs(unitId, subUnitId);
                        if (!chartList) {
                            return { redos: [], undos: [] };
                        }

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];

                        chartList.forEach((chart) => {
                            const params: IDeleteChartMutationParams = {
                                unitId, subUnitId,
                                chartId: chart.chartId,
                            };
                            redos.push({
                                id: DeleteChartMutation.id, params,
                            });
                            undos.push(...DeleteChartMutationUndoFactory(this._injector, params));
                        });

                        return {
                            redos,
                            undos,
                        };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }

    private _initCellChange() {
        // sheet 发生变化时， 重绘制chart
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
}
