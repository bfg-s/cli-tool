module.exports = class Num {

    /**
     * Check is number
     * @param num
     */
    isNumber (num) {
        return !isNaN(Number(num))
    }
}
