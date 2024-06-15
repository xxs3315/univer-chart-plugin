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

import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import type { IChart } from '../../models/types.ts';
import type { ISetChartMutationParams } from '../mutations/set-chart.mutation.ts';
import { SetChartMutation, setChartMutationUndoFactory } from '../mutations/set-chart.mutation.ts';
import { CHART_PREVIEW_DIALOG_KEY } from '../../common/const.ts';

export interface ISetChartCommandParams {
    unitId?: string;
    subUnitId?: string;
    chart: IChart;
};

export const SetChartCommand: ICommand<ISetChartCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.chart.set-chart-conf',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const config: ISetChartMutationParams = { unitId, subUnitId, chart: params.chart };
        const undos = setChartMutationUndoFactory(accessor, config);
        const result = commandService.syncExecuteCommand(SetChartMutation.id, config);
        if (result && config.chart.chartId !== CHART_PREVIEW_DIALOG_KEY) {
            undoRedoService.pushUndoRedo({ unitID: unitId, undoMutations: undos, redoMutations: [{ id: SetChartMutation.id, params: config }] });
        }
        return result;
    },
};
