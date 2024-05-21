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

import type { Ref } from 'react';
import { createElement, forwardRef } from 'react';
import type { IconProps } from '@univerjs/icons';
import { IconBase } from '@univerjs/icons';

const element = { tag: 'svg', attrs: { viewBox: '0 0 1024 1024', width: '1em', height: '1em' }, children: [{ tag: 'path', attrs: { fill: '#00BCD4', d: 'M512 640c-70.4 0-128-57.6-128-128s57.6-128 128-128V106.666667C288 106.666667 106.666667 288 106.666667 512s181.333333 405.333333 405.333333 405.333333c93.866667 0 181.333333-32 251.733333-87.466666l-170.666666-217.6c-23.466667 17.066667-51.2 27.733333-81.066667 27.733333z' } }, { tag: 'path', attrs: { fill: '#448AFF', d: 'M640 512h277.333333c0-224-181.333333-405.333333-405.333333-405.333333v277.333333c70.4 0 128 57.6 128 128z' } }, { tag: 'path', attrs: { fill: '#3F51B5', d: 'M917.333333 512H640c0 40.533333-19.2 76.8-49.066667 100.266667l170.666667 217.6C857.6 755.2 917.333333 640 917.333333 512z' } }] };

export const DoughnutChart = forwardRef<SVGElement, IconProps>(
    (props: IconProps, ref: Ref<SVGElement>) =>
        createElement(
            IconBase,
            Object.assign({}, props, {
                id: 'doughnut_chart',
                ref,
                icon: element,
            })
        )
);

DoughnutChart.displayName = 'DoughnutChart';

export default DoughnutChart;
