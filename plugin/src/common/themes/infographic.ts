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

export const CHART_THEME_INFOGRAPHIC = {
    version: 1,
    themeName: 'infographic',
    theme: {
        seriesCnt: '4',
        backgroundColor: 'rgba(0,0,0,0)',
        titleColor: '#27727b',
        subtitleColor: '#aaa',
        textColorShow: false,
        textColor: '#333',
        markTextColor: '#eee',
        color: [
            '#c1232b',
            '#27727b',
            '#fcce10',
            '#e87c25',
            '#b5c334',
            '#fe8463',
            '#9bca63',
            '#fad860',
            '#f3a43b',
            '#60c0dd',
            '#d7504b',
            '#c6e579',
            '#f4e001',
            '#f0805a',
            '#26c0c0',
        ],
        borderColor: '#ccc',
        borderWidth: 0,
        visualMapColor: [
            '#c1232b',
            '#fcce10',
        ],
        legendTextColor: '#333333',
        kColor: '#c1232b',
        kColor0: '#b5c334',
        kBorderColor: '#c1232b',
        kBorderColor0: '#b5c334',
        kBorderWidth: 1,
        lineWidth: '3',
        symbolSize: '5',
        symbol: 'emptyCircle',
        symbolBorderWidth: 1,
        lineSmooth: false,
        graphLineWidth: 1,
        graphLineColor: '#aaa',
        mapLabelColor: '#c1232b',
        mapLabelColorE: 'rgb(100,0,0)',
        mapBorderColor: '#eeeeee',
        mapBorderColorE: '#444',
        mapBorderWidth: 0.5,
        mapBorderWidthE: 1,
        mapAreaColor: '#dddddd',
        mapAreaColorE: '#fe994e',
        axes: [
            {
                type: 'all',
                name: '通用坐标轴',
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
                type: 'category',
                name: '类目坐标轴',
                axisLineShow: true,
                axisLineColor: '#27727b',
                axisTickShow: true,
                axisTickColor: '#27727b',
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
                axisLineShow: false,
                axisLineColor: '#333',
                axisTickShow: false,
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
                axisLineColor: '#27727b',
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
                axisLineColor: '#27727b',
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
        axisSeperateSetting: true,
        toolboxColor: '#c1232b',
        toolboxEmphasisColor: '#e87c25',
        tooltipAxisColor: '#27727b',
        tooltipAxisWidth: 1,
        timelineLineColor: '#293c55',
        timelineLineWidth: 1,
        timelineItemColor: '#27727b',
        timelineItemColorE: '#72d4e0',
        timelineCheckColor: '#c1232b',
        timelineCheckBorderColor: 'rgba(194,53,49, 0.5)',
        timelineItemBorderWidth: 1,
        timelineControlColor: '#27727b',
        timelineControlBorderColor: '#27727b',
        timelineControlBorderWidth: 0.5,
        timelineLabelColor: '#293c55',
        datazoomBackgroundColor: 'rgba(0,0,0,0)',
        datazoomDataColor: 'rgba(181,195,52,0.3)',
        datazoomFillColor: 'rgba(181,195,52,0.2)',
        datazoomHandleColor: '#27727b',
        datazoomHandleWidth: '100',
        datazoomLabelColor: '#999999',
    },
};
