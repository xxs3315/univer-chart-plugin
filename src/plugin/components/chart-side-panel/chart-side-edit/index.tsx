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
import React, { useEffect, useMemo, useRef } from 'react';
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
import { SHEET_CHART_PLUGIN } from '../../../common/const.ts';
import { IChartPreviewService } from '../../../services/chart-preview.service.ts';
import type { ISetChartCommandParams } from '../../../commands/commands/set-chart.command.ts';
import { SetChartCommand } from '../../../commands/commands/set-chart.command.ts';
import { ChartConfModel } from '../../../models/chart-conf-model.ts';
import type { IAddChartCommandParams } from '../../../commands/commands/add-chart.command.ts';
import { AddChartCommand } from '../../../commands/commands/add-chart.command.ts';
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

    const rangeResult = useRef<IRange[]>(props.chart?.ranges ?? []);

    const rangeString = useMemo(() => {
        let ranges = props.chart?.ranges;
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
    }, [props.chart, selectionManagerService]);

    useEffect(() => {
        // If the child table which  the rule being edited is deleted, exit edit mode
        if (props.chart?.chartId !== undefined) {
            const disposable = commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === RemoveSheetMutation.id) {
                    const params = commandInfo.params as IRemoveSheetMutationParams;
                    if (params.subUnitId === subUnitId && params.unitId === unitId) {
                        props.onCancel();
                    }
                }
                if (commandInfo.id === SetWorksheetActiveOperation.id) {
                    props.onCancel();
                }
            });
            return () => disposable.dispose();
        }
    }, [props.chart?.chartId]);

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

        if (beforeSubmitResult) {
            const result = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().submit)(null, null);
            const ranges = getRanges();
            if (result && ranges.length) {
                const unitId = getUnitId(univerInstanceService);
                const subUnitId = getSubUnitId(univerInstanceService);
                let chart = {} as IChart;
                if (props.chart && props.chart.chartId) {
                    chart = { ...props.chart, ranges, conf: result };
                    commandService.executeCommand(SetChartCommand.id, { unitId, subUnitId, chart } as ISetChartCommandParams);
                    props.onCancel();
                } else {
                    const chartId = chartConfModel.createChartId(unitId, subUnitId);
                    chart = { chartId, ranges, conf: result };
                    commandService.executeCommand(AddChartCommand.id, { unitId, subUnitId, chart } as IAddChartCommandParams);
                    props.onCancel();
                }
            }
        }
    };

    const handleCancel = () => {
        props.onCancel();
    };

    const result = useRef < Parameters<IConfEditorProps['onChange']>>();
    const onConfChange = (config: unknown) => {
        result.current = config as Parameters<IConfEditorProps['onChange']>;
    };

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
                    isSingleChoice={true}
                    id={createInternalEditorID(`${SHEET_CHART_PLUGIN}_rangeSelector`)}
                    onChange={onRangeSelectorChange}
                />
            </div>
            <ChartConf onChange={onConfChange} interceptorManager={interceptorManager} chart={props.chart?.conf as any} />
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
