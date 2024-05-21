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

const element = { tag: 'svg', attrs: { viewBox: '0 0 1024 1024', width: '1em', height: '1em' }, children: [{ tag: 'path', attrs: { fill: '#00BCD4', d: 'M789.333333 384h128v512h-128zM618.666667 554.666667h128v341.333333h-128zM448 469.333333h128v426.666667h-128zM277.333333 682.666667h128v213.333333h-128zM106.666667 597.333333h128v298.666667H106.666667z' } }, { tag: 'path', attrs: { fill: '#3F51B5', d: 'M170.666667 341.333333m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM341.333333 384m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM512 234.666667m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM682.666667 277.333333m-64 0a64 64 0 10128 0 64 64 0 10-128 0zM853.333333 192m-64 0a64 64 0 10128 0 64 64 0 10-128 0z' } }, { tag: 'path', attrs: { fill: '#3F51B5', d: 'M834.133333 153.6l-155.733333 78.933333-177.066667-44.8-170.666666 149.333334-149.333334-36.266667-21.333333 81.066667 192 49.066666 170.666667-149.333333 164.266666 40.533333 185.6-91.733333z' } }] };

export const ComboChart = forwardRef<SVGElement, IconProps>(
    (props: IconProps, ref: Ref<SVGElement>) =>
        createElement(
            IconBase,
            Object.assign({}, props, {
                id: 'combo_chart',
                ref,
                icon: element,
            })
        )
);

ComboChart.displayName = 'ComboChart';

export default ComboChart;
