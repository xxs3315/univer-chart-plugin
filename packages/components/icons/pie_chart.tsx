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

const element = { tag: 'svg', attrs: { viewBox: '0 0 1024 1024', width: '1em', height: '1em' }, children: [{ tag: 'path', attrs: { fill: '#00BCD4', d: 'M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384c110.933333 0 211.2-46.933333 279.466667-121.6L512 512V128z' } }, { tag: 'path', attrs: { fill: '#448AFF', d: 'M896 512c0-211.2-172.8-384-384-384v384h384z' } }, { tag: 'path', attrs: { fill: '#3F51B5', d: 'M512 512l279.466667 262.4c64-68.266667 104.533333-160 104.533333-262.4H512z' } }] };

export const PieChart = forwardRef<SVGElement, IconProps>(
    (props: IconProps, ref: Ref<SVGElement>) =>
        createElement(
            IconBase,
            Object.assign({}, props, {
                id: 'pie_chart',
                ref,
                icon: element,
            })
        )
);

PieChart.displayName = 'PieChart';

export default PieChart;
