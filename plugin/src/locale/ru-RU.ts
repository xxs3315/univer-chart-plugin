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
            title: 'Управление проверкой данных',
            preview: 'Preview',
            removeAll: 'Удалить все',
            add: 'Создать проверку данных',
            range: 'Диапазоны',
            type: 'Тип',
            options: 'Дополнительные параметры',
            cancel: 'Cancel',
            submit: 'Submit',
            manage: 'Manage Charts',
        },
        form: {
            lessThan: 'Значение должно быть меньше {0}',
            lessThanOrEqual: 'Значение должно быть меньше или равно {0}',
            greaterThan: 'Значение должно быть больше {0}',
            greaterThanOrEqual: 'Значение должно быть больше или равно {0}',
            rangeSelector: 'Выберите диапазон или введите значение',
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
            theme: '主题',
        },
        theme: {
            default: 'Default',
            vintage: 'Vintage',
            dark: 'Dark',
            westeros: 'Westeros',
            essos: 'Essos',
            wonderland: 'Wonderland',
            walden: 'Walden',
            chalk: 'Chalk',
            infographic: 'Infographic',
            macarons: 'Macarons',
            roma: 'Roma',
            shine: 'Shine',
            'purple-passion': 'Purple Passion',
            halloween: 'Halloween',
        },
    },
};

export default locale;
