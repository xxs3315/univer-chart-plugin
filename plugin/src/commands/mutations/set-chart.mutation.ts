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

import type { IAccessor, IMutation } from '@univerjs/core';
import { CommandType, Tools } from '@univerjs/core';
import type { IChart } from '../../models/types';
import { ChartConfModel } from '../../models/chart-conf-model';

export interface ISetChartMutationParams {
    unitId: string;
    subUnitId: string;
    chartId?: string;
    chart: IChart;
}

export const SetChartMutation: IMutation<ISetChartMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.chart.mutation.set-chart',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, chart } = params;
        const chartId = params.chartId || params.chart.chartId;

        const chartConfModel = accessor.get(ChartConfModel);
        chartConfModel.setChartConf(unitId, subUnitId, chart, chartId);
        return true;
    },
};

export const setChartMutationUndoFactory = (accessor: IAccessor, param: ISetChartMutationParams) => {
    const chartConfModel = accessor.get(ChartConfModel);
    const { unitId, subUnitId } = param;
    const chartId = param.chartId || param.chart.chartId;
    const chartConf = chartConfModel.getChartConf(unitId, subUnitId, chartId);
    if (chartConf) {
        return [{
            id: SetChartMutation.id,
            params: {
                unitId,
                subUnitId,
                chartId,
                chart: Tools.deepClone(chartConf),
            } as ISetChartMutationParams,
        },
        ];
    }
    return [];
};
