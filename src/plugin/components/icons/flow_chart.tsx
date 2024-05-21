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

const element = { tag: 'svg', attrs: { viewBox: '0 0 1024 1024', width: '1em', height: '1em' }, children: [{ tag: 'path', attrs: { fill: '#CFD8DC', d: 'M746.666667 768h85.333333V469.333333H554.666667v-192h-85.333334v192H192v298.666667h85.333333V554.666667h192v213.333333h85.333334V554.666667h192z' } }, { tag: 'path', attrs: { fill: '#3F51B5', d: 'M362.666667 128h298.666666v213.333333H362.666667z' } }, { tag: 'path', attrs: { fill: '#00BCD4', d: 'M682.666667 682.666667h213.333333v213.333333H682.666667zM128 682.666667h213.333333v213.333333H128zM405.333333 682.666667h213.333334v213.333333H405.333333z' } }] };

export const FlowChart = forwardRef<SVGElement, IconProps>(
    (props: IconProps, ref: Ref<SVGElement>) =>
        createElement(
            IconBase,
            Object.assign({}, props, {
                id: 'flow_chart',
                ref,
                icon: element,
            })
        )
);

FlowChart.displayName = 'FlowChart';

export default FlowChart;
