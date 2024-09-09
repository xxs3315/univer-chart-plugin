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
import { ICommandService, Inject, Injector, Rectangle } from '@univerjs/core';
import { createChartId } from '../utils/create-chart-id';
import type { IAnchor } from '../utils/anchor';
import { findIndexByAnchor, moveByAnchor } from '../utils/anchor';
import type { IChart, IChartConfig, IChartModel } from './types';

type ChartConfOperatorType = 'delete' | 'set' | 'add' | 'sort' | 'redraw';

export class ChartConfModel {
    private _model: IChartModel = new Map();
    private _chartConfChange$ = new Subject<{
        charts: IChart[];
        unitId: string;
        subUnitId: string;
        type: ChartConfOperatorType;
    }>();

    $chartConfChange = this._chartConfChange$.asObservable();

    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(ICommandService) private _commandService: ICommandService
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

    reArrangeChartZIndex(unitId: string, subUnitId: string) {
        const allCharts = this.getUnitChartConfs(unitId);
        const zIndexMap: Array<{ chartId: string; zIndex: number | undefined }> = [];
        allCharts?.forEach((value, _key) => {
            value.forEach((chart) => {
                zIndexMap.push({
                    chartId: chart.chartId,
                    zIndex: chart.zIndex,
                });
            });
        });
        zIndexMap.sort((o1, o2) => {
            return o1.zIndex && o2.zIndex && o2.zIndex > o1.zIndex ? -1 : 1;
        });
        const list = this._ensureList(unitId, subUnitId);

        const charts: IChart[] = [];
        zIndexMap.forEach((item, index) => {
            const oldChartConf = list.find((chart) => chart.chartId === item.chartId);
            if (oldChartConf) {
                Object.assign(oldChartConf, { zIndex: index + 1 });
                charts.push(oldChartConf);
            }
        });
        this._chartConfChange$.next({ charts, subUnitId, unitId, type: 'set' });
    }

    getLatestMaxZIndex(unitId: string) {
        let result = 0;
        const allCharts = this.getUnitChartConfs(unitId);
        allCharts?.forEach((value, _key) => {
            value.forEach((chart) => {
                if (chart && chart.zIndex && chart.zIndex > result) {
                    result = chart.zIndex;
                }
            });
        });
        return result;
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

    deleteChartConf(unitId: string, subUnitId: string, chartIds: string[]) {
        const list = this.getSubunitChartConfs(unitId, subUnitId);
        if (list) {
            const chartsToDelete: IChart<IChartConfig>[] = [];
            chartIds.forEach((chartId) => {
                const index = list.findIndex((e) => e.chartId === chartId);
                const chart = list[index];
                if (chart) {
                    list.splice(index, 1);
                    chartsToDelete.push(chart);
                }
            });
            this._chartConfChange$.next({ charts: chartsToDelete, subUnitId, unitId, type: 'delete' });
        }
    }

    setChartConf(unitId: string, subUnitId: string, chart: IChart, oldChartId: string) {
        const list = this._ensureList(unitId, subUnitId);
        const oldChartConf = list.find((item) => item.chartId === oldChartId);
        if (oldChartConf) {
            Object.assign(oldChartConf, chart);
            this._chartConfChange$.next({ charts: [oldChartConf], subUnitId, unitId, type: 'set' });
        }
    }

    setChartConfSize(unitId: string, subUnitId: string, chart: IChart, oldChartId: string, width: number, height: number) {
        const list = this._ensureList(unitId, subUnitId);
        const oldChartConf = list.find((item) => item.chartId === oldChartId);
        if (oldChartConf) {
            Object.assign(oldChartConf, { width, height });
            this._chartConfChange$.next({ charts: [oldChartConf], subUnitId, unitId, type: 'set' });
        }
    }

    addChartConf(unitId: string, subUnitId: string, chart: IChart) {
        const list = this._ensureList(unitId, subUnitId);
        const item = list.find((item) => item.chartId === chart.chartId);
        if (!item) {
            // The new chart has a higher priority
            list.unshift(chart);
        }
        this._chartConfChange$.next({ charts: [chart], subUnitId, unitId, type: 'add' });
    }

    markDirty(unitId: string, subUnitId: string, chart: IChart) {
        const list = this._ensureList(unitId, subUnitId);
        const oldChartConf = list.find((item) => item.chartId === chart.chartId);
        if (oldChartConf) {
            Object.assign(oldChartConf, chart);
            this._chartConfChange$.next({ charts: [oldChartConf], subUnitId, unitId, type: 'redraw' });
        }
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
            this._chartConfChange$.next({ charts: [chart], subUnitId, unitId, type: 'sort' });
        }
    }

    createChartId(_unitId: string, _subUnitId: string) {
        return createChartId();
    }

    deleteUnitId(unitId: string) {
        this._model.delete(unitId);
    }

    getIntersectCharts(unitId: string, subUnitId: string, row: number, col: number) {
        return this.getSubunitChartConfs(unitId, subUnitId)?.filter((chart) => Rectangle.intersects(chart.ranges?.[0], { startRow: row, endRow: row, startColumn: col, endColumn: col }));
    }
}
