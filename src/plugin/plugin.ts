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
import { Inject, Injector } from '@wendellhu/redi';
import { CHART_PLUGIN_NAME } from './common/const.ts';
import ComboChart from './components/icons/combo_chart.tsx';
import { ChartMenuController } from './controllers/chart.menu.controller.ts';
import { ChartI18nController } from './controllers/chart.i18n.controller.ts';
import AreaChart from './components/icons/area_chart.tsx';
import BarChart from './components/icons/bar_chart.tsx';
import DoughnutChart from './components/icons/doughnut_chart.tsx';
import LineChart from './components/icons/line_chart.tsx';
import PieChart from './components/icons/pie_chart.tsx';
import StackedColumnChart from './components/icons/stacked_column_chart.tsx';
import { OpenChartPanelOperator } from './commands/operations/open-chart-panel.ts';

export class ChartPlugin extends Plugin {
    static override pluginName = CHART_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    static commandList = [
        OpenChartPanelOperator,
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
        this._initCommand();
        this._injector.add([ChartMenuController]);
        this._injector.add([ChartI18nController]);
    }

    /**
     * The first lifecycle of the plugin mounted on the Univer instance,
     * the Univer business instance has not been created at this time.
     * The plugin should add its own module to the dependency injection system at this lifecycle.
     * It is not recommended to initialize the internal module of the plugin outside this lifecycle.
     */
    onStarting() {
        // register icon component
        this.componentManager.register('ComboChart', ComboChart);
        this.componentManager.register('AreaChart', AreaChart);
        this.componentManager.register('BarChart', BarChart);
        this.componentManager.register('DoughnutChart', DoughnutChart);
        this.componentManager.register('LineChart', LineChart);
        this.componentManager.register('PieChart', PieChart);
        this.componentManager.register('StackedColumnChart', StackedColumnChart);
    }

    _initCommand() {
        [...ChartPlugin.commandList].forEach((m) => {
            this.commandService.registerCommand(m);
        });
    }
}
