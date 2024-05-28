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
import type { MakePropertyOptional } from '../../utils/types.ts';
import { ChartConfModel } from '../../models/chart-conf-model.ts';
import type {
    IAddChartMutationParams,
} from '../mutations/add-chart.mutation.ts';
import {
    AddChartMutation,
    AddChartMutationUndoFactory,
} from '../mutations/add-chart.mutation.ts';

export interface IAddChartCommandParams {
    unitId?: string;
    subUnitId?: string;
    chart: MakePropertyOptional<IChart, 'chartId'>;
};

export const AddChartCommand: ICommand<IAddChartCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-chart',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { chart } = params;
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const chartConfModel = accessor.get(ChartConfModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const chartId = chartConfModel.createChartId(unitId, subUnitId);
        const config: IAddChartMutationParams = { unitId, subUnitId, chart: { ...chart, chartId: chart.chartId || chartId } };
        const undo = AddChartMutationUndoFactory(accessor, config);
        const result = commandService.syncExecuteCommand(AddChartMutation.id, config);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: [{ id: AddChartMutation.id, params: config }],
                undoMutations: [undo],
            });
        }

        return result;
    },
};
