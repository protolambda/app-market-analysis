import gplay from "google-play-scraper";
import fs from "fs";


async function scrapePage(pageNum) {
    // Sorting options: sort.NEWEST, sort.RATING, sort.HELPFULNESS
    // Use "NEWEST", no bias, most recent information. Great!
    const result = gplay.reviews({
        appId: appID,
        page: pageNum,
        sort: gplay.sort.NEWEST
    });

    // We want to save the date as a UNIX timestamp
    const time = Date.parse(result.date + ' GMT');

    // Select the data we want to save
    // Note: we save the ID too, so we can detect duplicate entries when verifying the data.
    const dataRow = [time, result.userName, result.score, result.title, result.text, result.id];

    // Append the row to the results file (CSV)
    await fs.appendFile(reviewScraper.resultsFile,
        dataRow.map((v) => JSON.stringify(v)).join(",")
    );
}

/**
 * Start scraping.
 * @param appID The App ID to scrape reviews of.
 * @param reviewScraper The scraper configuration.
 * @return {Promise<void>}
 */
export async function startScraping({appID, reviewScraper}) {
    let retries = 0;
    while(true) {
        // Read where we stopped scraping
        const pageNum = parseInt((await fs.readFile(reviewScraper.progressFile)) || "0");
        if (pageNum >= reviewScraper.pageCount) {
            console.log("Finished scraping");
            break;
        }
        const nextPageNum = pageNum + 1;
        try {
            // Scrape the next page
            await scrapePage(nextPageNum);
        } catch (err) {
            console.log("Failed to scrape page! Page number: ", nextPageNum, " error: ", err);
            retries++;
            if (retries > 3) {
                console.log("Retried scraping 3 times! Stopping!");
                break;
            }
            // Wait and try again.
            await sleep(100);
            continue;
        }
        // Save our progress
        await fs.writeFile(reviewScraper.progressFile, nextPageNum.toString());
        // Sleep 0.1 seconds, we do not want the Google API to stop responding.
        await sleep(100);
    }
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

