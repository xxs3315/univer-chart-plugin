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

import { useObservable } from '@univerjs/ui';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import type { Workbook } from '@univerjs/core';
import { isNullCell, IUniverInstanceService, Tools, UniverInstanceType } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { SelectionManagerService } from '@univerjs/sheets';
import { ReactECharts } from '../common/react-echarts';
import type { IChart } from '../../models/types';
import { ChartConfModel } from '../../models/chart-conf-model';
import { IChartPreviewService } from '../../services/chart-preview.service';
import { ChartType } from '../../types/enum/chart-types';
import { transferArray } from '../../utils/utils.ts';
import {
    BAR_COLUMN_CONFS_GRID, BAR_COLUMN_CONFS_SERIE,
    BAR_DEFAULT_CONFS_GRID, BAR_DEFAULT_CONFS_SERIE,
    LINE_AREA_CONFS_GRID,
    LINE_AREA_CONFS_SERIE,
    LINE_DEFAULT_CONFS_GRID,
    LINE_DEFAULT_CONFS_SERIE,
} from './confs';

interface IChartDialogProps {
    chart: IChart;
}

export const ChartDialog = forwardRef(function ChartDialogImpl(props: IChartDialogProps, _ref) {
    const { chart } = props;
    const chartConfModel = useDependency(ChartConfModel);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManagerService = useDependency(SelectionManagerService);
    const [fetchChartConfRedraw, fetchChartConfRedrawSet] = useState(0);
    const chartPreviewService = useDependency(IChartPreviewService);
    const state = useObservable(chartPreviewService.state$, undefined, true);
    const { chartId, ranges, conf } = state;
    const [chartChange, chartChangeSet] = useState(chart);

    const getChartGridConf = useCallback(() => {
        const subType = chartId === chartChange.chartId ? conf.subType : chart.conf.subType;
        if (subType === ChartType.LINE_DEFAULT) {
            return LINE_DEFAULT_CONFS_GRID;
        }
        if (subType === ChartType.LINE_AREA) {
            return LINE_AREA_CONFS_GRID;
        }
        if (subType === ChartType.BAR_DEFAULT) {
            return BAR_DEFAULT_CONFS_GRID;
        }
        if (subType === ChartType.BAR_COLUMN) {
            return BAR_COLUMN_CONFS_GRID;
        }
        return LINE_DEFAULT_CONFS_GRID;
    }, [state]);
    const [gridConf, gridConfSet] = useState(getChartGridConf());

    const getChartSerieConf = useCallback(() => {
        const subType = chartId === chartChange.chartId ? conf.subType : chart.conf.subType;
        if (subType === ChartType.LINE_DEFAULT) {
            return LINE_DEFAULT_CONFS_SERIE;
        }
        if (subType === ChartType.LINE_AREA) {
            return LINE_AREA_CONFS_SERIE;
        }
        if (subType === ChartType.BAR_DEFAULT) {
            return BAR_DEFAULT_CONFS_SERIE;
        }
        if (subType === ChartType.BAR_COLUMN) {
            return BAR_COLUMN_CONFS_SERIE;
        }
        return LINE_DEFAULT_CONFS_SERIE;
    }, [state]);
    const [serieConf, serieConfSet] = useState(getChartSerieConf());

    const [xAxis, seriesName, vs, title] = useMemo(() => {
        let rangeResult = chartId === chartChange.chartId ? ranges : chartChange.ranges;
        if (!rangeResult?.length && selectionManagerService.getSelectionRanges() && selectionManagerService.getSelectionRanges()!.length > 0) {
            rangeResult = selectionManagerService.getSelectionRanges()!;
        }
        const reverseAxis = chartId === chartChange.chartId ? conf.reverseAxis : chartChange.conf.reverseAxis;
        let initXAxis: any[] = [];
        let nextXAxis: any[] = [];
        let initSeriesName: any[] = [];
        let nextSeriesName: any[] = [];
        let initData: any[][] = [];
        let nextData: any[][] = [];
        if (rangeResult && rangeResult.length > 0) {
            const { startRow, startColumn, endColumn, endRow } = rangeResult[0]; // 多选区的情况下默认取第一个
            const cellMatrix = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);
            let nextVs: any[] = [];
            if (reverseAxis) {
                initSeriesName = Array.from({ length: endColumn - startColumn + 1 - 1 }, (_, index) => `未命名${index}`);
                if (startColumn !== endColumn) {
                    nextSeriesName = initSeriesName.map((item: any, index: number) => {
                        return cellMatrix.getArrayData()[0] && cellMatrix.getArrayData()[0][index + 1] && !isNullCell(cellMatrix.getArrayData()[0][index + 1]) ? cellMatrix.getArrayData()[0][index + 1].v : item;
                    });
                }
                initXAxis = Array.from({ length: endRow - startRow + 1 - 1 }, (_, index) => `未命名${index}`);
                if (startRow !== endRow) {
                    nextXAxis = initXAxis.map((item: any, index: number) => {
                        return cellMatrix.getArrayData()[index + 1] && cellMatrix.getArrayData()[index + 1][0] && !isNullCell(cellMatrix.getArrayData()[index + 1][0]) ? cellMatrix.getArrayData()[index + 1][0].v : item;
                    });
                }

                initData = Array.from({ length: endRow - startRow + 1 - 1 }, () => new Array(endColumn - startColumn + 1 - 1).fill(undefined));
                if (startColumn !== endColumn && startRow !== endRow) {
                    nextData = transferArray(initData.map((row: any, rowIndex: number) => {
                        return row.map((cell: any, colIndex: number) => {
                            return cellMatrix.getArrayData()[rowIndex + 1] && cellMatrix.getArrayData()[rowIndex + 1][colIndex + 1] && !isNullCell(cellMatrix.getArrayData()[rowIndex + 1][colIndex + 1]) ? cellMatrix.getArrayData()[rowIndex + 1][colIndex + 1].v : cell;
                        });
                    }));
                }

                nextVs = nextData.map((_: any, index: number) => {
                    return Tools.deepMerge({
                        name: nextSeriesName?.[index],
                        data: nextData[index],
                    }, serieConf);
                });
            } else {
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

                nextVs = nextData.map((_: any, index: number) => {
                    return Tools.deepMerge({
                        name: nextSeriesName?.[index],
                        data: nextData[index],
                    }, serieConf);
                });
            }

            const title = chartId === chartChange.chartId ? conf.title : chartChange.conf.title;

            return [nextXAxis, nextSeriesName, nextVs, title] as any[];
        }
        return [[], [], [], ''];
    }, [chart, fetchChartConfRedraw, selectionManagerService, univerInstanceService, state, serieConf]);

    useEffect(() => {
        gridConfSet(getChartGridConf());
        serieConfSet(getChartSerieConf());
    }, [chart, fetchChartConfRedraw, state]);

    useEffect(() => {
        const dispose = chartConfModel.$chartConfChange.subscribe(() => {
            const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
            const subUnitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!.getSheetId();
            const c = chartConfModel.getChartConf(unitId, subUnitId, chartChange.chartId);
            if (c) {
                chartChangeSet(c);
                fetchChartConfRedrawSet(Math.random());
            }
        });
        return () => dispose.unsubscribe();
    });

    const option: any = useMemo(() => {
        const o = Tools.deepMerge({
            title: {
                text: title,
            },
            xAxis: {
                data: xAxis,
            },
            series: vs,
        }, gridConf);
        return o;
    }, [seriesName, vs, xAxis, title, gridConf, serieConf]);

    const themeConf: string = useMemo(() => {
        const theme = (chartId === chartChange.chartId ? conf.theme : chart.conf.theme) || 'default';
        return theme;
    }, [state]);

    return (
        <ReactECharts option={option} settings={{ notMerge: true }} theme={themeConf} />
    );
});
