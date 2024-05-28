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

import type { InterceptorManager } from '@univerjs/core';
import { createInterceptorKey } from '@univerjs/core';
import type { IChartConfig } from '../../../models/types.ts';

export const beforeSubmit = createInterceptorKey<boolean, null>('beforeSubmit');
export const submit = createInterceptorKey<any, null>('submit');

export interface IConfEditorProps<S = any, R = IChartConfig> {
    onChange: (conf: S) => void;
    chart?: R;
    interceptorManager: InterceptorManager<{ beforeSubmit: typeof beforeSubmit; submit: typeof submit }>;
};
