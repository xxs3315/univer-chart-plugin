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

import { Checkbox, Input, Select } from '@univerjs/design';
import React, { useEffect, useState } from 'react';
import { LocaleService, useDependency } from '@univerjs/core';
import type { IChartConfig } from '../../../models/types';
import { ChartType } from '../../../types/enum/chart-types';
import type { ChartGroupType } from '../../../types/enum/chart-group-types';
import { IChartPreviewService } from '../../../services/chart-preview.service';
import styles from '../../../styles/index.module.less';
import { ChartThemeType } from '../../../types/enum/chart-theme-types.ts';
import { getTheme } from '../../common/utils.ts';
import type { IConfEditorProps } from './types';

export const ChartConf = (props: IConfEditorProps<unknown, IChartConfig>) => {
    const chartPreviewService = useDependency(IChartPreviewService);
    const localeService = useDependency(LocaleService);
    const { interceptorManager, chart } = props;

    const [chartConfTitle, chartConfTitleSet] = useState(chart?.title);
    const [chartConfReverseAxis, chartConfReverseAxisSet] = useState(chart?.reverseAxis);

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

    const getThemeOptions = (themeName: string) => {
        const theme = getTheme(themeName);
        return (
            <>
                <div style={{ background: theme.backgroundColor }}>
                    {/*<span className={styles.themePlanTitle}>{`${localeService.t(`chart.theme.${themeName}`)}: `}</span>*/}
                    {theme.color.map((color: string, index: number) => {
                        return (
                            <div key={index} className={styles.themePlanColor} style={{ background: color }}></div>
                        );
                    }
                    )}
                </div>
            </>
        );
    };

    const themeOptions = [
        { label: getThemeOptions('default'), value: 'default' },
        { label: getThemeOptions('vintage'), value: 'vintage' },
        { label: getThemeOptions('dark'), value: 'dark' },
        { label: getThemeOptions('westeros'), value: 'westeros' },
        { label: getThemeOptions('essos'), value: 'essos' },
        { label: getThemeOptions('wonderland'), value: 'wonderland' },
        { label: getThemeOptions('walden'), value: 'walden' },
        { label: getThemeOptions('chalk'), value: 'chalk' },
        { label: getThemeOptions('infographic'), value: 'infographic' },
        { label: getThemeOptions('macarons'), value: 'macarons' },
        { label: getThemeOptions('roma'), value: 'roma' },
        { label: getThemeOptions('shine'), value: 'shine' },
        { label: getThemeOptions('purple-passion'), value: 'purple-passion' },
        { label: getThemeOptions('halloween'), value: 'halloween' },
    ];

    const [chartConfTheme, chartConfThemeSet] = useState(() => {
        let theme = chart?.theme || themeOptions[0].value;
        if (Object.values(ChartThemeType).indexOf(theme as ChartThemeType) < 0) {
            theme = themeOptions[0].value;
        }
        switch (theme) {
            case ChartThemeType.DEFAULT:{
                theme = 'default';
                break;
            }
            case ChartThemeType.VINTAGE:{
                theme = 'vintage';
                break;
            }
            case ChartThemeType.DARK:{
                theme = 'dark';
                break;
            }
            case ChartThemeType.WESTEROS:{
                theme = 'westeros';
                break;
            }
            case ChartThemeType.ESSOS:{
                theme = 'essos';
                break;
            }
            case ChartThemeType.WONDERLAND:{
                theme = 'wonderland';
                break;
            }
            case ChartThemeType.WALDEN:{
                theme = 'walden';
                break;
            }
            case ChartThemeType.CHALK:{
                theme = 'chalk';
                break;
            }
            case ChartThemeType.INFOGRAPHIC:{
                theme = 'infographic';
                break;
            }
            case ChartThemeType.MACARONS:{
                theme = 'macarons';
                break;
            }
            case ChartThemeType.ROMA:{
                theme = 'roma';
                break;
            }
            case ChartThemeType.SHINE:{
                theme = 'shine';
                break;
            }
            case ChartThemeType.PURPLE_PASSION:{
                theme = 'purple-passion';
                break;
            }
            case ChartThemeType.HALLOWEEN:{
                theme = 'halloween';
                break;
            }
        }
        return theme;
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
            const result: IChartConfig = { type: chartGroupType, subType: chartType, title: chartConfTitle, theme: chartConfTheme, reverseAxis: chartConfReverseAxis } as IChartConfig;
            return result;
        } });
        return () => {
            dispose();
        };
    }, [chartType, chartGroupType, chartConfTitle, chartConfTheme, chartConfReverseAxis, interceptorManager]);

    useEffect(() => {
        chartPreviewService.changeChartConfTitle(chartConfTitle || '');
    }, [chartConfTitle, chartPreviewService]);

    useEffect(() => {
        chartPreviewService.changeChartConfTheme(chartConfTheme);
    }, [chartConfTheme, chartPreviewService]);

    useEffect(() => {
        chartPreviewService.changeChartConfReverseAxis(!!chartConfReverseAxis);
    }, [chartConfReverseAxis, chartPreviewService]);

    return (
        <>
            <div className={styles.title}>{localeService.t('chart.panel.type')}</div>
            <div className={styles.mTBase}>
                <Select
                    className={styles.width100}
                    value={chartType}
                    options={options}
                    onChange={(e) => chartTypeSet(e)}
                />
            </div>
            <div className={styles.title}>{localeService.t('chart.conf.theme')}</div>
            <div className={styles.mTBase}>
                <Select
                    className={styles.width100}
                    value={chartConfTheme}
                    options={themeOptions}
                    onChange={(e) => chartConfThemeSet(e)}
                />
            </div>
            <div className={styles.title}>{localeService.t('chart.conf.title')}</div>
            <div className={styles.mTBase}>
                <Input
                    className={styles.width100}
                    value={chartConfTitle}
                    onChange={(e) => chartConfTitleSet(e)}
                />
            </div>
            <div className={styles.title}>
                {localeService.t('chart.conf.reverseAxis')}
            </div>
            <div className={styles.mTBase}>
                <Checkbox
                    className={styles.width100}
                    checked={chartConfReverseAxis}
                    onChange={(e) => chartConfReverseAxisSet(e as boolean)}
                />
            </div>
        </>
    );
};
