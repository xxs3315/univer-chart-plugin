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
import { SHEET_CHART_PLUGIN } from './common/const.ts';
import ComboChart from './components/icons/combo_chart.tsx';
import { ChartMenuController } from './controllers/chart.menu.controller.ts';
import { ChartI18nController } from './controllers/chart.i18n.controller.ts';
import AreaChart from './components/icons/area_chart.tsx';
import BarChart from './components/icons/bar_chart.tsx';
import DoughnutChart from './components/icons/doughnut_chart.tsx';
import LineChart from './components/icons/line_chart.tsx';
import PieChart from './components/icons/pie_chart.tsx';
import StackedColumnChart from './components/icons/stacked_column_chart.tsx';
import { OpenChartManagePanelOperator, OpenChartPanelOperator } from './commands/operations/open-chart-panel.operation.ts';
import { ChartPreviewOperator } from './commands/operations/chart-preview.operation.ts';
import { ChartConfModel } from './models/chart-conf-model.ts';
import { ChartViewModel } from './models/chart-view-model.ts';
import { MoveChartMutation } from './commands/mutations/move-chart.mutation.ts';
import { SetChartMutation } from './commands/mutations/set-chart.mutation.ts';
import { DeleteChartMutation } from './commands/mutations/delete-chart.mutation.ts';
import { AddChartMutation } from './commands/mutations/add-chart.mutation.ts';
import { SetChartCommand } from './commands/commands/set-chart.command.ts';
import { AddChartCommand } from './commands/commands/add-chart.command.ts';
import { ChartClearController } from './controllers/chart.clear.controller.ts';
import { DeleteChartCommand } from './commands/commands/delete-chart.command.ts';
import { MoveChartCommand } from './commands/commands/move-chart.command.ts';
import { ChartPreviewService, IChartPreviewService } from './services/chart-preview.service.ts';
import { ChartService } from './services/chart.service.ts';
import { ChartInitService } from './services/chart-init.service.ts';
import { DesktopDialogPlusService } from './services/dialog-plus/desktop-dialog-plus.service.ts';
import { IDialogPlusService } from './services/dialog-plus/dialog-plus.service.ts';

export class ChartPlugin extends Plugin {
    static override pluginName = SHEET_CHART_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    static readonly mutationList = [AddChartMutation, DeleteChartMutation, SetChartMutation, MoveChartMutation];
    static commandList = [
        OpenChartPanelOperator,
        OpenChartManagePanelOperator,
        ChartPreviewOperator,
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
    onStarting(injector: Injector) {
        // register icon component
        this.componentManager.register('ComboChart', ComboChart);
        this.componentManager.register('AreaChart', AreaChart);
        this.componentManager.register('BarChart', BarChart);
        this.componentManager.register('DoughnutChart', DoughnutChart);
        this.componentManager.register('LineChart', LineChart);
        this.componentManager.register('PieChart', PieChart);
        this.componentManager.register('StackedColumnChart', StackedColumnChart);

        ([
            // model
            [ChartConfModel],
            [ChartViewModel],
            // service
            [ChartService],
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

        [...ChartPlugin.mutationList].forEach((m) => {
            this.commandService.registerCommand(m);
        });
        [...ChartPlugin.commandList].forEach((m) => {
            this.commandService.registerCommand(m);
        });
    }

    onReady() {
        super.onReady();
    }

    onRendered() {
        super.onRendered();
    }
}
