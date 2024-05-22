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
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { SelectionManagerService } from '@univerjs/sheets';
import { ChartMenuController } from '../../controllers/chart.menu.controller.ts';
import { createDefaultRule } from '../../common/const.ts';
import type { IChart, ILineDefaultChart } from '../../models/types.ts';

interface IOpenChartPanelParams {
    value: { type: string; subType: string };
}

export const OpenChartPanelOperator: ICommand = {
    id: 'sheet.operation.open.chart.panel',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params?: IOpenChartPanelParams) => {
        // open side panel
        const chartMenuController = accessor.get(ChartMenuController);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const ranges = selectionManagerService.getSelectionRanges() || [];
        const conf = {
            ...createDefaultRule,
            ranges,
            conf: {
                type: params?.value.type,
                subType: params?.value.subType,
            },
        } as IChart<ILineDefaultChart>;
        chartMenuController.openPanel(conf);

        // 获取selection range

        // append到 univer dom中去 这里不直接使用canvas绘图进入univer的main canvas，采用的是chart外挂的模式
        // 动态增加chart dom

        // 绘制一个chart到这个动态dom中

        // append到 univer dom中去

        // 这样性能有问题吗
        return true;
    },
};
