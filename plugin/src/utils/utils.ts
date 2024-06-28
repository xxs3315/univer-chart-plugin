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
import { createDefaultChartConf } from '../common/const';
import type { IChart } from '../models/types';

export function createDefaultNewChart(accessor: IAccessor) {
    const selectionManagerService = accessor.get(SelectionManagerService);
    const currentRanges = selectionManagerService.getSelectionRanges();
    const chart = {
        ...createDefaultChartConf(accessor),
        ranges: currentRanges ?? [{ startColumn: 0, endColumn: 0, startRow: 0, endRow: 0 }],
    } as IChart;

    return chart;
}

// 转置一个矩阵型数组
export const transferArray = (ary: any) => {
    /*
     * 转置一个二维矩阵的本质就是改变其子数组的结构，
     * 即将原矩阵的行与列在结构上进行互换：
     *  - 新子数组的个数为原任意一个子数组的长度；
     *  - 新任意一个子数组的元素皆依次取自于原每一个子数组。
     * 需要一个二层循环：
     *  - 内层循环构造一个子数组，即从原子数组逐个取出同位序元素；
     *  - 外层循环收集所有子数组。
     */
    const ar = []; // 转置后的数组
    for (let i = 0; i < ary[0].length; i++) {
        const cd = []; // 某个新子数组
        for (let j = 0; j < ary.length; j++) {
            cd.push(ary[j][i]);
        }
        ar.push(cd);
    }
    return ar;
};
