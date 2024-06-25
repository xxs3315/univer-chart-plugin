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

import type { ICustomComponentProps } from '@univerjs/ui';
import type { ChartType } from '../../types/enum/chart-types';
import type { ChartGroupType } from '../../types/enum/chart-group-types';

const COMPONENT_PREFIX = 'UI_PLUGIN_SHEETS';

export const CHART_SELECTOR_PANEL_COMPONENT = `${COMPONENT_PREFIX}_CHART_SELECTOR_PANEL_COMPONENT`;

export interface IChartInfo {
    type: ChartGroupType;
    subType: ChartType;
}

export interface IChartSelectorPanelProps extends ICustomComponentProps<IChartInfo> {}

export const CHART_SELECTOR_CHILDREN = [
    {
        // label: '柱状图或条形图',
        label: 'chart.category.bar',
        value: 'bar',
        children: [
            {
                label: 'chart.type.barDefault',
                icon: 'BarChart',
                value: 'bar-default',
            },
            {
                label: 'chart.type.barColumn',
                icon: 'StackedColumnChart',
                value: 'bar-column',
            },
        ],
    },
    {
        label: 'chart.category.line',
        value: 'line',
        children: [
            {
                label: 'chart.type.lineDefault',
                icon: 'LineChart',
                value: 'line-default',
            },
            {
                label: 'chart.type.lineArea',
                icon: 'AreaChart',
                value: 'line-area',
            },
        ],
    },
    {
        label: 'chart.category.pie',
        value: 'pie',
        children: [
            {
                label: 'chart.type.pieDefault',
                icon: 'PieChart',
                value: 'pie-default',
            },
            {
                label: 'chart.type.pieDoughnut',
                icon: 'DoughnutChart',
                value: 'pie-doughnut',
            },
        ],
    },
];
