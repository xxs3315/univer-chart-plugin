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

import type { IDisposable } from '@univerjs/core';
import { createIdentifier } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type { IDialogPlusPartMethodOptions } from '../../components/dialog-part-plus/interface';

export const IDialogPlusService = createIdentifier<IDialogPlusService>('sheet.chart.dialog-plus-service');
export interface IDialogPlusService {
    open(params: IDialogPlusPartMethodOptions): IDisposable;
    close(id: string): void;
    getDialogs$(): Observable<IDialogPlusPartMethodOptions[]>;
    getZIndex(zIndex?: number): number;
    getLatestMaxZIndex(): number;
}
