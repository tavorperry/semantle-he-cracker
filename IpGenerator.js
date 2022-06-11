//Ip generator with maximum of 2560 for each number
const maximumRange = 2560;

class IpGenerator {
    constructor() {
        this.counters = [1, 1, 1, 1, 1];
    }

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

    printIp() {
        return `${this.counters[0]}.${this.counters[1]}.${this.counters[2]}.${this.counters[3]}.${this.counters[4]}`;
    }
}

export {IpGenerator};