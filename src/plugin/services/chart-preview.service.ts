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
import { BehaviorSubject, Subject, throttleTime } from 'rxjs';

import { createIdentifier, Inject, Injector } from '@wendellhu/redi';

import type {
    IRange, Nullable } from '@univerjs/core';
import {
    Disposable, IContextService,
    ILogService,
    IUniverInstanceService } from '@univerjs/core';

export interface IChartPreviewState {
    type: string;
    range: IRange[];
    /** Indicates if a user triggered previewing process is progressed. */
    previewCompleted: boolean;
    title: string;
}

export class ChartPreviewState {
    private readonly _stateUpdates$ = new Subject<Partial<IChartPreviewState>>();
    readonly stateUpdates$: Observable<Partial<IChartPreviewState>> = this._stateUpdates$.asObservable();

    private readonly _state$ = new BehaviorSubject<IChartPreviewState>(createInitChartPreviewState());
    readonly state$ = this._state$.asObservable();
    get state(): IChartPreviewState {
        return this._state$.getValue();
    }

    private _type = 'line-default';
    private _range: IRange[] = [];
    private _previewCompleted = false;
    private _title = '';

    get type(): string { return this._type; }
    get range(): IRange[] { return this._range; }
    get previewCompleted(): boolean { return this._previewCompleted; }
    get title(): string { return this._title; }

    changeState(changes: Partial<IChartPreviewState>): void {
        let changed = false;
        const changedState: Partial<IChartPreviewState> = {};

        if (typeof changes.type !== 'undefined' && changes.type !== this._type) {
            this._type = changes.type;
            changedState.type = this._type;
            changed = true;
        }

        if (typeof changes.range !== 'undefined' && changes.range !== this._range) {
            this._range = changes.range;
            changedState.range = this._range;
            changed = true;
        }

        if (typeof changes.previewCompleted !== 'undefined' && changes.previewCompleted !== this._previewCompleted) {
            this._previewCompleted = changes.previewCompleted;
            changedState.previewCompleted = changes.previewCompleted;
            changed = true;
        }

        if (typeof changes.title !== 'undefined' && changes.title !== this._title) {
            this._title = changes.title;
            changedState.title = this._title;
            changed = true;
        }

        if (changed) {
            this._state$.next({
                type: this._type,
                range: this._range,
                title: this._title,
                previewCompleted: this._previewCompleted,
            });

            this._stateUpdates$.next(changedState);
        }
    }
}

function createInitChartPreviewState(): IChartPreviewState {
    return {
        type: 'line-default',
        range: [],
        title: '',
        previewCompleted: false,
    };
}

export interface IChartPreviewService {
    readonly stateUpdates$: Observable<Partial<IChartPreviewState>>;
    readonly state$: Observable<IChartPreviewState>;

    readonly focusSignal$: Observable<void>;

    /**
     * Get type string from the internal state.
     */
    getTypeString(): string;

    /**
     * Start a preview session.
     *
     * @returns execution result
     */
    start(type?: string): boolean;

    changeChartType(type: string): void;

    changeRange(range: IRange[]): void;

    changeChartConfTitle(title: string): void;
    //
    // /**
    //  * Terminate a preview session and clear all caches.
    //  */
    // terminate(): void;
}

export const IChartPreviewService = createIdentifier<IChartPreviewService>('sheet.chart.preview.service');

export class ChartPreviewService extends Disposable implements IChartPreviewService {
    private readonly _providers = new Set<IChartPreviewProvider>();
    private readonly _state = new ChartPreviewState();
    private _model: Nullable<ChartPreviewModel>;

    private readonly _focusSignal$ = new Subject<void>();
    readonly focusSignal$ = this._focusSignal$.asObservable();

    constructor(@Inject(Injector) private readonly _injector: Injector, @IContextService private readonly _contextService: IContextService) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._focusSignal$.complete();
    }

    start(type = 'line-default'): boolean {
        this._model = this._injector.createInstance(ChartPreviewModel, this._state, this._providers);

        const newState = createInitChartPreviewState();
        if (type) {
            newState.type = type;
        }
        this._state.changeState(newState);

        return true;
    }

    get stateUpdates$() { return this._state.stateUpdates$; }
    get state$() { return this._state.state$; }

    getTypeString(): string {
        return this._state.type;
    }

    changeChartType(type: string): void {
        this._state.changeState({ type });
    }

    changeRange(range: IRange[]): void {
        this._state.changeState({ range });
    }

    changeChartConfTitle(title: string): void {
        this._state.changeState({ title });
    }
    //
    // terminate(): void {
    //     this._model?.dispose();
    //     this._model = null;
    // }
    //
    // registerFindReplaceProvider(provider: IChartPreviewProvider): IDisposable {
    //     this._providers.add(provider);
    //     return toDisposable(() => this._providers.delete(provider));
    // }
}

