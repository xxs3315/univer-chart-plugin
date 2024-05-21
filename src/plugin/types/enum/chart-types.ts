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

export enum ChartType {
    BAR_DEFAULT = 'bar-default', // 柱形图 - 默认
    BAR_COLUMN = 'bar-column', // 条形图

    LINE_DEFAULT = 'line-default', // 折线图 - 默认
    LINE_AREA = 'line-area', // 面积图

    PIE_DEFAULT = 'pie-default', // 饼图 - 默认
    PIE_DOUGHNUT = 'pie-doughnut', // 圆环图
}
