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
import { CommandType } from '@univerjs/core';
import type { IChart } from '../../models/types';
import { ChartConfModel } from '../../models/chart-conf-model';
import type { IDeleteChartMutationParams } from './delete-chart.mutation';
import { DeleteChartMutation } from './delete-chart.mutation';

export interface IAddChartMutationParams {
    unitId: string;
    subUnitId: string;
    chart: IChart;
}
export const AddChartMutationUndoFactory = (accessor: IAccessor, param: IAddChartMutationParams) => {
    return { id: DeleteChartMutation.id, params: { unitId: param.unitId, subUnitId: param.subUnitId, chartIds: [param.chart.chartId] } as IDeleteChartMutationParams };
};
export const AddChartMutation: IMutation<IAddChartMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.chart.mutation.add-chart',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, chart } = params;
        const chartConfModel = accessor.get(ChartConfModel);
        chartConfModel.addChartConf(unitId, subUnitId, chart);
        return true;
    },
};
