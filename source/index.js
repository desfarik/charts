'use strict';

const data1 = require('./chart_data.json');
require('./styles.scss');
console.log(data1);
const data = data1[0];
console.log(data);
console.log(data);
const dataMap = new Map();
const mapN = new Map();


class ChartBuilder {
    constructor(refElement, chartData) {
        const chartWrapper = document.createElement('div');
        this.chartContainer = document.createElement("svg");
        this.dateContainer = document.createElement("svg");
        chartWrapper.appendChild(this.chartContainer);
        chartWrapper.appendChild(this.dateContainer);
        refElement.appendChild(chartWrapper);
        this.dataMap = new Map();
        this.convertDate(chartData);
        this.maxValue = this.calcMaxValue();
        this.buildMainChart();

        this.moveCarriage = document.getElementById('moveCarriage');


        const scrollViewer = document.getElementById('scrollViewer');
        const viewCharContainer = chartContainer.cloneNode(true);
        viewCharContainer.id = "chartContainer-1";
        viewCharContainer.style.width = viewCharContainer.style.height = viewCharContainer.style.top = null;
        viewCharContainer.removeChild(viewCharContainer.firstElementChild); // TODO FIX
        scrollViewer.appendChild(viewCharContainer);


        moveCarriage.onmousedown = (event) => {
            console.log('move');
            const shiftX = event.x - moveCarriage.getBoundingClientRect().left;
            const width = moveCarriage.getBoundingClientRect().width;
            let counter = 0;
            document.onmousemove = (e) => {
                let newXValue = e.x - shiftX;
                if (newXValue < 0) {
                    newXValue = 0;
                } else if (newXValue > (window.innerWidth - width)) {
                    newXValue = window.innerWidth - width;
                }
                moveCarriage.style.left = newXValue + 'px';
                const value = newXValue / window.innerWidth * 100 * (parseInt(chartContainer.style.width) / 100);
                chartContainer.style.left = -value + "%";
                if (counter++ === 5) {
                    counter = 0;
                    this.updateChartHeight(moveCarriage);
                }
            }

            document.onmouseup = () => {
                document.onmouseup = document.onmousemove = null;
                this.updateChartHeight(moveCarriage);
            }
        };

        moveCarriage.ondragstart = () => false;

        const leftCarriage = document.getElementById('leftCarriage');
        leftCarriage.ondragstart = () => false;
        leftCarriage.onmousedown = (event) => {
            event.stopImmediatePropagation();

            const shiftX = event.x - leftCarriage.getBoundingClientRect().left;
            const minWidth = window.innerWidth / 20;
            const right = moveCarriage.getBoundingClientRect().right;
            let counter = 0;
            document.onmousemove = (e) => {
                let newXValue = e.x - shiftX;
                if (newXValue < 0) {
                    newXValue = 0;
                } else if (newXValue > (right - minWidth)) {
                    newXValue = right - minWidth;
                }
                const val = (right - newXValue) / window.innerWidth * 100;
                moveCarriage.style.width = val + '%';
                dateContainer.setAttribute('class', mapN.get(parseInt(val)));
                moveCarriage.style.left = newXValue + 'px';
                const value = newXValue / window.innerWidth * 100 * (parseInt(chartContainer.style.width) / 100);
                chartContainer.style.left = -value + "%";
                chartContainer.style.width = 10000 / val + '%';
                if (counter++ === 5) {
                    counter = 0;
                    this.updateChartHeight(moveCarriage);
                }
            };
            document.onmouseup = () => {
                document.onmouseup = document.onmousemove = null;
                this.updateChartHeight(moveCarriage);
            };
        };

        const rightCarriage = document.getElementById('rightCarriage');
        rightCarriage.ondragstart = () => false;
        rightCarriage.onmousedown = (event) => {
            event.stopImmediatePropagation();

            const shiftX = event.x - rightCarriage.getBoundingClientRect().right;
            const minWidth = window.innerWidth / 20;
            const left = moveCarriage.getBoundingClientRect().left;
            let counter = 0;
            document.onmousemove = (e) => {
                let newXValue = e.x - shiftX;
                if (newXValue < (left + minWidth)) {
                    newXValue = left + minWidth;
                } else if (newXValue > window.innerWidth) {
                    newXValue = window.innerWidth;
                }
                const val = (newXValue - left) / window.innerWidth * 100;
                dateContainer.setAttribute('class', mapN.get(parseInt(val)));
                moveCarriage.style.width = val + '%';
                const value = left / window.innerWidth * 100 * (parseInt(chartContainer.style.width) / 100);
                chartContainer.style.left = -value + "%";
                chartContainer.style.width = 10000 / val + '%';
                if (counter++ === 5) {
                    counter = 0;
                    this.updateChartHeight(moveCarriage);
                }
            };
            document.onmouseup = () => {
                document.onmouseup = document.onmousemove = null;
                this.updateChartHeight(moveCarriage);
            };
        };
    }

