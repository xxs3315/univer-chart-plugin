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

import { Subject } from 'rxjs';
import { Inject, Injector } from '@wendellhu/redi';
import { createChartId } from '../utils/create-chart-id.ts';
import type { IAnchor } from '../utils/anchor.ts';
import { findIndexByAnchor, moveByAnchor } from '../utils/anchor.ts';
import type { IChart, IChartModel } from './types.ts';
import { ChartViewModel } from './chart-view-model.ts';

type ChartConfOperatorType = 'delete' | 'set' | 'add' | 'sort';
export class ChartConfModel {
    //  Map<unitID ,<sheetId ,IConditionFormattingRule[]>>
    private _model: IChartModel = new Map();
    private _chartConfChange$ = new Subject<{ chart: IChart; unitId: string; subUnitId: string; type: ChartConfOperatorType }>();
    $chartConfChange = this._chartConfChange$.asObservable();

    constructor(
        @Inject(ChartViewModel) private _chartViewModel: ChartViewModel,
        @Inject(Injector) private _injector: Injector
    ) {
        // empty
    }

    private _ensureList(unitId: string, subUnitId: string) {
        let list = this.getSubunitChartConfs(unitId, subUnitId);
        if (!list) {
            list = [];
            let unitMap = this._model.get(unitId);
            if (!unitMap) {
                unitMap = new Map<string, IChart[]>();
                this._model.set(unitId, unitMap);
            }
            unitMap.set(subUnitId, list);
        }
        return list;
    }

    getChartConf(unitId: string, subUnitId: string, chartId?: string) {
        const list = this.getSubunitChartConfs(unitId, subUnitId);
        if (list) {
            return list.find((item) => item.chartId === chartId);
        }
        return null;
    }

    getUnitChartConfs(unitId: string) {
        const map = this._model.get(unitId);
        return map || null;
    }

    getSubunitChartConfs(unitId: string, subUnitId: string) {
        const list = this._model.get(unitId)?.get(subUnitId);
        return list || null;
    }

    deleteChartConf(unitId: string, subUnitId: string, chartId: string) {
        const list = this.getSubunitChartConfs(unitId, subUnitId);
        if (list) {
            const index = list.findIndex((e) => e.chartId === chartId);
            const chart = list[index];
            if (chart) {
                list.splice(index, 1);
                this._chartConfChange$.next({ chart, subUnitId, unitId, type: 'delete' });
            }
        }
    }

    setChartConf(unitId: string, subUnitId: string, chart: IChart, oldChartId: string) {
        const list = this._ensureList(unitId, subUnitId);
        const oldChartConf = list.find((item) => item.chartId === oldChartId);
        if (oldChartConf) {
            // const chartConfPriorityMap = list.map((item) => item.chartId).reduce((map, cur, index) => {
            //     map.set(cur, index);
            //     return map;
            // }, new Map<string, number>());
            // After each setting, the cache needs to be cleared,
            // and this cleanup is deferred until the end of the calculation.
            // Otherwise the render will flash once
            // const cloneRange = [...oldChartConf.ranges];
            // const conditionalFormattingService = this._injector.get(ConditionalFormattingService);

            Object.assign(oldChartConf, chart);

            // const dispose = conditionalFormattingService.interceptorManager.intercept(conditionalFormattingService.interceptorManager.getInterceptPoints().beforeUpdateRuleResult, {
            //     handler: (config) => {
            //         if (unitId === config?.unitId && subUnitId === config.subUnitId && oldRule.cfId === config.cfId) {
            //             cloneRange.forEach((range) => {
            //                 Range.foreach(range, (row, col) => {
            //                     this._conditionalFormattingViewModel.deleteCellCf(unitId, subUnitId, row, col, oldRule.cfId);
            //                 });
            //             });
            //             oldRule.ranges.forEach((range) => {
            //                 Range.foreach(range, (row, col) => {
            //                     this._conditionalFormattingViewModel.pushCellCf(unitId, subUnitId, row, col, oldRule.cfId);
            //                     this._conditionalFormattingViewModel.sortCellCf(unitId, subUnitId, row, col, cfPriorityMap);
            //                 });
            //             });
            //             dispose();
            //         }
            //     },
            // });
            //
            // oldRule.ranges.forEach((range) => {
            //     Range.foreach(range, (row, col) => {
            //         this._conditionalFormattingViewModel.pushCellCf(unitId, subUnitId, row, col, oldRule.cfId);
            //     });
            // });

            // this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, oldRule);
            this._chartConfChange$.next({ chart: oldChartConf, subUnitId, unitId, type: 'set' });
        }
    }

    addChartConf(unitId: string, subUnitId: string, chart: IChart) {
        const list = this._ensureList(unitId, subUnitId);
        const item = list.find((item) => item.chartId === chart.chartId);
        if (!item) {
            // The new conditional formatting has a higher priority
            list.unshift(chart);
        }
        // const chartConfPriorityMap = list.map((item) => item.chart).reduce((map, cur, index) => {
        //     map.set(cur, index);
        //     return map;
        // }, new Map<string, number>());
        // cha.ranges.forEach((range) => {
        //     Range.foreach(range, (row, col) => {
        //         this._conditionalFormattingViewModel.pushCellCf(unitId, subUnitId, row, col, rule.cfId);
        //         this._conditionalFormattingViewModel.sortCellCf(unitId, subUnitId, row, col, cfPriorityMap);
        //     });
        // });
        // this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, rule);
        this._chartConfChange$.next({ chart, subUnitId, unitId, type: 'add' });
    }

    /**
     * example [1,2,3,4,5,6],if you move behind 5 to 2, then cfId=5,targetId=2.
     * if targetId does not exist, it defaults to top
     */
    moveChartPriority(unitId: string, subUnitId: string, start: IAnchor, end: IAnchor) {
        const list = this._ensureList(unitId, subUnitId);
        const curIndex = findIndexByAnchor(start, list, (chart) => chart.chartId);
        const targetChartIndex = findIndexByAnchor(end, list, (chart) => chart.chartId);
        if (targetChartIndex === null || curIndex === null || targetChartIndex === curIndex) {
            return;
        }
        const chart = list[curIndex];
        if (chart) {
            moveByAnchor(start, end, list, (chart) => chart.chartId);

            // const cfPriorityMap = list.map((item) => item.chartId).reduce((map, cur, index) => {
            //     map.set(cur, index);
            //     return map;
            // }, new Map<string, number>());
            // chart.ranges.forEach((range) => {
            //     Range.foreach(range, (row, col) => {
            //         this._chartViewModel.sortCellCf(unitId, subUnitId, row, col, cfPriorityMap);
            //     });
            // });
            this._chartConfChange$.next({ chart, subUnitId, unitId, type: 'sort' });
        }
    }

    createChartId(_unitId: string, _subUnitId: string) {
        return createChartId();
    }

    deleteUnitId(unitId: string) {
        this._model.delete(unitId);
    }
}
