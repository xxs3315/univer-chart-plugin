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

import {
    Disposable,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    OnLifecycle,
    UniverInstanceType,
} from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import type { IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, IMenuService, ISidebarService } from '@univerjs/ui';
import { CHART_SELECTOR_PANEL_COMPONENT } from '../components/chart-selector-panel/interface.ts';
import { ChartSelectorPanel } from '../components/chart-selector-panel/ChartSelectorPanel.tsx';
import { ChartSelectorMenuItemFactory } from './menu/chart.menu.ts';

@OnLifecycle(LifecycleStages.Ready, ChartMenuController)
export class ChartMenuController extends Disposable {
    private _sidebarDisposable: IDisposable | null = null;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(IMenuService) private _menuService: IMenuService,
        @Inject(ISidebarService) private _sidebarService: ISidebarService,
        @Inject(LocaleService) private _localeService: LocaleService
    ) {
        super();

        this._initMenu();
        this._initComponent();
        this._initPanel();

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((sheet) => {
                if (!sheet) this._sidebarDisposable?.dispose();
            })
        );
    }

    private _initMenu() {
        ([ChartSelectorMenuItemFactory] as IMenuItemFactory[]).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }

    private _initComponent() {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(CHART_SELECTOR_PANEL_COMPONENT, ChartSelectorPanel));
    }

    private _initPanel() {
        // this._componentManager.register(CF_PANEL_KEY, ConditionFormattingPanel);
    }
}
