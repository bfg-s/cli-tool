
(async () => {
    let i = 0;
    while (i < 10) {
        const date = new Date();
        console.log("TES2T>>>>", date);
        await new Promise(resolve => setTimeout(resolve, 1000));
        i++;
    }
})();
