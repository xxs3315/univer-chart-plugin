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

const element = { tag: 'svg', attrs: { viewBox: '0 0 1024 1024', width: '1em', height: '1em' }, children: [{ tag: 'path', attrs: { fill: '#3F51B5', d: 'M170.666667 810.666667m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM341.333333 853.333333m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM512 704m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM682.666667 746.666667m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM853.333333 661.333333m-64 0a64 64 0 10128 0 64 64 0 10-128 0z' } }, { tag: 'path', attrs: { fill: '#3F51B5', d: 'M834.133333 622.933333l-155.733333 78.933334-177.066667-44.8-170.666666 149.333333-149.333334-36.266667-21.333333 81.066667 192 49.066667 170.666667-149.333334 164.266666 40.533334 185.6-91.733334z' } }, { tag: 'path', attrs: { fill: '#00BCD4', d: 'M170.666667 426.666667m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM341.333333 469.333333m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM512 320m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM682.666667 426.666667m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM853.333333 170.666667m-64 0a64 64 0 10128 0 64 64 0 10-128 0z' } }, { tag: 'path', attrs: { fill: '#00BCD4', d: 'M817.066667 147.2c-44.8 68.266667-113.066667 170.666667-147.2 221.866667-25.6-14.933333-66.133333-42.666667-136.533334-85.333334l-27.733333-17.066666-177.066667 155.733333-149.333333-36.266667-21.333333 83.2 192 49.066667 164.266666-142.933333c55.466667 34.133333 123.733333 76.8 138.666667 87.466666l10.666667 10.666667 19.2-2.133333c23.466667-2.133333 23.466667-2.133333 202.666666-275.2l-68.266666-49.066667z' } }] };

export const LineChart = forwardRef<SVGElement, IconProps>(
    (props: IconProps, ref: Ref<SVGElement>) =>
        createElement(
            IconBase,
            Object.assign({}, props, {
                id: 'line_chart',
                ref,
                icon: element,
            })
        )
);

LineChart.displayName = 'LineChart';

export default LineChart;
