/**
 * A class that waits for some condition before resolving
 * multiple promises. This is useful for when one async operation
 * needs to be completed before continuing with multiple asynchronous
 * function alls.
 * Use cases include asynchronous locks.
 */
export class MultiPromise {
  private resolveListeners = [];
  private rejectListeners = [];

  private hasInitialised = false;
  private isInitialising = false;

  private initialiserResult = null;
  private encounteredError = false;

  constructor(private initialiserFunction) {}

  public ready(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (this.encounteredError) {
        return reject();
      }

      if (this.hasInitialised) {
        return resolve(this.initialiserResult);
      }

      this.resolveListeners.push(resolve);
      this.rejectListeners.push(reject);
      if (this.isInitialising) {
        return;
      }
      this.isInitialising = true;

      try {
        this.initialiserResult = await this.initialiserFunction();
      } catch (err) {
        this.encounteredError = true;
        while (this.rejectListeners.length) {
          this.rejectListeners[0](err);
          this.rejectListeners.shift();
        }
        return;
      }

      this.hasInitialised = true;
      while (this.resolveListeners.length) {
        this.resolveListeners[0](this.initialiserResult);
        this.resolveListeners.shift();
      }
    });
  }
}