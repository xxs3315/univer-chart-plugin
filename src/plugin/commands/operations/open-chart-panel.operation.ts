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
import { CommandType, LocaleService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { SelectionManagerService } from '@univerjs/sheets';
import { ChartMenuController } from '../../controllers/chart.menu.controller.ts';
import { createDefaultChartConf } from '../../common/const.ts';
import type { IChart } from '../../models/types.ts';

interface IOpenChartPanelParams {
    value: { type: string; subType: string };
}

export const OpenChartPanelOperator: ICommand = {
    id: 'sheet.operation.open.chart.panel',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params?: IOpenChartPanelParams) => {
        const chartMenuController = accessor.get(ChartMenuController);
        const localeService = accessor.get(LocaleService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const ranges = selectionManagerService.getSelectionRanges() || [];
        const chart = {
            ...createDefaultChartConf,
            ranges,
            conf: {
                type: params?.value.type,
                subType: params?.value.subType,
                title: localeService.t('chart.conf.title'),
            },
        } as IChart;
        // open side panel
        chartMenuController.openSidePanel(chart);
        // 打开chart preview dialog
        chartMenuController.openChartPreviewDialog(chart);
        return true;
    },
};