export abstract class PreviewModel extends Disposable {
    abstract readonly unitId: string;
    abstract readonly subUnitId: string;

    /**
     * Preview model should emit new previews from this observable if they changed no matter due to incremental
     * or document's content changes.
     */
    abstract readonly previewsUpdate$: Observable<IChartPreviewSuccess[]>;

    abstract getChartPreviewSuccesses(): IChartPreviewSuccess[];
}

export class ChartPreviewModel extends Disposable {
    // readonly currentPreview$ = new BehaviorSubject<Nullable<IChartPreviewSuccess>>(null);
    // /** All preview models returned by providers. */
    // private _previewModels: PreviewModel[] = [];
    //
    // private _currentPreviewingDisposables: Nullable<DisposableCollection> = null;
    //
    // private _successes: IChartPreviewSuccess[] = [];

    constructor(
        private readonly _state: ChartPreviewState,
        private readonly _providers: Set<IChartPreviewProvider>,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        // should restart previewing when the following conditions changed
        this.disposeWithMe(
            this._state.stateUpdates$.pipe(throttleTime(200, undefined, { leading: true, trailing: true }))
                .subscribe(async (stateUpdate) => {
                    const state = this._state.state;
                    if (shouldStateUpdateTriggerPreview(stateUpdate)) {
                        // if (state.type !== '') {
                        //     await this._startPreviewing();
                        this._state.changeState({ previewCompleted: true });
                        // } else {
                        //     this._stopPreviewing();
                        // }
                    }
                }));
    }

    override dispose(): void {
        super.dispose();

        // reset all state, including
        this._state.changeState({ ...createInitChartPreviewState() });
    }

    // private async _startPreviewing(): Promise<IChartPreviewComplete> {
    //     const providers = Array.from(this._providers);
    //
    //     const previewModels = (this._previewModels = (
    //         await Promise.all(providers.map((provider) => provider.preview({
    //             type: this._state.type,
    //         })))
    //     ).flat());
    //
    //     this._subscribeToModelsChanges(previewModels);
    //
    //     const newPreviews = this._successes = previewModels.map((c) => c.getChartPreviewSuccesses()).flat();
    //
    //     if (!newPreviews.length) {
    //         this._state.changeState({ previewCompleted: false });
    //         return { results: [] };
    //     }
    //
    //     this._state.changeState({ previewCompleted: true });
    //     return { results: newPreviews };
    // }
    //
    // /** Terminate the current searching session, when searching string is empty. */
    // private _stopPreviewing(): void {
    //     this._providers.forEach((provider) => provider.terminate());
    //     this._previewModels = [];
    //
    //     this._currentPreviewingDisposables?.dispose();
    //     this._currentPreviewingDisposables = null;
    //
    //     this.currentPreview$.next(null);
    //
    //     this._state.changeState({
    //         previewCompleted: false,
    //         type: 'line-default',
    //     });
    // }

    // When a document's content changes, we should reset all previews.
    // private _subscribeToModelsChanges(models: PreviewModel[]): void {
    //     const disposables = this._currentPreviewingDisposables = new DisposableCollection();
    //
    //     const matchesUpdateSubscription = combineLatest(models.map((model) => model.previewsUpdate$))
    //         .pipe(debounceTime(220))
    //         .subscribe(([...allSuccesses]) => {
    //             const newPreviews = this._successes = allSuccesses.flat();
    //             if (newPreviews.length) {
    //                 this._state.changeState({ previewCompleted: true });
    //             } else {
    //                 this._state.changeState({ previewCompleted: false });
    //             }
    //         });
    //
    //     disposables.add(toDisposable(matchesUpdateSubscription));
    // }
}

/**
 * The preview request object with finding options.
 */
export interface IChartPreviewRequest extends Pick<
    IChartPreviewState,
    | 'type'
> { }

export interface IChartPreviewProvider {
    preview(request: IChartPreviewRequest): Promise<PreviewModel[]>;
    terminate(): void;
}

function shouldStateUpdateTriggerPreview(statusUpdate: Partial<IChartPreviewState>): boolean {
    if (typeof statusUpdate.type !== 'undefined') return true;
    return false;
}

export interface IChartPreviewComplete<T extends IChartPreviewSuccess = IChartPreviewSuccess> {
    results: T[];
}

export interface IChartPreviewSuccess<T = unknown> {
    provider: string;
    unitId: string;
    subUnitId: string;
    range: T;
}
