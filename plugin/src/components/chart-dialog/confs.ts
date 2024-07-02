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

const CONFS_COMMON = {
    title: {
        left: 'center',
    },
    tooltip: {
        trigger: 'axis',
    },
    legend: {
        top: '10%',
    },
    grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true,
    },
    xAxis: {
        type: 'category',
    },
    yAxis: {
        type: 'value',
    },
};

/**
 * line-default
 */
export const LINE_DEFAULT_CONFS_GRID = {
    ...CONFS_COMMON,
};

export const LINE_DEFAULT_CONFS_SERIE = {
    type: 'line',
    smooth: true,
};

/**
 * line-area
 */
export const LINE_AREA_CONFS_GRID = {
    ...CONFS_COMMON,
};

export const LINE_AREA_CONFS_SERIE = {
    type: 'line',
    smooth: true,
    stack: 'Total',
    areaStyle: {},
    emphasis: {
        focus: 'series',
    },
};

/**
 * bar-default
 */
export const BAR_DEFAULT_CONFS_GRID = {
    ...CONFS_COMMON,
};
export const BAR_DEFAULT_CONFS_SERIE = {
    type: 'bar',
    showBackground: true,
    backgroundStyle: {
        color: 'rgba(188, 188, 188, 0.1)',
    },
};

/**
 * bar-column
 */
export const BAR_COLUMN_CONFS_GRID = {
    ...CONFS_COMMON,
};
export const BAR_COLUMN_CONFS_SERIE = {
    type: 'bar',
    stack: 'Total',
    emphasis: {
        focus: 'series',
    },
};

/**
 * pie-default
 */
export const PIE_DEFAULT_CONFS_GRID = {
    title: {
        left: 'center',
    },
    tooltip: {
        trigger: 'axis',
    },
    legend: {
        top: '10%',
    },
    grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true,
    },
};
export const PIE_DEFAULT_CONFS_SERIE = {
    type: 'pie',
    radius: '50%',
    emphasis: {
        itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
    },
};

/**
 * pie-doughnut
 */
export const PIE_DOUGHNUT_CONFS_GRID = {
    title: {
        left: 'center',
    },
    tooltip: {
        trigger: 'axis',
    },
    legend: {
        top: '10%',
    },
    grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true,
    },
};
export const PIE_DOUGHNUT_CONFS_SERIE = {
    type: 'pie',
    radius: ['30%', '60%'],
    avoidLabelOverlap: false,
    itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
    },
    label: {
        show: false,
        position: 'center',
    },
    emphasis: {
        label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
        },
    },
    labelLine: {
        show: false,
    },
};
