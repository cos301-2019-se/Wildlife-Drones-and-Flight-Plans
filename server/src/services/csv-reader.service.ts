import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import csv = require('csv-parser');
import * as readlines from 'n-readlines';

@Injectable()
export class CsvReaderService {
  readCSV(csvFileName: string): CsvReader {
    return new CsvReader(csvFileName);
  }
}

export class CsvReader {
  private handle;
  private headers;

  constructor(filename: string) {
    this.handle = new readlines(filename);

    this.headers = this.handle.next().toString().split(',');
  }
getHeaders()
{
  return this.headers;
}
  next() {
    const line = this.handle.next();

    if (!line) {
      return undefined;
    }

    return line
      .toString()
      .split(',')
      .reduce((ob, cell, cellIndex) => {
        ob[this.headers[cellIndex]] = cell;
        return ob;
      }, {});
  }
}
