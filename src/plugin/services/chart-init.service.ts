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
    Disposable, fromCallback, ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    UniverInstanceType,
    type Workbook,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { filter } from 'rxjs';
import { ChartConfModel } from '../models/chart-conf-model.ts';
import { ChartMenuController } from '../controllers/chart.menu.controller.ts';

@OnLifecycle(LifecycleStages.Rendered, ChartInitService)
export class ChartInitService extends Disposable {
    constructor(
        @Inject(ChartConfModel) private _chartConfModel: ChartConfModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(ChartMenuController) private _chartMenuController: ChartMenuController,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._initCharts();
        this._commandExecutedListener();
    }

    private _initCharts() {
        const unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
        const activeSheet = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
        const activeSheetId = activeSheet.getSheetId();
        const charts = this._chartConfModel.getSubunitChartConfs(unitId, activeSheetId);
        charts?.forEach((chart) => {
            this._chartMenuController.openChartDialog(chart);
        });
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            fromCallback(this._commandService.onCommandExecuted)
                .pipe(
                    filter(([command, options]) => command.id === SetWorksheetActiveOperation.id && !options?.fromFindReplace)
                )
                .subscribe(() => {
                    const unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
                    const activeSheet = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
                    const activeSheetId = activeSheet.getSheetId();
                    // 关闭所有chart
                    const allCharts = this._chartConfModel.getUnitChartConfs(unitId);
                    allCharts?.forEach((value, _key) => {
                        value.forEach((chart) => {
                            this._chartMenuController.closeChartDialog(chart);
                        });
                    });
                    // 打开current active sheet charts
                    const charts = this._chartConfModel.getSubunitChartConfs(unitId, activeSheetId);
                    charts?.forEach((chart) => {
                        this._chartMenuController.openChartDialog(chart);
                    });
                })
        );
    }
}
