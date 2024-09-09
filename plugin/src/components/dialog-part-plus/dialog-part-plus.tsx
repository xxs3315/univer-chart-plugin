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

import React, { useEffect, useState } from 'react';

import { CustomLabel } from '@univerjs/ui';
import { useDependency } from '@univerjs/core';
import { IDialogPlusService } from '../../services/dialog-plus/dialog-plus.service';
import type { IDialogPlusProps } from '../dialog-plus';
import { DialogPlus } from '../dialog-plus';
import type { IDialogPlusPartMethodOptions } from './interface';

export function DialogPartPlus() {
    const dialogPlusService = useDependency(IDialogPlusService);

    const [dialogPlusOptions, setDialogPlusOptions] = useState<IDialogPlusPartMethodOptions[]>([]);

    useEffect(() => {
        const dialog$ = dialogPlusService.getDialogs$();
        const subscription = dialog$.subscribe((options: IDialogPlusPartMethodOptions[]) => {
            setDialogPlusOptions(options);
        });

        return () => subscription.unsubscribe();
    }, [dialogPlusService]);

    const attrs = dialogPlusOptions.map((options) => {
        const { children, title, closeIcon, footer, ...restProps } = options;

        const dialogProps = restProps as IDialogPlusProps & { id: string };
        for (const key of ['children', 'title', 'closeIcon', 'footer']) {
            const k = key as keyof IDialogPlusPartMethodOptions;
            const props = options[k] as any;

            if (props) {
                (dialogProps as any)[k] = <CustomLabel {...props} />;
            }
        }

        return dialogProps;
    });

    return <>{attrs?.map((options) => <DialogPlus key={options.id} {...options} />)}</>;
}
