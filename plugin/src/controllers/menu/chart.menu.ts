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

import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { type IAccessor, LocaleService, UniverInstanceType } from '@univerjs/core';
import { CHART_SELECTOR_PANEL_COMPONENT } from '../../components/chart-selector-panel/interface';
import {
    OpenChartEditPanelOperator,
    OpenChartManagePanelOperator,
} from '../../commands/operations/open-chart-panel.operation';

export function ChartSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const localeService = accessor.get(LocaleService);

    return {
        id: OpenChartEditPanelOperator.id,
        icon: 'ComboChart',
        group: MenuGroup.TOOLBAR_OTHERS,
        tooltip: localeService.t('chart.panel.title'),
        positions: [MenuPosition.TOOLBAR_START],
        type: MenuItemType.SELECTOR,
        selections: [
            {
                label: {
                    name: CHART_SELECTOR_PANEL_COMPONENT,
                    hoverable: false,
                },
            },
        ],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function ManageChartsMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const localeService = accessor.get(LocaleService);

    return {
        id: OpenChartManagePanelOperator.id,
        type: MenuItemType.BUTTON,
        title: localeService.t('chart.panel.manage'),
        positions: OpenChartEditPanelOperator.id,
    };
}
