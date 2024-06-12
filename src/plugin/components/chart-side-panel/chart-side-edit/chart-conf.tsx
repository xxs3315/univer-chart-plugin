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

import { Input, Select } from '@univerjs/design';
import React, { useEffect, useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { LocaleService } from '@univerjs/core';
import type { IChartConfig } from '../../../models/types.ts';
import styleBase from '../index.module.less';
import { ChartType } from '../../../types/enum/chart-types.ts';
import type { ChartGroupType } from '../../../types/enum/chart-group-types.ts';
import { IChartPreviewService } from '../../../services/chart-preview.service.ts';
import type { IConfEditorProps } from './types.ts';
import styles from './index.module.less';

export const ChartConf = (props: IConfEditorProps<unknown, IChartConfig>) => {
    const chartPreviewService = useDependency(IChartPreviewService);
    const localeService = useDependency(LocaleService);
    const { interceptorManager, chart } = props;

    const [chartConfTitle, chartConfTitleSet] = useState(chart?.title);

    const options = [
        { label: localeService.t('chart.type.lineDefault'), value: 'line-default' },
        { label: localeService.t('chart.type.lineArea'), value: 'line-area' },
        { label: localeService.t('chart.type.barDefault'), value: 'bar-default' },
        { label: localeService.t('chart.type.barColumn'), value: 'bar-column' },
        { label: localeService.t('chart.type.pieDefault'), value: 'pie-default' },
        { label: localeService.t('chart.type.pieDoughnut'), value: 'pie-doughnut' }];

    const [chartType, chartTypeSet] = useState(() => {
        const type = chart?.subType;
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
        let groupType = chart?.type;
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
        chartPreviewService.changeChartType(chartGroupType, chartType);
    }, [chartType, chartGroupType, chartPreviewService, chart?.type]);

    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, { handler() {
            const result: IChartConfig = { type: chartGroupType, subType: chartType, title: chartConfTitle } as IChartConfig;
            return result;
        } });
        return () => {
            dispose();
        };
    }, [chartType, chartGroupType, chartConfTitle, interceptorManager]);

    useEffect(() => {
        chartPreviewService.changeChartConfTitle(chartConfTitle || '');
    }, [chartConfTitle, chartPreviewService]);

    return (
        <>
            <div className={styleBase.title}>{localeService.t('chart.panel.type')}</div>
            <div className={styleBase.mTBase}>
                <Select
                    className={styles.width100}
                    value={chartType}
                    options={options}
                    onChange={(e) => chartTypeSet(e)}
                />
            </div>
            <div className={styleBase.title}>{localeService.t('chart.conf.title')}</div>
            <div className={styleBase.mTBase}>
                <Input
                    className={styles.width100}
                    value={chartConfTitle}
                    onChange={(e) => chartConfTitleSet(e)}
                />
            </div>
        </>
    );
};
