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

import type { IRange } from '@univerjs/core';
import type { ChartGroupType } from '../types/enum/chart-group-types';
import type { ChartType } from '../types/enum/chart-types';

export interface IBaseChart {
    type: string;
    subType: string;
    title: string;
    theme: string;
    reverseAxis: boolean;
}

export interface ILineDefaultChart extends IBaseChart {
    type: ChartGroupType.LINE;
    subType: ChartType.LINE_DEFAULT;
}

export interface ILineAreaChart extends IBaseChart {
    type: ChartGroupType.LINE;
    subType: ChartType.LINE_AREA;
}

export interface IBarDefaultChart extends IBaseChart {
    type: ChartGroupType.BAR;
    subType: ChartType.BAR_DEFAULT;
}

export interface IBarColumnChart extends IBaseChart {
    type: ChartGroupType.BAR;
    subType: ChartType.BAR_COLUMN;
}

export interface IPieDefaultChart extends IBaseChart {
    type: ChartGroupType.PIE;
    subType: ChartType.PIE_DEFAULT;
}

export interface IPieDoughnutChart extends IBaseChart {
    type: ChartGroupType.PIE;
    subType: ChartType.PIE_DOUGHNUT;
}

export type IChartConfig = ILineAreaChart | ILineDefaultChart | IBarColumnChart | IBarDefaultChart | IPieDoughnutChart | IPieDefaultChart;

export interface IChart<C = IChartConfig> {
    ranges: IRange [];
    chartId: string;
    conf: C;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    zIndex?: number;
    show?: boolean;
}

export type IChartModel = Map<string, Map<string, IChart[]>>;
export type IChartModelJson = Record<string, Record<string, IChart[]>>;
