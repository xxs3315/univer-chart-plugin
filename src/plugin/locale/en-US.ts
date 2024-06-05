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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    chart: {
        panel: {
            title: 'Chart management',
            preview: 'Preview',
            removeAll: 'Remove All',
            add: 'Create chart',
            range: 'Ranges',
            type: 'Type',
            options: 'Advance options',
            cancel: 'Cancel',
            submit: 'Submit',
            manage: 'Manage Charts',
        },
        form: {
            lessThan: 'The value must be less than {0}',
            lessThanOrEqual: 'The value must be less than or equal to {0}',
            greaterThan: 'The value must be greater than {0}',
            greaterThanOrEqual: 'The value must be greater than or equal to {0}',
            rangeSelector: 'Select Range or Enter Value',
        },
        category: {
            line: '新建折线图或面积图',
            bar: '新建柱状图或条形图',
            pie: '新建饼图或圆环图',
        },
        type: {
            lineDefault: '折线图',
            lineArea: '面积图',
            barDefault: '柱状图',
            barColumn: '条形图',
            pieDefault: '饼图',
            pieDoughnut: '圆环图',
        },
        conf: {
            title: 'Title',
        },
    },
};

export default locale;
