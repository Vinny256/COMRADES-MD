let isProcessing = false;
const taskQueue = [];

const processQueue = async () => {
    if (isProcessing || taskQueue.length === 0) return;
    isProcessing = true;
    const task = taskQueue.shift();
    try {
        await task();
        await new Promise(res => setTimeout(res, 1000)); 
    } catch (e) { }
    isProcessing = false;
    processQueue();
};

module.exports = { taskQueue, processQueue };
