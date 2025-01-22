
(async () => {
    let i = 0;
    while (i < 20) {
        const date = new Date();
        console.log("TEST>>>>", date);
        if (i === 3) {
            throw new Error('Test error');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        i++;
    }
})();

