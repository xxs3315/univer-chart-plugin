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

import { CommandType } from '@univerjs/core';
import type { ICommand } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { IChartPreviewService } from '../../services/chart-preview.service.ts';
import type { IChart } from '../../models/types.ts';

export const ChartPreviewOperator: ICommand = {
    id: 'sheet.operation.chart.preview',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params?: IChart) => {
        const chartPreviewService = accessor.get(IChartPreviewService);
        chartPreviewService.start(params?.conf.subType);
        return true;
    },
};
