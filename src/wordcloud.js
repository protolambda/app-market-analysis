import fs from 'fs';
import parse from 'csv-parse';

const commonWords = ["been", "ever", "doesn", "didn", "about", "all", "also", "and", "because", "but", "can", "come", "could", "day", "even", "find", "first", "for", "from", "get", "give", "have", "her", "here", "him", "his", "how", "into", "its", "just", "know", "like", "look", "make", "man", "many", "more", "new", "not", "now", "one", "only", "other", "our", "out", "people", "say", "see", "she", "some", "take", "tell", "than", "that", "the", "their", "them", "then", "there", "these", "they", "thing", "think", "this", "those", "time", "two", "use", "very", "want", "way", "well", "what", "when", "which", "who", "will", "with", "would", "year", "you", "your"];

export async function createTopWordList(inputCSV, outputFile, thresholdWordCount, thresholdLength, blacklistWords) {

    try {
        if (!(fs.existsSync(inputCSV))) {
            console.log("No input data!");
            return;
        }
    } catch (err) {
        console.log("Could not create progress/result files for scraping!", err);
        return;
    }

    const readerPromise = new Promise(
        (resolve, reject) => {
            const wordCounts = new Map();
            fs.createReadStream(inputCSV)
                .pipe(parse({delimiter: ','}))
                .on('data', function(csvrow) {
                    // field index 4 is the review body
                    const words = csvrow[4].split(/[^\w]/g);
                    words.forEach((key) => {
                        // Only use lowercase; no duplicates between different cases.
                        key = key.toLowerCase();
                        // Skip short keys
                        if (key.length < thresholdLength) return;
                        // 30 or more characters? Not a word, just spam.
                        if (key.length > 30) return;
                        // Common word? -> no meaning, skip it.
                        if (commonWords.indexOf(key) >= 0) return;
                        // Some words are blacklisted (e.g. name of the app itself), skip them
                        if (blacklistWords.indexOf(key) >= 0) return;

                        if (!wordCounts.has(key)) wordCounts.set(key, 1);
                        else wordCounts.set(key, wordCounts.get(key) + 1);
                    });
                })
                .on('end',function() {
                    resolve(wordCounts);
                })
                .on('error', function(err) {
                    reject(err);
                });
        }
    ).catch(console.log);

    const wordCounts = await readerPromise;

    if (!wordCounts) {
        console.log("No word counts, exiting.");
        return;
    }

    // console.log(wordCounts);
    const counts = [];
    wordCounts.forEach((v, k) => {
        if (v > thresholdWordCount) {
            counts.push([k, v]);
        }
    });
    // Sort the counts
    counts.sort((a, b) => a[1] < b[1] ? 1 : (a[1] > b[1] ? -1 : 0));

    const outStr = counts.map((v) => v[1] + ' '+ v[0]).join("\n");
    try {
        fs.writeFileSync(outputFile, outStr)
    } catch (err) {
        console.log("Failed to write output.", err);
    }

}