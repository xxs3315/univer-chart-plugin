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
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IChart } from '../../models/types.ts';
import { ChartMenuController } from '../../controllers/chart.menu.controller.ts';
import styles from './index.module.less';
import { ChartSideEdit } from './chart-side-edit';
import { ChartSideList } from './chart-side-list';

interface IChartSidePanelProps {
    conf?: IChart;
}

export const ChartSidePanel = (props: IChartSidePanelProps) => {
    const chartMenuController = useDependency(ChartMenuController);
    const { conf } = props;
    const [currentEditConf, currentEditConfSet] = useState<IChart | undefined>(conf);
    const [isShowChartEditor, isShowChartEditorSet] = useState(!!conf);

    const createChart = (chart?: IChart) => {
        currentEditConfSet(chart);
        isShowChartEditorSet(true);
        chartMenuController.openPreviewChartDialog(chart);
    };

    const handleCancel = () => {
        isShowChartEditorSet(false);
        currentEditConfSet(undefined);
        // 关闭 chart preview
        chartMenuController.closeChartDialog();
    };

    const handleChartClick = (chart: IChart) => {
        currentEditConfSet(chart);
        isShowChartEditorSet(true);
        // 进入编辑模式，关闭chart 转而打开 chart preview
        // 先关闭 chart
        chartMenuController.closeChartDialog(chart);
        // 打开preview
        chartMenuController.openPreviewChartDialog(chart);
    };

    useEffect(() => {
        // 当是编辑面板时，同时打开chart preview dialog
        if (isShowChartEditor) chartMenuController.openPreviewChartDialog(conf);
    }, [isShowChartEditor]);

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
