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

import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';

import { createIdentifier, Inject, Injector } from '@wendellhu/redi';

import type { IRange } from '@univerjs/core';
import { Disposable, IContextService } from '@univerjs/core';
import { CHART_PREVIEW_DIALOG_KEY } from '../common/const';
import type { IChartConfig } from '../models/types';
import { ChartGroupType } from '../types/enum/chart-group-types';
import { ChartType } from '../types/enum/chart-types';

export interface IChartPreviewState {
    chartId: string;
    ranges: IRange[];
    conf: Partial<IChartConfig>;
}

export class ChartPreviewState {
    private readonly _stateUpdates$ = new Subject<Partial<IChartPreviewState>>();
    readonly stateUpdates$: Observable<Partial<IChartPreviewState>> = this._stateUpdates$.asObservable();

    private readonly _state$ = new BehaviorSubject<IChartPreviewState>(createInitChartPreviewState());
    readonly state$ = this._state$.asObservable();
    get state(): IChartPreviewState {
        return this._state$.getValue();
    }

    private _chartId = '';
    private _ranges = [] as IRange[];
    private _conf = {} as IChartConfig;
    get chartId(): string { return this._chartId; }
    get ranges(): IRange[] { return this._ranges; }
    get conf(): IChartConfig { return this._conf; }

    changeState(changes: Partial<IChartPreviewState>): void {
        let changed = false;
        const changedState: Partial<IChartPreviewState> = { conf: {} };
        if (changedState) {
            if (typeof changes.conf?.type !== 'undefined' && this._conf.type !== changes.conf?.type) {
                this._conf.type = changes.conf.type;
                changedState.conf!.type = changes.conf.type;
                changed = true;
            }

            if (typeof changes.conf?.subType !== 'undefined' && this._conf.subType !== changes.conf?.subType) {
                this._conf.subType = changes.conf.subType;
                changedState.conf!.subType = changes.conf.subType;
                changed = true;
            }

            if (typeof changes.conf?.title !== 'undefined' && this._conf.title !== changes.conf?.title) {
                this._conf.title = changes.conf.title;
                changedState.conf!.title = changes.conf.title;
                changed = true;
            }

            if (typeof changes.conf?.theme !== 'undefined' && this._conf.theme !== changes.conf?.theme) {
                this._conf.theme = changes.conf.theme;
                changedState.conf!.theme = changes.conf.theme;
                changed = true;
            }

            if (typeof changes.conf?.reverseAxis !== 'undefined' && this._conf.reverseAxis !== changes.conf?.reverseAxis) {
                this._conf.reverseAxis = changes.conf.reverseAxis;
                changedState.conf!.reverseAxis = changes.conf.reverseAxis;
                changed = true;
            }

            if (typeof changes.ranges !== 'undefined' && this._ranges !== changes.ranges) {
                this._ranges = changes.ranges;
                changedState.ranges = changes.ranges;
                changed = true;
            }

            if (typeof changes.chartId !== 'undefined' && this._chartId !== changes.chartId) {
                this._chartId = changes.chartId;
                changedState.chartId = changes.chartId;
                changed = true;
            }

            if (changed) {
                this._state$.next({
                    chartId: this._chartId,
                    ranges: this._ranges,
                    conf: this._conf,
                });
                this._stateUpdates$.next(changedState);
            }
        }
    }
}

export interface IChartPreviewService {
    readonly stateUpdates$: Observable<Partial<IChartPreviewState>>;
    readonly state$: Observable<IChartPreviewState>;

    readonly focusSignal$: Observable<void>;

    changeChartId(chartId: string): void;

    changeChartType(type: string, subType: string): void;

    changeRange(ranges: IRange[]): void;

    changeChartConfTitle(title: string): void;

    changeChartConfTheme(theme: string): void;

    changeChartConfReverseAxis(reverseAxis: boolean): void;
}

function createInitChartPreviewState(): IChartPreviewState {
    return {
        ranges: [],
        chartId: CHART_PREVIEW_DIALOG_KEY,
        conf: {
            type: ChartGroupType.LINE,
            subType: ChartType.LINE_DEFAULT,
            title: '',
            theme: 'default',
            reverseAxis: false,
        } as IChartConfig,
    };
}

export const IChartPreviewService = createIdentifier<IChartPreviewService>('sheet.chart.preview.service');

export class ChartPreviewService extends Disposable implements IChartPreviewService {
    private readonly _state = new ChartPreviewState();

    private readonly _focusSignal$ = new Subject<void>();
    readonly focusSignal$ = this._focusSignal$.asObservable();

    get state$() { return this._state.state$; }
    get stateUpdates$() { return this._state.stateUpdates$; }

    constructor(@Inject(Injector) private readonly _injector: Injector, @IContextService private readonly _contextService: IContextService) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._focusSignal$.complete();
    }

    changeChartId(chartId: string) {
        this._state.changeState({ chartId });
    }

    changeChartConfTitle(title: string): void {
        this._state.changeState({ conf: { title } });
    }

    changeChartConfTheme(theme: string): void {
        this._state.changeState({ conf: { theme } });
    }

    changeChartType(type: string, subType: string): void {
        this._state.changeState({ conf: { type, subType } as IChartConfig });
    }

    changeRange(ranges: IRange[]): void {
        this._state.changeState({ ranges });
    }

    changeChartConfReverseAxis(reverseAxis: boolean): void {
        this._state.changeState({ conf: { reverseAxis } });
    }
}
