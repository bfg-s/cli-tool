module.exports = class Num {

    /**
     * Check is number
     * @param num
     */
    isNumber (num) {
        if (num === null || num === undefined) { return false; }
        return !isNaN(Number(num))
    }
}
