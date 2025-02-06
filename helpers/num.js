module.exports = class Num {

    /**
     * Check is number
     * @param num
     */
    isNumber (num) {
        if (num === null || num === undefined) { return false; }
        return !isNaN(Number(num))
    }

    formatDuration(ms) {
        if (ms < 1000) return `${ms} ms`;

        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60)) % 60;
        const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        const parts = [];

        if (days > 0) parts.push(`${days} days`);
        if (hours > 0) parts.push(`${hours} hours`);
        if (minutes > 0) parts.push(`${minutes} min`);
        if (seconds > 0) parts.push(`${seconds} sec`);

        return parts.join(" ") || "0 sec";
    }
}
