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
import { Index } from '../components/chart-selector-panel';
import { ChartSidePanel } from '../components/chart-side-panel';
import type { IChart } from '../models/types.ts';
import { ChartPreviewDialog } from '../components/chart-preview-dialog';

import {
    IChartPreviewService } from '../services/chart-preview.service.ts';
import { ChartSelectorMenuItemFactory } from './menu/chart.menu.ts';

const CHART_SIDE_PANEL_KEY = 'sheet.chart.side.panel';
const CHART_PREVIEW_DIALOG_KEY = 'sheet.chart.preview.dialog';

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
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(IChartPreviewService) private _chartPreviewService: IChartPreviewService
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
        this.closeChartPreviewDialog();
    }

    openChartPreviewDialog(chart?: IChart) {
        // open preview dialog
        this._dialogService.open({
            id: CHART_PREVIEW_DIALOG_KEY,
            draggable: true,
            destroyOnClose: true,
            children: { label: 'ChartPreviewDialog' },
            title: { title: this._localeService.t('chart.panel.title') + this._localeService.t('chart.panel.preview') },
            onClose: () => {
                this.closeChartPreviewDialog();
                // 同时关闭 side panel
                this._sidebarService.close();
            },
        });
    }

    closeChartPreviewDialog() {
        this._dialogService.close(CHART_PREVIEW_DIALOG_KEY);
        queueMicrotask(() => this._layoutService.focus());
    }

    private _initMenu() {
        ([ChartSelectorMenuItemFactory] as IMenuItemFactory[]).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), {}));
        });
    }

    private _initComponent() {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(CHART_SELECTOR_PANEL_COMPONENT, Index));
        this.disposeWithMe(componentManager.register('ChartPreviewDialog', ChartPreviewDialog));
    }

    private _initPanel() {
        this._componentManager.register(CHART_SIDE_PANEL_KEY, ChartSidePanel);
    }
}

// class ChartPreviewProvider extends Disposable implements IChartPreviewProvider {
//     /**
//      * Hold all previews in this kind of univer business instances (Workbooks).
//      */
//     private readonly _previewModelsByUnitId = new Map<string, SheetChartPreviewModel>();
//
//     constructor(
//         @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
//         @Inject(Injector) private readonly _injector: Injector
//     ) {
//         super();
//     }
//
//     preview(request: IChartPreviewRequest): Promise<SheetChartPreviewModel[]> {
//         this._terminate();
//         // NOTE: If there are multi Workbook instances then we should create `SheetFindModel` for each of them.
//         // But we don't need to implement that in the foreseeable future.
//         const currentWorkbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
//         if (currentWorkbook) {
//             const sheetPreview = this._injector.createInstance(SheetChartPreviewModel, currentWorkbook);
//         }
//
//         return Promise.resolve([]);
//     }
//
//     terminate(): void {
//         this._terminate();
//     }
//
//     private _terminate(): void {
//         this._previewModelsByUnitId.forEach((model) => model.dispose());
//         this._previewModelsByUnitId.clear();
//     }
// }
//
// const SHEETS_CHART_PREVIEW_PROVIDER_NAME = 'sheets-chart-preview-provider';
// const CHART_PREVIEW_Z_INDEX = 10000;
//
// export interface ISheetChartPreviewSuccess extends IChartPreviewSuccess {
//     provider: typeof SHEETS_CHART_PREVIEW_PROVIDER_NAME;
//     range: {
//         subUnitId: string;
//         range: IRange;
//     };
// }
//
// export class SheetChartPreviewModel extends PreviewModel {
//     // We can directly inject the `FindReplaceService` here, and call its methods instead of using the observables.
//     private readonly _previewsUpdate$ = new Subject<ISheetChartPreviewSuccess[]>();
//     readonly previewsUpdate$ = this._previewsUpdate$.asObservable();
//
//     /** Hold all matches in the currently searching scope. */
//     private _previews: ISheetChartPreviewSuccess[] = [];
//
//     constructor(
//         private readonly _workbook: Workbook,
//         @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
//         @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
//         @ICommandService private readonly _commandService: ICommandService,
//         @IContextService private readonly _contextService: IContextService,
//         @Inject(ThemeService) private readonly _themeService: ThemeService,
//         @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
//         @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
//     ) {
//         super();
//     }
//
//     get unitId(): string { return this._workbook.getUnitId(); }
//     get subUnitId(): string { return this._workbook.getActiveSheet().getSheetId(); }
//
//     getChartPreviewSuccesses(): IChartPreviewSuccess[] {
//         return this._previews;
//     }
//
//     start(request: IChartPreviewRequest) {
//         this._preview(request);
//     }
//
//     private _preview(request: IChartPreviewRequest) {
//     }
// }
