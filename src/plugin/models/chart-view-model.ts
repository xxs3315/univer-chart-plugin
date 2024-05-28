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

import { ObjectMatrix } from '@univerjs/core';
import { Subject } from 'rxjs';
import type { IChart } from './types.ts';

interface ICellItem {
    chartConfList: { chartId: string; isDirty: boolean }[];
}

export class ChartViewModel {
    private _model: Map<string, Map<string, ObjectMatrix<ICellItem>>> = new Map();

    private _markDirty$ = new Subject<{ chart: IChart; unitId: string; subUnitId: string }>();
    public markDirty$ = this._markDirty$.asObservable();

    private _ensureMatrix(unitId: string, subUnitId: string) {
        let _matrix = this.getMatrix(unitId, subUnitId);
        if (!_matrix) {
            _matrix = new ObjectMatrix<ICellItem>();
            let unitModel = this._model.get(unitId);
            if (!unitModel) {
                unitModel = new Map<string, ObjectMatrix<ICellItem>>();
                this._model.set(unitId, unitModel);
            }
            unitModel.set(subUnitId, _matrix);
        }
        return _matrix;
    }

    public getMatrix(unitId: string, subUnitId: string) {
        return this._model.get(unitId)?.get(subUnitId);
    }

    public markRuleDirty(
        unitId: string,
        subUnitId: string,
        chart: IChart
    ) {
        this._markDirty$.next({ chart, unitId, subUnitId });
    }
}
