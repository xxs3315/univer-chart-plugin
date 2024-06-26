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

export const CHART_THEME_HALLOWEEN = {
    version: 1,
    themeName: 'halloween',
    theme: {
        seriesCnt: '4',
        backgroundColor: 'rgba(64,64,64,0.5)',
        titleColor: '#ffaf51',
        subtitleColor: '#eeeeee',
        textColorShow: false,
        textColor: '#333',
        markTextColor: '#333333',
        color: [
            '#ff715e',
            '#ffaf51',
            '#ffee51',
            '#8c6ac4',
            '#715c87',
        ],
        borderColor: '#ccc',
        borderWidth: '0',
        visualMapColor: [
            '#ff715e',
            '#ffee51',
            '#797fba',
        ],
        legendTextColor: '#999999',
        kColor: '#ffee51',
        kColor0: 'rgba(255,255,255,0)',
        kBorderColor: '#ff715e',
        kBorderColor0: '#797fba',
        kBorderWidth: '1',
        lineWidth: '3',
        symbolSize: '8',
        symbol: 'emptyCircle',
        symbolBorderWidth: '2',
        lineSmooth: false,
        graphLineWidth: '1',
        graphLineColor: '#888888',
        mapLabelColor: '#ffffff',
        mapLabelColorE: '#ffee51',
        mapBorderColor: '#999999',
        mapBorderColorE: '#ffaf51',
        mapBorderWidth: 0.5,
        mapBorderWidthE: 1,
        mapAreaColor: '#555555',
        mapAreaColorE: 'rgba(255,175,81,0.5)',
        axes: [
            {
                type: 'all',
                name: '通用坐标轴',
                axisLineShow: true,
                axisLineColor: '#666666',
                axisTickShow: false,
                axisTickColor: '#333',
                axisLabelShow: true,
                axisLabelColor: '#999999',
                splitLineShow: true,
                splitLineColor: [
                    '#555555',
                ],
                splitAreaShow: false,
                splitAreaColor: [
                    'rgba(250,250,250,0.05)',
                    'rgba(200,200,200,0.02)',
                ],
            },
            {
                type: 'category',
                name: '类目坐标轴',
                axisLineShow: true,
                axisLineColor: '#333',
                axisTickShow: true,
                axisTickColor: '#333',
                axisLabelShow: true,
                axisLabelColor: '#333',
                splitLineShow: false,
                splitLineColor: [
                    '#ccc',
                ],
                splitAreaShow: false,
                splitAreaColor: [
                    'rgba(250,250,250,0.3)',
                    'rgba(200,200,200,0.3)',
                ],
            },
            {
                type: 'value',
                name: '数值坐标轴',
                axisLineShow: true,
                axisLineColor: '#333',
                axisTickShow: true,
                axisTickColor: '#333',
                axisLabelShow: true,
                axisLabelColor: '#333',
                splitLineShow: true,
                splitLineColor: [
                    '#ccc',
                ],
                splitAreaShow: false,
                splitAreaColor: [
                    'rgba(250,250,250,0.3)',
                    'rgba(200,200,200,0.3)',
                ],
            },
            {
                type: 'log',
                name: '对数坐标轴',
                axisLineShow: true,
                axisLineColor: '#333',
                axisTickShow: true,
                axisTickColor: '#333',
                axisLabelShow: true,
                axisLabelColor: '#333',
                splitLineShow: true,
                splitLineColor: [
                    '#ccc',
                ],
                splitAreaShow: false,
                splitAreaColor: [
                    'rgba(250,250,250,0.3)',
                    'rgba(200,200,200,0.3)',
                ],
            },
            {
                type: 'time',
                name: '时间坐标轴',
                axisLineShow: true,
                axisLineColor: '#333',
                axisTickShow: true,
                axisTickColor: '#333',
                axisLabelShow: true,
                axisLabelColor: '#333',
                splitLineShow: true,
                splitLineColor: [
                    '#ccc',
                ],
                splitAreaShow: false,
                splitAreaColor: [
                    'rgba(250,250,250,0.3)',
                    'rgba(200,200,200,0.3)',
                ],
            },
        ],
        axisSeperateSetting: false,
        toolboxColor: '#999999',
        toolboxEmphasisColor: '#666666',
        tooltipAxisColor: '#cccccc',
        tooltipAxisWidth: 1,
        timelineLineColor: '#ffaf51',
        timelineLineWidth: 1,
        timelineItemColor: '#ffaf51',
        timelineItemColorE: '#ffaf51',
        timelineCheckColor: '#ff715e',
        timelineCheckBorderColor: 'rgba(255,113,94,0.4)',
        timelineItemBorderWidth: 1,
        timelineControlColor: '#ffaf51',
        timelineControlBorderColor: '#ffaf51',
        timelineControlBorderWidth: 0.5,
        timelineLabelColor: '#ff715e',
        datazoomBackgroundColor: 'rgba(255,255,255,0)',
        datazoomDataColor: 'rgba(222,222,222,1)',
        datazoomFillColor: 'rgba(255,113,94,0.2)',
        datazoomHandleColor: '#cccccc',
        datazoomHandleWidth: '100',
        datazoomLabelColor: '#999999',
    },
};
