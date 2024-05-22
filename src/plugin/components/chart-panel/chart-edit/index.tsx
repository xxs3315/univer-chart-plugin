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
import { createInternalEditorID, ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
    IRemoveSheetMutationParams } from '@univerjs/sheets';
import {
    RemoveSheetMutation,
    SelectionManagerService,
    SetWorksheetActiveOperation,
} from '@univerjs/sheets';
import { serializeRange } from '@univerjs/engine-formula';
import { RangeSelector } from '@univerjs/ui';
import { Select } from '@univerjs/design';
import type { IChart } from '../../../models/types.ts';
import styleBase from '../index.module.less';
import { SHEET_CHART_PLUGIN } from '../../../common/const.ts';
import { ChartType } from '../../../types/enum/chart-types.ts';
import type { ChartGroupType } from '../../../types/enum/chart-group-types.ts';
import styles from './index.module.less';

const getUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId();

interface IChartEditProps {
    chart?: IChart;
    onCancel: () => void;
}

export const ChartEdit = (props: IChartEditProps) => {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManagerService = useDependency(SelectionManagerService);
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
    }, [props.chart]);

    const options = [
        { label: localeService.t('chart.type.lineDefault'), value: 'line-default' },
        { label: localeService.t('chart.type.lineArea'), value: 'line-area' },
        { label: localeService.t('chart.type.barDefault'), value: 'bar-default' },
        { label: localeService.t('chart.type.barColumn'), value: 'bar-column' },
        { label: localeService.t('chart.type.pieDefault'), value: 'pie-default' },
        { label: localeService.t('chart.type.pieDoughnut'), value: 'pie-doughnut' }];

    const [chartType, chartTypeSet] = useState(() => {
        const type = props.chart?.conf.subType;
        const defaultType = options[0].value;
        if (!type) {
            return defaultType;
        }
        switch (type) {
            case ChartType.LINE_DEFAULT:{
                return 'line-default';
            }
            case ChartType.LINE_AREA:{
                return 'line-area';
            }
            case ChartType.BAR_DEFAULT:{
                return 'bar-default';
            }
            case ChartType.BAR_COLUMN:{
                return 'bar-column';
            }
            case ChartType.PIE_DEFAULT:{
                return 'pie-default';
            }
            case ChartType.PIE_DOUGHNUT:{
                return 'pie-doughnut';
            }
        }
        return defaultType;
    });

    const [chartGroupType, chartGroupTypeSet] = useState('line');

    useEffect(() => {
        let groupType = props.chart?.conf.type;
        const defaultGroupType = 'line';
        if (!chartType) {
            groupType = defaultGroupType as ChartGroupType;
        }
        switch (chartType) {
            case ChartType.LINE_DEFAULT:{
                groupType = 'line' as ChartGroupType;
                break;
            }
            case ChartType.LINE_AREA:{
                groupType = 'line' as ChartGroupType;
                break;
            }
            case ChartType.BAR_DEFAULT:{
                groupType = 'bar' as ChartGroupType;
                break;
            }
            case ChartType.BAR_COLUMN:{
                groupType = 'bar' as ChartGroupType;
                break;
            }
            case ChartType.PIE_DEFAULT:{
                groupType = 'pie' as ChartGroupType;
                break;
            }
            case ChartType.PIE_DOUGHNUT:{
                groupType = 'pie' as ChartGroupType;
                break;
            }
        }
        chartGroupTypeSet(groupType as string);
    }, [chartType]);

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
    };

    const handleCancel = () => {
        props.onCancel();
    };

    return (
        <div className={styles.chartEditor}>
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
            <div className={styleBase.title}>{localeService.t('chart.panel.type')}</div>
            <div className={styleBase.mTBase}>
                <Select className={styles.width100} value={chartType} options={options} onChange={(e) => chartTypeSet(e)} />
            </div>
        </div>
    );
};
