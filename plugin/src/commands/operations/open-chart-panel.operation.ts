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

import type { IAccessor, ICommand } from '@univerjs/core';
import { CommandType, LocaleService } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { ChartMenuController } from '../../controllers/chart.menu.controller';
import { CHART_PREVIEW_DIALOG_KEY, createDefaultChartConf } from '../../common/const';
import type { IChart } from '../../models/types';

interface IOpenChartPanelParams {
    value: { type: string; subType: string };
}

export const OpenChartEditPanelOperator: ICommand = {
    id: 'sheet.operation.open.chart.panel.edit',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params?: IOpenChartPanelParams) => {
        const chartMenuController = accessor.get(ChartMenuController);
        const localeService = accessor.get(LocaleService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const ranges = selectionManagerService.getCurrentSelections()?.map((s) => s.range) ?? [];
        const chart = {
            ...createDefaultChartConf(accessor),
            ranges,
            conf: {
                type: params?.value.type,
                subType: params?.value.subType,
                title: localeService.t('chart.conf.title'),
            },
            chartId: CHART_PREVIEW_DIALOG_KEY,
        } as IChart;
        chartMenuController.openSidePanel(chart);
        return true;
    },
};

export const OpenChartManagePanelOperator: ICommand = {
    id: 'sheet.operation.open.chart.panel.manage',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, _params?: IOpenChartPanelParams) => {
        const chartMenuController = accessor.get(ChartMenuController);
        // open side panel to manage
        chartMenuController.openSidePanel(undefined, false);
        return true;
    },
};
