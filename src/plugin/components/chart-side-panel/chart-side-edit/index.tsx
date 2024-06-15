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

import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IRange, IUnitRange, Workbook } from '@univerjs/core';
import { createInternalEditorID, ICommandService, InterceptorManager, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type {
    IRemoveSheetMutationParams } from '@univerjs/sheets';
import { RemoveSheetMutation,
    SelectionManagerService,
    setEndForRange,
    SetWorksheetActiveOperation } from '@univerjs/sheets';
import { serializeRange } from '@univerjs/engine-formula';
import { RangeSelector } from '@univerjs/ui';
import { Button } from '@univerjs/design';
import type { IChart } from '../../../models/types.ts';
import styleBase from '../index.module.less';
import { CHART_PREVIEW_DIALOG_KEY, SHEET_CHART_PLUGIN } from '../../../common/const.ts';
import { IChartPreviewService } from '../../../services/chart-preview.service.ts';
import type { ISetChartCommandParams } from '../../../commands/commands/set-chart.command.ts';
import { SetChartCommand } from '../../../commands/commands/set-chart.command.ts';
import { ChartConfModel } from '../../../models/chart-conf-model.ts';
import type { IAddChartCommandParams } from '../../../commands/commands/add-chart.command.ts';
import { AddChartCommand } from '../../../commands/commands/add-chart.command.ts';
import { ChartMenuController } from '../../../controllers/chart.menu.controller.ts';
import { DeleteChartCommand, type IDeleteChartCommandParams } from '../../../commands/commands/delete-chart.command.ts';
import styles from './index.module.less';
import type { IConfEditorProps } from './types.ts';
import { beforeSubmit, submit } from './types.ts';
import { ChartConf } from './chart-conf.tsx';

const getUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId();

interface IChartEditProps {
    chart?: IChart;
    onCancel: () => void;
}

export const ChartSideEdit = (props: IChartEditProps) => {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManagerService = useDependency(SelectionManagerService);
    const chartPreviewService = useDependency(IChartPreviewService);
    const chartConfModel = useDependency(ChartConfModel);
    const unitId = getUnitId(univerInstanceService);
    const subUnitId = getSubUnitId(univerInstanceService);
    const { chart, onCancel } = props;
    const rangeResult = useRef<IRange[]>(chart?.ranges ?? []);
    const chartMenuController = useDependency(ChartMenuController);

    const rangeString = useMemo(() => {
        let ranges = chart?.ranges;
        if (!ranges?.length) {
            ranges = selectionManagerService.getSelectionRanges() ?? [];
        }
        rangeResult.current = ranges;
        if (!ranges?.length) {
            return '';
        }
        return ranges.map((range) => {
            const v = serializeRange(range);
            return v === 'NaN' ? '' : v;
        }).filter((r) => !!r).join(',');
    }, [chart, selectionManagerService]);

    useLayoutEffect(() => {
        let ranges = chart?.ranges;
        if (!ranges?.length) {
            ranges = selectionManagerService.getSelectionRanges() ?? [];
        }
        rangeResult.current = ranges;
        if (ranges?.length) {
            chartPreviewService.changeRange(ranges || []);
        }
    }, []);

    useEffect(() => {
        // If the child table which  the rule being edited is deleted, exit edit mode
        if (chart?.chartId !== undefined) {
            const disposable = commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === RemoveSheetMutation.id) {
                    const params = commandInfo.params as IRemoveSheetMutationParams;
                    if (params.subUnitId === subUnitId && params.unitId === unitId) {
                        onCancel();
                    }
                }
                if (commandInfo.id === SetWorksheetActiveOperation.id) {
                    onCancel();
                }
            });
            return () => disposable.dispose();
        }
    }, [chart?.chartId]);

    const onRangeSelectorChange = (ranges: IUnitRange[]) => {
        rangeResult.current = ranges.map((r) => r.range);
        chartPreviewService.changeRange(rangeResult.current);
    };

    const interceptorManager = useMemo(() => {
        const _interceptorManager = new InterceptorManager({ beforeSubmit, submit });
        return _interceptorManager;
    }, []);

    const handleSubmit = () => {
        const beforeSubmitResult = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().beforeSubmit)(true, null);
        const getRanges = () => {
            const worksheet = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
            const ranges = rangeResult.current.map((range) => setEndForRange(range, worksheet.getRowCount(), worksheet.getColumnCount()));
            const result = ranges.filter((range) => !(Number.isNaN(range.startRow) || Number.isNaN(range.startColumn)));
            return result;
        };
        // 提交时，将当前preview state中的chartId 置空, 不再响应state
        chartPreviewService.changeChartId('');
        if (beforeSubmitResult) {
            const result = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().submit)(null, null);
            const ranges = getRanges();
            if (result && ranges.length) {
                const unitId = getUnitId(univerInstanceService);
                const subUnitId = getSubUnitId(univerInstanceService);
                let c = {} as IChart;
                if (chart && chart.chartId && chart.chartId !== CHART_PREVIEW_DIALOG_KEY) {
                    c = { ...chart, ranges, conf: result };
                    commandService.executeCommand(SetChartCommand.id, { unitId, subUnitId, chart: c } as ISetChartCommandParams);
                    onCancel();
                } else {
                    // 维护chart conf model, 去掉preview chart conf 因model中删除之后再无sheet.chart.preview.dialog为key的记录,所以这里先关闭预览
                    chartMenuController.closeChartDialog(chart);
                    const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
                    const subUnitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId();
                    commandService.syncExecuteCommand(DeleteChartCommand.id, { unitId, subUnitId, chartIds: [CHART_PREVIEW_DIALOG_KEY] } as IDeleteChartCommandParams);

                    const chartId = chartConfModel.createChartId(unitId, subUnitId);
                    c = { chartId, ranges, conf: result };
                    commandService.executeCommand(AddChartCommand.id, { unitId, subUnitId, chart: c } as IAddChartCommandParams);
                    onCancel();
                }
            }
        }
    };

    const handleCancel = () => {
        // 取消编辑时，将chart conf model中的preview conf delete掉
        if (chart && chart.chartId === CHART_PREVIEW_DIALOG_KEY) {
            // 关闭对应的preview chart
            chartMenuController.closeChartDialog(chart);
            const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
            const subUnitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId();
            commandService.syncExecuteCommand(DeleteChartCommand.id, { unitId, subUnitId, chartIds: [chart.chartId] } as IDeleteChartCommandParams);
        }
        // 取消时，将当前preview state中的chartId 置空, 不再响应state
        chartPreviewService.changeChartId('');
        onCancel();
    };

    const result = useRef < Parameters<IConfEditorProps['onChange']>>();
    const onConfChange = (config: unknown) => {
        result.current = config as Parameters<IConfEditorProps['onChange']>;
    };

    // 编辑面板打开时，向chart conf model中加入一个preview dialog的conf
    useLayoutEffect(() => {
        // console.log(chart)
        const unitId = getUnitId(univerInstanceService);
        const subUnitId = getSubUnitId(univerInstanceService);
        commandService.syncExecuteCommand(AddChartCommand.id, { unitId, subUnitId, chart } as IAddChartCommandParams);
        // 将当前chart属性设置进 preview state
        if (chart) {
            chartPreviewService.changeChartId(chart.chartId);
            chartPreviewService.changeChartType(chart.conf.type, chart.conf.subType);
            chartPreviewService.changeRange(chart.ranges);
            chartPreviewService.changeChartConfTitle(chart.conf.title);
        }
    }, []);

    return (
        <div className={styles.chartSideEditor}>
            <div className={styleBase.title}>{localeService.t('chart.panel.range')}</div>
            <div className={`${styleBase.mTBase}`}>
                <RangeSelector
                    placeholder={localeService.t('chart.form.rangeSelector')}
                    width={'100%' as unknown as number}
                    openForSheetSubUnitId={subUnitId}
                    openForSheetUnitId={unitId}
                    value={rangeString}
                    isSingleChoice
                    id={createInternalEditorID(`${SHEET_CHART_PLUGIN}_rangeSelector`)}
                    onChange={onRangeSelectorChange}
                />
            </div>
            <ChartConf onChange={onConfChange} interceptorManager={interceptorManager} chart={chart?.conf as any} chartId={chart && chart.chartId ? chart.chartId : CHART_PREVIEW_DIALOG_KEY} />
            <div className={`${styleBase.mTBase} ${styles.btnList}`}>
                <Button size="small" onClick={handleCancel}>{localeService.t('chart.panel.cancel')}</Button>
                <Button
                    className={styleBase.mLSm}
                    size="small"
                    type="primary"
                    onClick={handleSubmit}
                >
                    {localeService.t('chart.panel.submit')}
                </Button>
            </div>
        </div>
    );
};
