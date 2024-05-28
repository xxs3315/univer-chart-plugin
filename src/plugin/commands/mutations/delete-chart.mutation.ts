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

import type { IAccessor } from '@wendellhu/redi';
import type { IMutation, IMutationInfo } from '@univerjs/core';
import { CommandType, Tools } from '@univerjs/core';
import { ChartConfModel } from '../../models/chart-conf-model.ts';
import { transformSupportSymmetryAnchor } from '../../utils/anchor.ts';
import type { IAddChartMutationParams } from './add-chart.mutation.ts';
import { AddChartMutation } from './add-chart.mutation.ts';
import type { IMoveChartMutationParams } from './move-chart.mutation.ts';
import { MoveChartMutation } from './move-chart.mutation.ts';

export interface IDeleteChartMutationParams {
    unitId: string;
    subUnitId: string;
    chartId: string;
}
export const DeleteChartMutationUndoFactory = (accessor: IAccessor, param: IDeleteChartMutationParams) => {
    const chartConfModel = accessor.get(ChartConfModel);
    const { unitId, subUnitId, chartId } = param;
    const chartConfList = ([...(chartConfModel.getSubunitChartConfs(unitId, subUnitId) || [])]);
    const index = chartConfList.findIndex((item) => item.chartId === chartId);
    const beforeChart = chartConfList[index - 1];
    if (index > -1) {
        const chart = chartConfList[index];
        const result: IMutationInfo[] = [{
            id: AddChartMutation.id,
            params: { unitId, subUnitId, chart: Tools.deepClone(chart) } as IAddChartMutationParams,
        }];
        chartConfList.splice(index, 1);
        if (index !== 0) {
            const firstRule = chartConfList[0];
            if (firstRule) {
                const transformResult = transformSupportSymmetryAnchor({ id: firstRule.chartId, type: 'before' }, { id: beforeChart.chartId, type: 'after' }, chartConfList, (chart) => chart.chartId);
                if (!transformResult) {
                    return result;
                }
                const [start, end] = transformResult;
                const params: IMoveChartMutationParams = {
                    unitId, subUnitId, start,
                    end,
                };
                result.push({ id: MoveChartMutation.id, params });
            }
        }
        return result;
    }
    return [];
};
export const DeleteChartMutation: IMutation<IDeleteChartMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.chart.mutation.delete-chart',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, chartId } = params;
        const chartConfModel = accessor.get(ChartConfModel);
        chartConfModel.deleteChartConf(unitId, subUnitId, chartId);
        return true;
    },
};
