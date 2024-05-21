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

import { Disposable, IUniverInstanceService, type Nullable, toDisposable, UniverInstanceType } from '@univerjs/core';
import { BehaviorSubject, distinctUntilChanged, filter } from 'rxjs';
import type { IDisposable } from '@wendellhu/redi';
import { ISidebarService } from '@univerjs/ui';

export class ChartPanelService extends Disposable {
    private _open$ = new BehaviorSubject<boolean>(false);
    readonly open$ = this._open$.pipe(distinctUntilChanged());

    get isOpen(): boolean {
        return this._open$.getValue();
    }

    private _closeDisposable: Nullable<IDisposable> = null;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ISidebarService private readonly _sidebarService: ISidebarService
    ) {
        super();

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET)
                .pipe(filter((sheet) => !sheet)).subscribe(() => {
                    this.close();
                })
        );
    }

    override dispose(): void {
        super.dispose();

        this._open$.next(false);
        this._open$.complete();

        this._closeDisposable?.dispose();
    }

    open(): void {
        this._open$.next(true);
    }

    close(): void {
        this._open$.next(false);
        this._closeDisposable?.dispose();
    }

    setCloseDisposable(disposable: IDisposable): void {
        this._closeDisposable = toDisposable(() => {
            disposable.dispose();
            this._closeDisposable = null;
        });
    }
}
