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
import type {
    IDeleteChartMutationParams,
} from '../mutations/delete-chart.mutation';
import {
    DeleteChartMutation,
    DeleteChartMutationUndoFactory,
} from '../mutations/delete-chart.mutation';
import { CHART_PREVIEW_DIALOG_KEY } from '../../common/const';

export interface IDeleteChartCommandParams {
    unitId?: string;
    subUnitId?: string;
    chartIds: string[];
}
export const DeleteChartCommand: ICommand<IDeleteChartCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-chart',
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
        const targetIds = params.chartIds.filter(() => params.chartIds.some((id) => id !== CHART_PREVIEW_DIALOG_KEY));
        const config: IDeleteChartMutationParams = { unitId, subUnitId, chartIds: targetIds };
        const configIncludePreview: IDeleteChartMutationParams = { unitId, subUnitId, chartIds: params.chartIds };
        const undos = DeleteChartMutationUndoFactory(accessor, config);
        const result = commandService.syncExecuteCommand(DeleteChartMutation.id, configIncludePreview);
        if (result) {
            undoRedoService.pushUndoRedo({ unitID: unitId, undoMutations: undos, redoMutations: [{ id: DeleteChartMutation.id, params: config }] });
        }
        return result;
    },
};
