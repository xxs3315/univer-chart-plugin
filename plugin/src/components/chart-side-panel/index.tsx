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

import React, { useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IChart } from '../../models/types';
import { IChartPreviewService } from '../../services/chart-preview.service';
import styles from './index.module.less';
import { ChartSideEdit } from './chart-side-edit';
import { ChartSideList } from './chart-side-list';

interface IChartSidePanelProps {
    conf?: IChart;
    showChartEditor?: boolean;
}

export const ChartSidePanel = (props: IChartSidePanelProps) => {
    const chartPreviewService = useDependency(IChartPreviewService);
    const { conf, showChartEditor } = props;
    const [currentEditConf, currentEditConfSet] = useState<IChart | undefined>(conf);
    const [isShowChartEditor, isShowChartEditorSet] = useState(!!showChartEditor);

    const createChart = (chart?: IChart) => {
        currentEditConfSet(chart);
        isShowChartEditorSet(true);
    };

    const handleCancel = () => {
        isShowChartEditorSet(false);
        currentEditConfSet(undefined);
    };

    const handleChartClick = (chart: IChart) => {
        currentEditConfSet(chart);
        isShowChartEditorSet(true);
        // 将当前chart属性设置进 preview state
        chartPreviewService.changeChartId(chart.chartId);
        chartPreviewService.changeChartType(chart.conf.type, chart.conf.subType);
        chartPreviewService.changeRange(chart.ranges);
        chartPreviewService.changeChartConfTitle(chart.conf.title);
    };

    return (
        <div className={styles.chartSideWrap}>
            {isShowChartEditor
                ? (
                    <ChartSideEdit onCancel={handleCancel} chart={currentEditConf} />
                )
                : (
                    <ChartSideList onClick={handleChartClick} onCreate={createChart} />
                )}
        </div>
    );
};
