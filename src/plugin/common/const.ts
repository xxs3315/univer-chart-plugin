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
import { LocaleService } from '@univerjs/core';
import type { IChart, ILineDefaultChart } from '../models/types.ts';
import { ChartGroupType } from '../types/enum/chart-group-types.ts';
import { ChartType } from '../types/enum/chart-types.ts';

export const SHEET_CHART_PLUGIN = 'SHEET_CHART_PLUGIN';

export const createDefaultChartConf = (accessor: IAccessor) => {
    const localeService = accessor.get(LocaleService);
    return ({
        chartId: undefined as unknown as string,
        ranges: [],
        conf: { type: ChartGroupType.LINE, subType: ChartType.LINE_DEFAULT, title: localeService.t('chart.conf.title') } as ILineDefaultChart,
    } as IChart);
};
