import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs/Observable";
import {
    map,
    flatMap,
    bufferCount,
    last,
    concatMap,
    delay,
} from 'rxjs/operators';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';

import * as moment from 'moment'

export type GroupType = 'max' | 'min' | 'average' | 'sum';

export class ChartData {
    labels: string[];
    data: number[];
}

export class Precipitation {
    t: string;
    v: number;
}

export class Temperature extends Precipitation {
}

@Injectable()
export class AppService {

    public static readonly chunkSize = 1000;
    public static readonly chunkTime = 50;

    constructor(private http: HttpClient) {
    }

    getPrecipitation(yearRange: [number, number], groupType: GroupType): Observable<ChartData> {
        return this.http.get<Precipitation[]>("./assets/precipitation.json")
            .pipe(flatMap(rows => this.groupByYear(rows, yearRange, groupType)));
    }

    getTemperature(yearRange: [number, number], groupType: GroupType): Observable<ChartData> {
        return this.http.get<Temperature[]>("./assets/temperature.json")
            .pipe(flatMap(rows => this.groupByYear(rows, yearRange, groupType)));
    }

    protected groupByYear(data: Precipitation[] | Temperature[],
                          yearRange: [number, number],
                          groupType: GroupType): Observable<ChartData> {

        let group: {
            [year: string]: {
                sum: number,
                average: number,
                count: number,
                max: number,
                min: number,
            }
        } = {};

        const chunkCallback = data => Observable.create(ob => {

            for (let index in data) {
                const date = data[index].t;
                const year = moment(date, 'YYYY-MM-DD').year();
                const yearS = String(year);

                if (year >= yearRange[0] && year <= yearRange[1]) {
                    if (group[yearS]) {
                        group[yearS].sum += data[index].v;
                        group[yearS].count += 1;
                        group[yearS].average = group[yearS].sum / group[yearS].count;
                        group[yearS].max = data[index].v > group[yearS].max ? data[index].v : group[yearS].max;
                        group[yearS].min = data[index].v < group[yearS].min ? data[index].v : group[yearS].min;
                    } else {
                        group[yearS] = {
                            sum: data[index].v,
                            count: 1,
                            average: data[index].v,
                            max: data[index].v,
                            min: data[index].v,
                        };
                    }
                }
            }

            ob.next(data);
            ob.complete();
        });

        return Observable.from(data)
            .pipe(
                bufferCount(AppService.chunkSize),
                concatMap(data => Observable.of(data).pipe(delay(AppService.chunkTime))),
                flatMap(data => chunkCallback(data)),
                last(),
                map(() => {
                    return {
                        labels: Object.keys(group),
                        data: Object.values(group).map(value => value[groupType]),
                    };
                })
            );
    }
}
