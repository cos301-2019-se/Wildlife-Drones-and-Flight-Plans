/**
 * A class that allows you to normalize an array
 */
export class Normalize {
    private constructor() {
    }

    public static normalize(dataArray) {
        const min = 0;
        const max = Math.max(...dataArray);
        const alpha = (max - min);
        return dataArray.map(value =>
            1 - ((value - min) / alpha));
    }
}
