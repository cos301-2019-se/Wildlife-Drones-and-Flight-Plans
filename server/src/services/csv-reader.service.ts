import { Injectable} from '@nestjs/common';
import * as fs from 'fs';
import csv = require('csv-parser');

@Injectable()
export class CsvReader {
    readCSV(csvFileName: string): CsvReaderStream {
        return new CsvReaderStream(csvFileName);
    }
}

export class CsvReaderStream {
    private handle: fs.ReadStream;

    constructor(filename) {
        this.handle = fs.createReadStream(filename);
    }

    public onData(mapper) {
        this.handle
            .pipe(csv())
            .on('data', (row) => {
                mapper(row);
            })
            .on('end', () => {
                mapper(undefined);
            });
    }

    public resume() {
        this.handle.resume();
    }

    public pause() {
        this.handle.pause();
    }
}