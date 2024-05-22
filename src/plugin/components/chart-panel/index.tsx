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

import React from 'react';
import type { IChart } from '../../models/types.ts';
import styles from './index.module.less';
import { ChartEdit } from './chart-edit';

interface IChartPanelProps {
    conf?: IChart;
}

export const ChartPanel = (props: IChartPanelProps) => {
    const handleCancel = () => {
    };

    return (
        <div className={styles.chartWrap}>
            {/* eslint-disable-next-line react/prefer-destructuring-assignment */}
            <ChartEdit onCancel={handleCancel} chart={props.conf} />
        </div>
    );
};
