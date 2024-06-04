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

import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import type { Workbook } from '@univerjs/core';
import { isNullCell, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { SelectionManagerService } from '@univerjs/sheets';
import { ReactECharts } from '../common/react-echarts.tsx';
import type { IChart } from '../../models/types.ts';
import { ChartConfModel } from '../../models/chart-conf-model.ts';
import styles from './index.module.less';

interface IChartDialogProps {
    chart: IChart;
}

export const ChartDialog = forwardRef(function ChartDialogImpl(props: IChartDialogProps, _ref) {
    const { chart } = props;
    const chartConfModel = useDependency(ChartConfModel);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManagerService = useDependency(SelectionManagerService);
    const [fetchChartConfRedraw, fetchChartConfRedrawSet] = useState(0);

    const [xAxis, seriesName, vs] = useMemo(() => {
        let rangeResult = chart.ranges;
        if (!rangeResult?.length && selectionManagerService.getSelectionRanges() && selectionManagerService.getSelectionRanges()!.length > 0) {
            rangeResult = selectionManagerService.getSelectionRanges()!;
        }
        let initXAxis: any[] = [];
        let nextXAxis: any[] = [];
        let initSeriesName: any[] = [];
        let nextSeriesName: any[] = [];
        let initData: any[][] = [];
        let nextData: any[][] = [];
        if (rangeResult && rangeResult.length > 0) {
            const { startRow, startColumn, endColumn, endRow } = rangeResult[0]; // 多选区的情况下默认取第一个
            const cellMatrix = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);

            initXAxis = Array.from({ length: endColumn - startColumn + 1 - 1 }, (_, index) => `未命名${index}`);
            if (startColumn !== endColumn) {
                nextXAxis = initXAxis.map((item: any, index: number) => {
                    return cellMatrix.getArrayData()[0] && cellMatrix.getArrayData()[0][index + 1] && !isNullCell(cellMatrix.getArrayData()[0][index + 1]) ? cellMatrix.getArrayData()[0][index + 1].v : item;
                });
            }
            initSeriesName = Array.from({ length: endRow - startRow + 1 - 1 }, (_, index) => `未命名${index}`);
            if (startRow !== endRow) {
                nextSeriesName = initSeriesName.map((item: any, index: number) => {
                    return cellMatrix.getArrayData()[index + 1] && cellMatrix.getArrayData()[index + 1][0] && !isNullCell(cellMatrix.getArrayData()[index + 1][0]) ? cellMatrix.getArrayData()[index + 1][0].v : item;
                });
            }

            initData = Array.from({ length: endRow - startRow + 1 - 1 }, () => new Array(endColumn - startColumn + 1 - 1).fill(undefined));
            if (startColumn !== endColumn && startRow !== endRow) {
                nextData = initData.map((row: any, rowIndex: number) => {
                    return row.map((cell: any, colIndex: number) => {
                        return cellMatrix.getArrayData()[rowIndex + 1] && cellMatrix.getArrayData()[rowIndex + 1][colIndex + 1] && !isNullCell(cellMatrix.getArrayData()[rowIndex + 1][colIndex + 1]) ? cellMatrix.getArrayData()[rowIndex + 1][colIndex + 1].v : cell;
                    });
                });
            }

            const nextVs: any[] = nextData.map((_: any, index: number) => {
                return {
                    name: nextSeriesName?.[index],
                    type: 'line',
                    // areaStyle: {},
                    data: nextData[index],
                };
            });

            return [nextXAxis, nextSeriesName, nextVs] as any[];
        }
        return [[], [], []];
    }, [chart, fetchChartConfRedraw, selectionManagerService, univerInstanceService]);

    useEffect(() => {
        const dispose = chartConfModel.$chartConfChange.subscribe(() => {
            fetchChartConfRedrawSet(Math.random());
        });
        return () => dispose.unsubscribe();
    });

    const option: any = useMemo(() => {
        return {
            title: {
                left: 'center',
                text: chart.conf.title,
            },
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                top: '12%',
                data: seriesName,
            },
            grid: {
                left: '3%',
                right: '3%',
                bottom: '3%',
                containLabel: true,
            },
            /*toolbox: {
                feature: {
                    saveAsImage: {},
                },
            },*/
            xAxis: {
                type: 'category',
                data: xAxis,
            },
            yAxis: {
                type: 'value',
            },
            series: vs,
        };
    }, [chart, seriesName, vs, xAxis]);

    return (
        <div className={styles.uiPluginChartDialog}>
            <ReactECharts option={option} settings={{ notMerge: true }} />
        </div>
    );
});
