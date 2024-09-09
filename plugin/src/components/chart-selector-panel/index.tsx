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

import { ComponentManager } from '@univerjs/ui';
import React from 'react';
import { LocaleService, useDependency } from '@univerjs/core';
import styles from '../../styles/index.module.less';
import { CHART_SELECTOR_CHILDREN, type IChartInfo, type IChartSelectorPanelProps } from './interface';

export function ChartSelectorPanel(props: IChartSelectorPanelProps) {
    const componentManager = useDependency(ComponentManager);

    const localeService = useDependency(LocaleService);

    const { onChange, value } = props;

    function handleClick(v: string | number, sv: string | number, type: keyof IChartInfo, subType: keyof IChartInfo) {
        onChange?.({
            ...value,
            [type]: v,
            [subType]: sv,
        });
    }

    function renderIcon(icon: string) {
        const Icon = componentManager.get(icon);
        return Icon && <Icon extend={{ colorChannel1: 'rgb(var(--primary-color))' }} />;
    }

    return (
        <section className={styles.uiPluginChartPanel}>
            <div>
                {CHART_SELECTOR_CHILDREN.map((item) => (
                    <div key={item.value}>
                        {localeService.t(item.label)}
                        <div className={styles.uiPluginChartPanelPosition}>
                            {item.children.map((subItem) => (
                                <div
                                    key={subItem.value}
                                    className={styles.uiPluginChartPanelPositionItem}
                                    onClick={(_) => {
                                        handleClick(item.value, subItem.value, 'type', 'subType');
                                    }}
                                >
                                    {renderIcon(subItem.icon)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
