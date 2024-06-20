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

import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { ChartConfModel } from '../../models/chart-conf-model';
import type { IAnchor } from '../../utils/anchor';
import { anchorUndoFactory } from '../../utils/anchor';

export interface IMoveChartMutationParams {
    unitId: string;
    subUnitId: string;
    start: IAnchor;
    end: IAnchor;
}

export const MoveChartMutation: IMutation<IMoveChartMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.mutation.move-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, start, end } = params;
        const chartConfModel = accessor.get(ChartConfModel);
        chartConfModel.moveChartPriority(unitId, subUnitId, start, end);
        return true;
    },
};
export const MoveChartMutationUndoFactory = (param: IMoveChartMutationParams) => {
    const { unitId, subUnitId } = param;
    const undo = anchorUndoFactory(param.start, param.end);

    if (!undo) {
        return [];
    }
    const [start, end] = undo;

    return [{ id: MoveChartMutation.id,
              params: { unitId, subUnitId, start, end } as IMoveChartMutationParams },
    ];
};
