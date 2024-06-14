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
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    OnLifecycle,
    UniverInstanceType,
    type Workbook,
} from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import type { IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, ILayoutService, IMenuService, ISidebarService } from '@univerjs/ui';
import { CHART_SELECTOR_PANEL_COMPONENT } from '../components/chart-selector-panel/interface.ts';
import { ChartSelectorPanel } from '../components/chart-selector-panel';
import { ChartSidePanel } from '../components/chart-side-panel';
import type { IChart } from '../models/types.ts';
import { CHART_PREVIEW_DIALOG_KEY } from '../common/const.ts';
import { ChartDialog } from '../components/chart-dialog';
import { IDialogPlusService } from '../services/dialog-plus/dialog-plus.service.ts';
import { type ISetChartCommandParams, SetChartCommand } from '../commands/commands/set-chart.command.ts';
import { ChartConfModel } from '../models/chart-conf-model.ts';
import { ChartSelectorMenuItemFactory, ManageChartsMenuItemFactory } from './menu/chart.menu.ts';

const CHART_SIDE_PANEL_KEY = 'sheet.chart.side.panel';
const getUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId();

@OnLifecycle(LifecycleStages.Ready, ChartMenuController)
export class ChartMenuController extends Disposable {
    private _sidebarDisposable: IDisposable | null = null;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(IMenuService) private _menuService: IMenuService,
        @Inject(ISidebarService) private _sidebarService: ISidebarService,
        @Inject(IDialogPlusService) private readonly _dialogPlusService: IDialogPlusService,
        @Inject(ILayoutService) private readonly _layoutService: ILayoutService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(ChartConfModel) private _chartConfModel: ChartConfModel
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

    openSidePanel(chart?: IChart, showChartEditor = true) {
        const props = {
            header: { title: this._localeService.t('chart.panel.title') },
            children: {
                label: CHART_SIDE_PANEL_KEY,
                conf: chart,
                showChartEditor,

            },
            onClose: () => this.closeSidePanel(),
        };

        this._sidebarDisposable = this._sidebarService.open(props);
    }

    closeSidePanel() {
        this._sidebarDisposable = null;
    }

    openChartDialog(chart?: IChart) {
        if (chart && chart.chartId) {
            // open chart
            this._dialogPlusService.open({
                id: chart.chartId,
                draggable: true,
                destroyOnClose: true,
                preservePositionOnDestroy: true,
                defaultPosition: chart.left && chart.top ? { x: chart.left, y: chart.top } : undefined,
                width: chart.width,
                height: chart.height,
                zIndex: chart.zIndex,
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
                className: `chart-plugin-dialog-plus-${chart.chartId}`,
                onResized: (width, height) => {
                    const c = { ...chart, width, height };
                    this._commandService.executeCommand(SetChartCommand.id, { unitId: getUnitId(this._univerInstanceService), subUnitId: getSubUnitId(this._univerInstanceService), chart: c } as ISetChartCommandParams);
                },
                onMoved: (left, top) => {
                    const c = { ...chart, left, top };
                    this._commandService.executeCommand(SetChartCommand.id, { unitId: getUnitId(this._univerInstanceService), subUnitId: getSubUnitId(this._univerInstanceService), chart: c } as ISetChartCommandParams);
                },
                onMouseDown: (currentZIndex: number) => {
                    const c = { ...chart, zIndex: currentZIndex };
                    this._commandService.executeCommand(SetChartCommand.id, { unitId: getUnitId(this._univerInstanceService), subUnitId: getSubUnitId(this._univerInstanceService), chart: c } as ISetChartCommandParams);
                },
            });
        }
    }

    closeChartDialog(chart?: Partial<IChart>) {
        if (chart && chart.chartId && chart.chartId !== CHART_PREVIEW_DIALOG_KEY) {
            this._dialogPlusService.close(chart.chartId);
        } else {
            this._dialogPlusService.close(CHART_PREVIEW_DIALOG_KEY);
        }
    }

    private _initMenu() {
        ([ChartSelectorMenuItemFactory, ManageChartsMenuItemFactory] as IMenuItemFactory[]).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), {}));
        });
    }

    private _initComponent() {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(CHART_SELECTOR_PANEL_COMPONENT, ChartSelectorPanel));
        this.disposeWithMe(componentManager.register('ChartDialog', ChartDialog));
    }

    private _initPanel() {
        this._componentManager.register(CHART_SIDE_PANEL_KEY, ChartSidePanel);
    }
}
