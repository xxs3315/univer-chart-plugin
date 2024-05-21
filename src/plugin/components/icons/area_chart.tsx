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

const element = { tag: 'svg', attrs: { viewBox: '0 0 1024 1024', width: '1em', height: '1em' }, children: [{ tag: 'path', attrs: { fill: '#3F51B5', d: 'M896 789.333333H128V533.333333l213.333333-320 298.666667 149.333334L896 128z' } }, { tag: 'path', attrs: { fill: '#00BCD4', d: 'M896 896H128V682.666667l213.333333-170.666667 298.666667 42.666667 256-192z' } }] };

export const AreaChart = forwardRef<SVGElement, IconProps>(
    (props: IconProps, ref: Ref<SVGElement>) =>
        createElement(
            IconBase,
            Object.assign({}, props, {
                id: 'area_chart',
                ref,
                icon: element,
            })
        )
);

AreaChart.displayName = 'AreaChart';

export default AreaChart;
