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
import { SelectionManagerService } from '@univerjs/sheets';
import { createDefaultChartConf } from '../common/const.ts';
import type { IChart } from '../models/types.ts';

export function createDefaultNewChart(accessor: IAccessor) {
    const selectionManagerService = accessor.get(SelectionManagerService);
    const currentRanges = selectionManagerService.getSelectionRanges();
    const chart = {
        ...createDefaultChartConf(accessor),
        ranges: currentRanges ?? [{ startColumn: 0, endColumn: 0, startRow: 0, endRow: 0 }],
    } as IChart;

    return chart;
}
