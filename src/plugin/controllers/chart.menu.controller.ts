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

import { Disposable, ICommandService, IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    OnLifecycle,
    UniverInstanceType,
} from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import type { IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, IDialogService, ILayoutService, IMenuService, ISidebarService } from '@univerjs/ui';
import { CHART_SELECTOR_PANEL_COMPONENT } from '../components/chart-selector-panel/interface.ts';
import { ChartSelectorPanel } from '../components/chart-selector-panel';
import { ChartSidePanel } from '../components/chart-side-panel';
import type { IChart } from '../models/types.ts';
import { ChartPreviewDialog } from '../components/chart-preview-dialog';
import { CHART_PREVIEW_DIALOG_KEY } from '../common/const.ts';
import { ChartDialog } from '../components/chart-dialog';
import { ChartSelectorMenuItemFactory } from './menu/chart.menu.ts';

const CHART_SIDE_PANEL_KEY = 'sheet.chart.side.panel';

@OnLifecycle(LifecycleStages.Ready, ChartMenuController)
export class ChartMenuController extends Disposable {
    private _sidebarDisposable: IDisposable | null = null;
    // private _provider!: ChartPreviewProvider;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(IMenuService) private _menuService: IMenuService,
        @Inject(ISidebarService) private _sidebarService: ISidebarService,
        @Inject(IDialogService) private readonly _dialogService: IDialogService,
        @Inject(ILayoutService) private readonly _layoutService: ILayoutService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();

        // const provider = this._injector.createInstance(ChartPreviewProvider);
        // this._provider = provider;
        // this._chartPreviewService.registerFindReplaceProvider(provider);

        this._initMenu();
        this._initComponent();
        this._initPanel();

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((sheet) => {
                if (!sheet) this._sidebarDisposable?.dispose();
            })
        );
    }

    openSidePanel(chart?: IChart) {
        const props = {
            header: { title: this._localeService.t('chart.panel.title') },
            children: {
                label: CHART_SIDE_PANEL_KEY,
                conf: chart,
            },
            onClose: () => this.closeSidePanel(),
        };

        this._sidebarDisposable = this._sidebarService.open(props);
    }

    closeSidePanel() {
        this._sidebarDisposable = null;
        // 同时关闭 chart preview
        this.closeChartDialog();
    }

    openPreviewChartDialog(chart?: IChart) {
        // open preview dialog
        this._dialogService.open({
            id: CHART_PREVIEW_DIALOG_KEY,
            draggable: true,
            destroyOnClose: true,
            children: {
                label: {
                    name: 'ChartPreviewDialog',
                    props: {
                        chart,
                    },
                },
            },
            title: { title: this._localeService.t('chart.panel.title') + this._localeService.t('chart.panel.preview') },
            onClose: () => {},
            className: 'chart-plugin-preview',
        });
    }

    openChartDialog(chart?: IChart) {
        if (chart && chart.chartId && chart.chartId !== CHART_PREVIEW_DIALOG_KEY) {
            // open chart
            this._dialogService.open({
                id: chart.chartId,
                draggable: true,
                destroyOnClose: true,
                children: {
                    label: {
                        name: 'ChartDialog',
                        props: {
                            chart,
                        },
                    },
                },
                title: { title: this._localeService.t('chart.panel.title') + this._localeService.t('chart.panel.preview') },
                onClose: () => {},
                className: `chart-plugin-${chart.chartId}`,
            });
        }
    }

    closeChartDialog(chart?: IChart) {
        if (chart && chart.chartId && chart.chartId !== CHART_PREVIEW_DIALOG_KEY) {
            this._dialogService.close(chart.chartId);
        } else {
            this._dialogService.close(CHART_PREVIEW_DIALOG_KEY);
        }

        queueMicrotask(() => this._layoutService.focus());
    }

    private _initMenu() {
        ([ChartSelectorMenuItemFactory] as IMenuItemFactory[]).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), {}));
        });
    }

    private _initComponent() {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(CHART_SELECTOR_PANEL_COMPONENT, ChartSelectorPanel));
        this.disposeWithMe(componentManager.register('ChartPreviewDialog', ChartPreviewDialog));
        this.disposeWithMe(componentManager.register('ChartDialog', ChartDialog));
    }

    private _initPanel() {
        this._componentManager.register(CHART_SIDE_PANEL_KEY, ChartSidePanel);
    }
}