    updateChartHeight(moveCarriage) {
        const left = this.moveCarriage.getBoundingClientRect().left;
        const leftIndex = parseInt(left / window.innerWidth * 100);
        const count = parseInt(moveCarriage.style.width);
        let localMaxValue = 0;
        [...dataMap.values()].slice(leftIndex, leftIndex + count).forEach(v => {
            localMaxValue = Math.max(localMaxValue, ...Object.values(v))
        });
        const newHeight = CHART_HEIGHT * maxvalue / localMaxValue;
        this.chartContainer.style.height = newHeight + 'px';
        this.chartContainer.style.top = CHART_HEIGHT - newHeight + 'px';
    }

    convertDate(chartData) {
        for (let index = 1; index < chartData.columns[0].length; index++) {
            let yData = {};
            for (let YDataIndex = 1; YDataIndex < chartData.columns.length; YDataIndex++) {
                yData[chartData.columns[YDataIndex][0]] = chartData.columns[YDataIndex][index];
            }
            this.dataMap.set(chartData.columns[0][index], yData);
        }
    }

    buildMainChart() {
        let x = 0;
        let x1 = 0;
        let y1 = 0;
        this.dataMap.forEach((v, k) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.textContent = new Date(k).toDateString().split(' ').slice(1, 3).join(' ');
            text.setAttribute('x', x1);
            text.setAttribute('y', 0);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', ++x + '%');
            line.setAttribute('y2', v.y0 / this.maxValue * 100 + '%');
            line.setAttribute('stroke-width', '2');
            x1 = x + '%';
            y1 = v.y0 / this.maxValue * 100 + '%';
            this.chartContainer.appendChild(line);
            this.dateContainer.appendChild(text);
        });
    }

    calcMaxValue() {
        let maxvalue = 0;
        [...this.dataMap.values()].forEach(v => {
            maxvalue = Math.max(maxvalue, ...Object.values(v))
        });
        return maxvalue;
    }
}

new ChartBuilder(document.getElementById("1"), data);
for (let i = 1; i <= 100; i++) {
    if (i < 10) {
        mapN.set(i, 'n1');
    } else if (i < 20) {
        mapN.set(i, 'n2');
    } else if (i < 50) {
        mapN.set(i, 'n4');
    } else if (i < 75) {
        mapN.set(i, 'n8');
    } else {
        mapN.set(i, 'n8');
    }
}
const CHART_HEIGHT = 400;

for (let index = 1; index < data.columns[0].length; index++) {
    let yData = {};
    for (let YDataIndex = 1; YDataIndex < data.columns.length; YDataIndex++) {
        yData[data.columns[YDataIndex][0]] = data.columns[YDataIndex][index];
    }
    dataMap.set(data.columns[0][index], yData);
}

let maxvalue = 0;
[...dataMap.values()].forEach(v => {
    maxvalue = Math.max(maxvalue, ...Object.values(v))
});

new Date().toDateString().split(' ').slice(1, 3).join(' ');

const chartContainer = document.getElementById("chartContainer");
const moveCarriage = document.getElementById('moveCarriage');
const dateContainer = document.getElementById('dateContainer');
updateChartHeight(moveCarriage);

let x = 0;
let x1 = 0;
let y1 = 0;
dataMap.forEach((v, k) => {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.textContent = new Date(k).toDateString().split(' ').slice(1, 3).join(' ');
    text.setAttribute('x', x1);
    text.setAttribute('y', 0);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', ++x + '%');
    line.setAttribute('y2', v.y0 / maxvalue * 100 + '%');
    line.setAttribute('stroke-width', '2');
    x1 = x + '%';
    y1 = v.y0 / maxvalue * 100 + '%';
    chartContainer.appendChild(line);
    dateContainer.appendChild(text);
});
console.log(maxvalue);


chartContainer.classList.add('animation');
