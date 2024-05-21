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

const element = { tag: 'svg', attrs: { viewBox: '0 0 1024 1024', width: '1em', height: '1em' }, children: [{ tag: 'path', attrs: { fill: '#29C287', d: 'M547.114667 547.413333a64 64 0 0 1 64 64v42.666667a64 64 0 0 1-64 64H128a64 64 0 0 1-64-64v-42.666667a64 64 0 0 1 64-64h419.114667zM465.194667 64v170.666667H128A64 64 0 0 1 64 170.666667V128A64 64 0 0 1 128 64h337.194667z' } }, { tag: 'path', attrs: { fill: '#706EE7', d: 'M694.144 64a64 64 0 0 1 64 64v42.666667a64 64 0 0 1-64 64h-227.84v-170.666667h227.84zM896 305.92a64 64 0 0 1 64 64v42.666667a64 64 0 0 1-64 64H163.754667a42.666667 42.666667 0 0 1-42.666667-42.666667v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667H896z' } }, { tag: 'path', attrs: { fill: '#29C287', d: 'M611.114667 305.92v170.666667H128a64 64 0 0 1-64-64v-42.666667A64 64 0 0 1 128 305.92h483.114667z' } }, { tag: 'path', attrs: { fill: '#706EE7', d: 'M633.642667 547.413333a64 64 0 0 1 64 64v42.666667a64 64 0 0 1-64 64H405.845333v-170.666667h227.84z' } }, { tag: 'path', attrs: { fill: '#29C287', d: 'M547.114667 789.333333a64 64 0 0 1 64 64v42.666667a64 64 0 0 1-64 64H128A64 64 0 0 1 64 896v-42.666667A64 64 0 0 1 128 789.333333h419.114667z' } }, { tag: 'path', attrs: { fill: '#706EE7', d: 'M646.485333 789.333333a64 64 0 0 1 64 64v42.666667a64 64 0 0 1-64 64H418.688v-170.666667h227.84z' } }] };

export const StackedColumnChart = forwardRef<SVGElement, IconProps>(
    (props: IconProps, ref: Ref<SVGElement>) =>
        createElement(
            IconBase,
            Object.assign({}, props, {
                id: 'stacked_column_chart',
                ref,
                icon: element,
            })
        )
);

StackedColumnChart.displayName = 'StackedColumnChart';

export default StackedColumnChart;
