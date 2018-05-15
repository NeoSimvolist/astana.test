import {Component, ViewChild, ElementRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {finalize} from 'rxjs/operators';

import {AppService, ChartData, GroupType} from './app.service';
import * as Chart from 'chart.js';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    @ViewChild('chart')
    chartElementRef: ElementRef;

    years: number[];

    startYear: number = 1981;
    endYear: number = 2006;
    groupType: GroupType = 'average';

    groupTypes: Array<{ value: GroupType, display: string }> = [
        {
            display: 'Максимум',
            value: 'max',
        },
        {
            display: 'Минимум',
            value: 'min',
        },
        {
            display: 'В среднем',
            value: 'average',
        },
        {
            display: 'Сумма',
            value: 'sum',
        },
    ];

    current: 'temperature' | 'precipitation' = 'temperature';

    chart: Chart;

    subscription: Subscription;

    loading = false;

    constructor(private appService: AppService) {
        this.years = Array.from(Array(126).keys()).map(value => 1881 + value);
    }

    ngOnInit() {
        this.updateChart();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    selectChange(event) {
        this.updateChart();
    }

    temperatureClick() {
        this.current = 'temperature';
        this.updateChart();
    }

    precipitationClick() {
        this.current = 'precipitation';
        this.updateChart();
    }

    protected updateChart() {

        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        this.loading = true;

        if (this.current === 'temperature') {
            this.subscription = this.appService.getTemperature([this.startYear, this.endYear], this.groupType)
                .pipe(finalize(() => this.loading = false))
                .subscribe(data => this.buildChart(data));
        } else if (this.current === 'precipitation') {
            this.subscription = this.appService.getPrecipitation([this.startYear, this.endYear], this.groupType)
                .pipe(finalize(() => this.loading = false))
                .subscribe(data => this.buildChart(data));
        }
    }

    protected buildChart(data: ChartData) {

        console.log('buildChart');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(this.chartElementRef.nativeElement, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: this.current,
                        data: data.data,
                    }
                ]
            },
        });
    }
}
