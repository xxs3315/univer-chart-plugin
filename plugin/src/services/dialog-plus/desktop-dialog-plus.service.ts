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

import { Disposable, type IDisposable, Inject, Injector, IUniverInstanceService, toDisposable, UniverInstanceType, type Workbook } from '@univerjs/core';
import { Subject } from 'rxjs';

import { connectInjector } from '@univerjs/core';
import { BuiltInUIPart, IUIPartsService } from '@univerjs/ui';
import type { IDialogPlusPartMethodOptions } from '../../components/dialog-part-plus/interface';
import { DialogPartPlus } from '../../components/dialog-part-plus';
import { ChartConfModel } from '../../models/chart-conf-model';
import type { IDialogPlusService } from './dialog-plus.service';

export const DESKTOP_DIALOG_PLUS_BASE_Z_INDEX = 200;
export const DESKTOP_DIALOG_PLUS_MAX_Z_INDEX = 600;
const getUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!.getSheetId();

export class DesktopDialogPlusService extends Disposable implements IDialogPlusService {
    protected _dialogOptions: IDialogPlusPartMethodOptions[] = [];
    protected readonly _dialogOptions$ = new Subject<IDialogPlusPartMethodOptions[]>();

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @Inject(ChartConfModel) private _chartConfModel: ChartConfModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initUIPart();
    }

    override dispose(): void {
        super.dispose();
        this._dialogOptions$.complete();
    }

    getZIndex(zIndex?: number) {
        if (zIndex) {
            return DESKTOP_DIALOG_PLUS_BASE_Z_INDEX + zIndex;
        }
        return DESKTOP_DIALOG_PLUS_BASE_Z_INDEX + this.getLatestMaxZIndex() + 1;
    }

    getLatestMaxZIndex() {
        const latestMaxZIndex = this._chartConfModel.getLatestMaxZIndex(getUnitId(this._univerInstanceService));
        if (latestMaxZIndex >= DESKTOP_DIALOG_PLUS_MAX_Z_INDEX - DESKTOP_DIALOG_PLUS_BASE_Z_INDEX - 1) {
            this._chartConfModel.reArrangeChartZIndex(getUnitId(this._univerInstanceService), getSubUnitId(this._univerInstanceService));
            return this._chartConfModel.getLatestMaxZIndex(getUnitId(this._univerInstanceService));
        }
        return latestMaxZIndex;
    }

    open(option: IDialogPlusPartMethodOptions): IDisposable {
        if (this._dialogOptions.find((item) => item.id === option.id)) {
            this._dialogOptions = this._dialogOptions.map((item) => ({
                ...(item.id === option.id ? option : item),
                visible: item.id === option.id ? true : item.visible,
            }));
        } else {
            this._dialogOptions.push({
                ...option,
                visible: true,
            });
        }

        this._dialogOptions$.next(this._dialogOptions);

        return toDisposable(() => {
            this._dialogOptions = [];
            this._dialogOptions$.next([]);
        });
    }

    close(id: string) {
        this._dialogOptions = this._dialogOptions.map((item) => ({
            ...item,
            visible: item.id === id ? false : item.visible,
        }));

        this._dialogOptions$.next([...this._dialogOptions]);
    }

    getDialogs$() {
        return this._dialogOptions$.asObservable();
    }

    protected _initUIPart(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(DialogPartPlus, this._injector))
        );
    }
}
