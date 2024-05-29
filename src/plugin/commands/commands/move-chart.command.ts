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
import type { IAnchor } from '../../utils/anchor.ts';
import { transformSupportSymmetryAnchor } from '../../utils/anchor.ts';
import type {
    IMoveChartMutationParams } from '../mutations/move-chart.mutation.ts';
import {
    MoveChartMutation,
    MoveChartMutationUndoFactory,
} from '../mutations/move-chart.mutation.ts';
import { ChartConfModel } from '../../models/chart-conf-model.ts';

export interface IMoveChartCommand {
    unitId?: string;
    subUnitId?: string;
    start: IAnchor;
    end: IAnchor;
};
export const MoveChartCommand: ICommand<IMoveChartCommand> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.move-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const chartConfModel = accessor.get(ChartConfModel);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const anchorList = transformSupportSymmetryAnchor(params.start, params.end, chartConfModel.getSubunitChartConfs(unitId, subUnitId) || [], (chart) => chart.chartId);
        if (!anchorList) {
            return false;
        }
        const [start, end] = anchorList;
        const config: IMoveChartMutationParams = { unitId, subUnitId, start, end };
        const undos = MoveChartMutationUndoFactory(config);
        const result = commandService.syncExecuteCommand(MoveChartMutation.id, config);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: [{ id: MoveChartMutation.id, params: config }],
                undoMutations: undos,
            });
        }

        return result;
    },
};
