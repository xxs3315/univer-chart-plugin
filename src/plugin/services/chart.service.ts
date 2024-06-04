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

import type { IMutationInfo, Workbook } from '@univerjs/core';
import {
    afterInitApply,
    createInterceptorKey,
    Disposable, ICommandService,
    IResourceManagerService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle, UniverInstanceType,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import type { IRemoveSheetCommandParams } from '@univerjs/sheets';
import { RemoveSheetCommand, SheetInterceptorService } from '@univerjs/sheets';
import { ChartConfModel } from '../models/chart-conf-model.ts';
import { ChartViewModel } from '../models/chart-view-model.ts';
import type { IChartModelJson } from '../models/types.ts';
import { SHEET_CHART_PLUGIN } from '../common/const.ts';
import type {
    IDeleteChartMutationParams,
} from '../commands/mutations/delete-chart.mutation.ts';
import {
    DeleteChartMutation,
    DeleteChartMutationUndoFactory,
} from '../commands/mutations/delete-chart.mutation.ts';

const beforeUpdateChartResult = createInterceptorKey<{ subUnitId: string; unitId: string; chartId: string }, undefined>('chart-before-update-chart-result');
@OnLifecycle(LifecycleStages.Starting, ChartService)

export class ChartService extends Disposable {
    private _afterInitApplyPromise: Promise<void>;

    constructor(
        @Inject(ChartConfModel) private _chartConfModel: ChartConfModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(ChartViewModel) private _chartViewModel: ChartViewModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
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
                        const confList = this._chartConfModel.getSubunitChartConfs(unitId, subUnitId);
                        if (!confList) {
                            return { redos: [], undos: [] };
                        }

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];

                        confList.forEach((item) => {
                            const params: IDeleteChartMutationParams = {
                                unitId, subUnitId,
                                chartId: item.chartId,
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
}

const getUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId();
