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

import React, { useEffect, useRef } from 'react';
import { getInstanceByDom, init } from 'echarts';
import type { CSSProperties } from 'react';
import type { EChartsOption, SetOptionOpts } from 'echarts';

export interface ReactEChartsProps {
    option: EChartsOption;
    style?: CSSProperties;
    settings?: SetOptionOpts;
    loading?: boolean;
    theme?: 'light' | 'dark';
}

export function ReactECharts({
    option,
    style,
    settings,
    loading,
    theme,
}: ReactEChartsProps) {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize chart
        if (chartRef.current !== null) {
            init(chartRef.current, theme);
        }
    }, [theme]);

    useEffect(() => {
        let observer: ResizeObserver | null;
        if (chartRef.current !== null) {
            // Add chart resize listener
            const chart = getInstanceByDom(chartRef.current);
            observer = new ResizeObserver(() => {
                chart?.resize();
            });
            observer.observe(chartRef.current);
        }

        return () => {
            observer?.disconnect();
        };
    }, [chartRef.current]);

    useEffect(() => {
        // Update chart
        if (chartRef.current !== null) {
            const chart = getInstanceByDom(chartRef.current);
            chart?.setOption(option, settings);
        }
    }, [option, settings, theme]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

    useEffect(() => {
        // Update chart
        if (chartRef.current !== null) {
            const chart = getInstanceByDom(chartRef.current);
            loading === true ? chart?.showLoading() : chart?.hideLoading();
        }
    }, [loading, theme]);

    return <div ref={chartRef} style={{ width: '100%', height: '100%', ...style }} />;
}
