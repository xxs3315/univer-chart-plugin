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

import type { IMutationInfo } from '@univerjs/core';
import {
    createInterceptorKey,
    Disposable,
    InterceptorManager,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import {
    SelectionManagerService,
    SheetInterceptorService,
} from '@univerjs/sheets';
import type { IChart, IChartConfig } from '../models/types.ts';
import { ChartConfModel } from '../models/chart-conf-model.ts';

export const CHART_PERMISSION_CHECK = createInterceptorKey<(IChart<IChartConfig> & { disable?: boolean; show?: boolean })[], (IChart<IChartConfig> & { disable?: boolean })[]>('chartPermissionCheck');

@OnLifecycle(LifecycleStages.Rendered, ChartClearController)
export class ChartClearController extends Disposable {
    public interceptor = new InterceptorManager({ CHART_PERMISSION_CHECK });

    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @Inject(ChartConfModel) private _chartConfModel: ChartConfModel

    ) {
        super();

        this._init();
    }

    private _init() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (_commandInfo) => {
                const redos: IMutationInfo[] = [];
                const undos: IMutationInfo[] = [];
                const defaultV = { redos, undos };
                // if ([ClearSelectionFormatCommand.id, ClearSelectionAllCommand.id].includes(commandInfo.id)) {
                //     const ranges = this._selectionManagerService.getSelectionRanges();
                //     if (!ranges) {
                //         return defaultV;
                //     }
                //     const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                //     const worksheet = workbook.getActiveSheet();
                //     const allCharts = this._chartConfModel.getSubunitChartConfs(workbook.getUnitId(), worksheet.getSheetId());
                //     if (!allCharts || !allCharts.length) {
                //         return defaultV;
                //     }
                //     allCharts.forEach((rule) => {
                //         const mergeUtil = new RangeMergeUtil();
                //         const mergeRanges = mergeUtil.add(...rule.ranges).subtract(...ranges).merge();
                //         if (mergeRanges.length) {
                //             const redo: IMutationInfo<ISetConditionalRuleMutationParams> = {
                //                 id: SetConditionalRuleMutation.id,
                //                 params: {
                //                     unitId: workbook.getUnitId(),
                //                     subUnitId: worksheet.getSheetId(),
                //                     rule: { ...rule, ranges: mergeRanges },
                //                 },
                //             };
                //             const undo = setConditionalRuleMutationUndoFactory(this._injector, redo.params);
                //             redos.push(redo);
                //             undos.push(...undo);
                //         } else {
                //             const redo: IMutationInfo<IDeleteConditionalRuleMutationParams> = {
                //                 id: DeleteConditionalRuleMutation.id,
                //                 params: {
                //                     unitId: workbook.getUnitId(),
                //                     subUnitId: worksheet.getSheetId(),
                //                     cfId: rule.cfId,
                //                 },
                //             };
                //             const undo = DeleteConditionalRuleMutationUndoFactory(this._injector, redo.params);
                //             redos.push(redo);
                //             undos.push(...undo);
                //         }
                //     });
                // }
                return defaultV;
            },
        }));
    }
}
