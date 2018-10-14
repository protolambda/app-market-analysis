import readline from 'readline';
import fs from 'fs';

export async function createTopWordList(inputCSV, outputCSV, thresholdWordCount) {

    try {
        if (!(fs.existsSync(inputCSV))) {
            console.log("No input data!");
            return;
        }
    } catch (err) {
        console.log("Could not create progress/result files for scraping!", err);
        return;
    }

    const rl = readline.createInterface({
        input: fs.createReadStream(inputCSV),
        crlfDelay: Infinity
    });

    const wordCounts = new Map();
    rl.on('line', (line) => {
        const words = line.split(/^\w/g);
        words.forEach((key) => {
            if (!wordCounts.has(key)) wordCounts.put(key, 1);
            else wordCounts.put(key, wordCounts.get(key) + 1);
        });
    });
    const counts = [];
    wordCounts.forEach((v, k) => {
        if (v > thresholdWordCount) {
            counts.add([k, v]);
        }
    });
    // Sort the counts
    counts.sort((a, b) => a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0));
    console.log(counts.map((v) => v[0] + ": " + v[1]).join("\n"));
}