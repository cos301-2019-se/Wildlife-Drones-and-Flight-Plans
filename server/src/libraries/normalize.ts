/**
 * A class that allows you to normalize an array
 */
export class Normalize {
    private min = null;
    private max = null;
    private dataArray = null;
    private normalizedData = [];
    constructor(dataArray) {
        this.dataArray = dataArray;
        this.min = Math.min(...this.dataArray);
        this.max = Math.max(...this.dataArray);
    }

    public getNormalizedData() {
        this.normalize();
        return this.normalizedData;
    }

    private normalize() {
        const alpha = (this.max - this.min);
        this.dataArray.forEach(value => {
            // (this.max - this.min)/(max-min)*(value-min)+min
        this.normalizedData.push((value - this.min)/alpha);
        });
    }

}
