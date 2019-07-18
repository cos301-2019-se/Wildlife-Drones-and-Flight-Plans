/**
 * A class that allows you to normalize an array
 */
export class Normalize {
    private constructor() {
    }

    public static normalize(dataArray) {
        const normalizedData = [];
        const min = 0;
        const max = Math.max(...dataArray);
        const alpha = (max - min);
        dataArray.map(value =>
            1 - ((value - min) / alpha));
        return dataArray;
    }

}
