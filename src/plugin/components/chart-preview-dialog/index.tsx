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

import React, { forwardRef, useMemo } from 'react';
import { useObservable } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { isNullCell, IUniverInstanceService, LocaleService, UniverInstanceType, type Workbook } from '@univerjs/core';
import { SelectionManagerService } from '@univerjs/sheets';
import { IChartPreviewService } from '../../services/chart-preview.service.ts';
import styles from './index.module.less';
import { ReactECharts } from './react-echarts.tsx';

export const ChartPreviewDialog = forwardRef(function ChartPreviewDialogImpl(_props, ref) {
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const chartPreviewService = useDependency(IChartPreviewService);
    const selectionManagerService = useDependency(SelectionManagerService);
    const state = useObservable(chartPreviewService.state$, undefined, true);
    const { type, range, title } = state;

    const xAxis = useMemo(() => {
        let rangeResult = range;
        if (!rangeResult?.length && selectionManagerService.getSelectionRanges() && selectionManagerService.getSelectionRanges()!.length > 0) {
            rangeResult = selectionManagerService.getSelectionRanges()!;
        }
        let initXAxis = [];
        let nextXAxis = [];
        if (rangeResult && rangeResult.length > 0) {
            const { startRow, startColumn, endColumn, endRow } = rangeResult[0]; // 多选区的情况下默认取第一个

            initXAxis = Array.from({ length: endColumn - startColumn + 1 - 1 }, (_, index) => `未命名${index}`);
            const cellMatrix = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);

            nextXAxis = initXAxis.map((item: any, index: number) => {
                return cellMatrix.getArrayData()[0][index + 1] && !isNullCell(cellMatrix.getArrayData()[0][index + 1]) ? cellMatrix.getArrayData()[0][index + 1].v : item;
            });
            return nextXAxis;
        }
    }, [range, selectionManagerService, univerInstanceService]);

    const seriesName = useMemo(() => {
        let rangeResult = range;
        if (!rangeResult?.length && selectionManagerService.getSelectionRanges() && selectionManagerService.getSelectionRanges()!.length > 0) {
            rangeResult = selectionManagerService.getSelectionRanges()!;
        }
        let initSeriesName = [];
        let nextSeriesName = [];
        if (rangeResult && rangeResult.length > 0) {
            const { startRow, startColumn, endColumn, endRow } = rangeResult[0]; // 多选区的情况下默认取第一个

            initSeriesName = Array.from({ length: endRow - startRow + 1 - 1 }, (_, index) => `未命名${index}`);
            const cellMatrix = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);

            nextSeriesName = initSeriesName.map((item: any, index: number) => {
                return cellMatrix.getArrayData()[index + 1][0] && !isNullCell(cellMatrix.getArrayData()[index + 1][0]) ? cellMatrix.getArrayData()[index + 1][0].v : item;
            });

            return nextSeriesName;
        }
    }, [range, selectionManagerService, univerInstanceService]);

    const vs = useMemo(() => {
        let rangeResult = range;
        if (!rangeResult?.length && selectionManagerService.getSelectionRanges() && selectionManagerService.getSelectionRanges()!.length > 0) {
            rangeResult = selectionManagerService.getSelectionRanges()!;
        }
        let initData = [];
        let nextData: any[][] = [];
        if (rangeResult && rangeResult.length > 0) {
            const { startRow, startColumn, endColumn, endRow } = rangeResult[0]; // 多选区的情况下默认取第一个

            initData = Array.from({ length: endRow - startRow + 1 - 1 }, () => new Array(endColumn - startColumn + 1 - 1).fill(undefined));
            const cellMatrix = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);

            nextData = initData.map((row: any, rowIndex: number) => {
                return row.map((cell: any, colIndex: number) => {
                    return cellMatrix.getArrayData()[rowIndex + 1][colIndex + 1] && !isNullCell(cellMatrix.getArrayData()[rowIndex + 1][colIndex + 1]) ? cellMatrix.getArrayData()[rowIndex + 1][colIndex + 1].v : cell;
                });
            });

            const nextVs = nextData.map((_: any, index: number) => {
                return {
                    name: seriesName?.[index],
                    type: 'line',
                    // areaStyle: {},
                    data: nextData[index],
                };
            });

            return nextVs;
        }
    }, [range, selectionManagerService, univerInstanceService]);

    // useEffect(() => {
    //     console.log(type);
    // }, [type]);
    //
    // useEffect(() => {
    //     console.log(xAxis, seriesName, vs);
    // }, [xAxis, seriesName, vs]);

    const option: any = useMemo(() => {
        return {
            title: {
                left: 'center',
                text: title,
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
    }, [xAxis, seriesName, vs, title]);

    return (
        <div className={styles.uiPluginChartDialog}>
            <ReactECharts option={option} settings={{ notMerge: true }} />
        </div>
    );
});
