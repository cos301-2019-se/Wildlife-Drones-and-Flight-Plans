import { Injectable, RequestTimeoutException } from '@nestjs/common';
import * as fs from 'fs';
import csv = require('csv-parser');

@Injectable()
export class CsvReader {
    readCSV(csvfilename: string, mapper: (row) => void): void {
        fs.createReadStream(csvfilename)
            .pipe(csv())
            .on('data', (row) => {
                mapper(row);
            })
            .on('end', () => {
                mapper(undefined);
            });
    }
}
