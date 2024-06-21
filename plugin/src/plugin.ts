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

import { ICommandService, Plugin, UniverInstanceType } from '@univerjs/core';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { SHEET_CHART_PLUGIN } from './common/const';
import ComboChart from './components/icons/combo_chart';
import { ChartMenuController } from './controllers/chart.menu.controller';
import { ChartI18nController } from './controllers/chart.i18n.controller';
import AreaChart from './components/icons/area_chart';
import BarChart from './components/icons/bar_chart';
import DoughnutChart from './components/icons/doughnut_chart';
import LineChart from './components/icons/line_chart';
import PieChart from './components/icons/pie_chart';
import StackedColumnChart from './components/icons/stacked_column_chart';
import { OpenChartEditPanelOperator, OpenChartManagePanelOperator } from './commands/operations/open-chart-panel.operation';
import { ChartConfModel } from './models/chart-conf-model';
import { MoveChartMutation } from './commands/mutations/move-chart.mutation';
import { SetChartMutation } from './commands/mutations/set-chart.mutation';
import { DeleteChartMutation } from './commands/mutations/delete-chart.mutation';
import { AddChartMutation } from './commands/mutations/add-chart.mutation';
import { SetChartCommand } from './commands/commands/set-chart.command';
import { AddChartCommand } from './commands/commands/add-chart.command';
import { ChartClearController } from './controllers/chart.clear.controller';
import { DeleteChartCommand } from './commands/commands/delete-chart.command';
import { MoveChartCommand } from './commands/commands/move-chart.command';
import { ChartService, IChartService } from './services/chart.service';
import { ChartInitService } from './services/chart-init.service';
import { DesktopDialogPlusService } from './services/dialog-plus/desktop-dialog-plus.service';
import { IDialogPlusService } from './services/dialog-plus/dialog-plus.service';
import { ChartPreviewService, IChartPreviewService } from './services/chart-preview.service';

export class UniverChartPlugin extends Plugin {
    static override pluginName = SHEET_CHART_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    static readonly mutationList = [AddChartMutation, DeleteChartMutation, SetChartMutation, MoveChartMutation];
    static commandList = [
        OpenChartEditPanelOperator,
        OpenChartManagePanelOperator,
        // ChartPreviewOperator,
        SetChartCommand,
        AddChartCommand,
        DeleteChartCommand,
        MoveChartCommand,
    ];

    constructor(
        // inject injector, required
        @Inject(Injector) override readonly _injector: Injector,
        // inject menu service, to add toolbar button
        @Inject(IMenuService) private menuService: IMenuService,
        // inject command service, to register command handler
        @Inject(ICommandService) private readonly commandService: ICommandService,
        // inject component manager, to register icon component
        @Inject(ComponentManager) private readonly componentManager: ComponentManager
    ) {
        super();
    }

    /**
     * The first lifecycle of the plugin mounted on the Univer instance,
     * the Univer business instance has not been created at this time.
     * The plugin should add its own module to the dependency injection system at this lifecycle.
     * It is not recommended to initialize the internal module of the plugin outside this lifecycle.
     */
    override onStarting(injector: Injector) {
        super.onStarting(injector);

        // register icon component
        this.disposeWithMe(this.componentManager.register('ComboChart', ComboChart));
        this.disposeWithMe(this.componentManager.register('AreaChart', AreaChart));
        this.disposeWithMe(this.componentManager.register('BarChart', BarChart));
        this.disposeWithMe(this.componentManager.register('DoughnutChart', DoughnutChart));
        this.disposeWithMe(this.componentManager.register('LineChart', LineChart));
        this.disposeWithMe(this.componentManager.register('PieChart', PieChart));
        this.disposeWithMe(this.componentManager.register('StackedColumnChart', StackedColumnChart));

        ([
            // model
            [ChartConfModel],
            // [ChartViewModel],
            // service
            [IChartService, { useClass: ChartService }],
            [ChartInitService],
            [IChartPreviewService, { useClass: ChartPreviewService }],
            [IDialogPlusService, { useClass: DesktopDialogPlusService }],
            // controller
            [ChartMenuController],
            [ChartI18nController],
            [ChartClearController],
        ] as Dependency[]).forEach(
            (d) => {
                injector.add(d);
            }
        );

        [...UniverChartPlugin.mutationList].forEach((m) => {
            this.commandService.registerCommand(m);
        });
        [...UniverChartPlugin.commandList].forEach((m) => {
            this.commandService.registerCommand(m);
        });
    }
}
