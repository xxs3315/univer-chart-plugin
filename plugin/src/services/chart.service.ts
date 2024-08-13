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

import { createIdentifier, Disposable, IContextService,Inject, Injector } from '@univerjs/core';

import { BehaviorSubject, type Observable, Subject } from 'rxjs';

export interface IChartHighlightState {
    chartId: string | undefined;
}

export class ChartHighlightState {
    private readonly _highlightStateUpdates$ = new Subject<Partial<IChartHighlightState>>();
    readonly highlightStateUpdates$: Observable<Partial<IChartHighlightState>> = this._highlightStateUpdates$.asObservable();

    private readonly _highlightState$ = new BehaviorSubject<IChartHighlightState>({ chartId: '' });
    readonly highlightState$ = this._highlightState$.asObservable();
    get highlightState(): IChartHighlightState {
        return this._highlightState$.getValue();
    }

    private _chartId: string | undefined = undefined;
    get chartId(): string | undefined { return this._chartId; }

    changeState(changes: Partial<IChartHighlightState>): void {
        let changed = false;
        const changedState: Partial<IChartHighlightState> = { chartId: undefined };
        if (changedState) {
            if (typeof changes.chartId !== 'undefined' && this._chartId !== changes.chartId) {
                this._chartId = changes.chartId;
                changedState.chartId = changes.chartId;
                changed = true;
            }
            if (changed) {
                this._highlightState$.next({
                    chartId: this._chartId,
                });
                this._highlightStateUpdates$.next(changedState);
            }
        }
    }
}

export interface IChartService {
    readonly highlightStateUpdates$: Observable<Partial<IChartHighlightState>>;
    readonly highlightState$: Observable<IChartHighlightState>;

    changeChartHighlightId(chartId: string | undefined): void;
}

export const IChartService = createIdentifier<IChartService>('sheet.chart.service');

export class ChartService extends Disposable implements IChartService {
    private readonly _highlightState = new ChartHighlightState();

    get highlightState$() { return this._highlightState.highlightState$; }
    get highlightStateUpdates$() { return this._highlightState.highlightStateUpdates$; }

    constructor(@Inject(Injector) private readonly _injector: Injector,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();
    }

    changeChartHighlightId(chartId: string) {
        this._highlightState.changeState({ chartId });
    }
}
