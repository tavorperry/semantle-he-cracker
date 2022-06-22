// Ip generator with maximum of 2560 for each number
const maximumRange = 2560;

/**
 * The IP Generator is generating a new leading IP address on each getNextIP Call.
 * The normal range is 256 for each number, but it can be changed (example -2560).
 */
class IpGenerator {
  /**
   * constructor
   */
  constructor() {
    this.counters = [1, 1, 1, 1, 1];
  }

  /**
   * Each call is returning the next leading IP address.
   * @example if the current IP is =>  10.256.0.0
   * and the maximum range is 256
   * then, the next IP will be => 10.0.1.0
   * @return {string} the next IP address
   */
  getNextIp() {
    for (let i = 0; i < this.counters.length; ++i) {
      if (this.counters[i] < maximumRange) {
        ++this.counters[i];
        return this.printIp();
      }
      if (this.counters[this.counters.length - 1] >= maximumRange) {
        for (let j = 0; j < this.counters.length; ++j) {
          this.counters[j] = 1;
        }
        return this.printIp();
      }
    }
  }

  /**
   * return as String all the numbers in the array with dots(.) as an ip Address
   * @return {string} the Generated IP address
   */
  printIp() {
    return `${this.counters[0]}.${this.counters[1]}.${this.counters[2]}.${this.counters[3]}.${this.counters[4]}`;
  }
}

export {IpGenerator};
