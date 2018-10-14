import gplay from "google-play-scraper";
import fs from "babel-fs";

function escapeSpecialChars(str) {
    return str
        .replace(/[\\]/g, '\\\\')
        .replace(/["]/g,  '\'')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t');
}

const strF = (v) => "\""+escapeSpecialChars(v.toString())+"\"";

function formatEntry(entry) {
    // We want to save the date as a UNIX timestamp
    const time = Date.parse(entry.date + ' GMT');

    // Select the data we want to save
    // Note: we save the ID too, so we can detect duplicate entries when verifying the data.
    const dataRow = [time, strF(entry.userName), entry.score, strF(entry.title), strF(entry.text), strF(entry.id)];

    return dataRow.join(",")
}

async function scrapePage(appID, pageNum, resultsFile) {
    // Sorting options: sort.NEWEST, sort.RATING, sort.HELPFULNESS
    // Use "NEWEST", no bias, most recent information. Great!
    const result = await gplay.reviews({
        appId: appID,
        page: pageNum,
        sort: gplay.sort.NEWEST
    });

    if (result.length === 0) {
        console.log("Empty review page!");
        return;
    }
    // Append the row to the results file (CSV)
    await fs.appendFile(resultsFile, result.map(formatEntry).join("\n")+"\n");
}

/**
 * Start scraping.
 * @param appID The App ID to scrape reviews of.
 * @param reviewScraper The scraper configuration.
 * @return {Promise<void>}
 */
export async function startScraping(appID, reviewScraper) {

    try {
        if (!(fs.existsSync(reviewScraper.progressFile))) await fs.writeFile(reviewScraper.progressFile, "-1").catch((v) => console.log("3", v));
        if (!(fs.existsSync(reviewScraper.resultsFile))) await fs.writeFile(reviewScraper.resultsFile, "").catch((v) => console.log("4", v));
    } catch (err) {
        console.log("Could not create progress/result files for scraping!", err);
        return;
    }

    let retries = 0;
    while(true) {
        // Read where we stopped scraping
        const prevPageNum = parseInt((await fs.readFile(reviewScraper.progressFile).catch(console.log)) || "-1");
        if (prevPageNum >= reviewScraper.pageCount) {
            console.log("Finished scraping");
            break;
        }
        const currentPageNum = prevPageNum + 1;
        console.log("Scraping page "+currentPageNum);
        try {
            // Scrape the next page
            await scrapePage(appID, currentPageNum, reviewScraper.resultsFile);
        } catch (err) {
            console.log("Failed to scrape page! Page number: ", currentPageNum, " error: ", err);
            retries++;
            if (retries > 3) {
                console.log("Retried scraping 3 times! Stopping!");
                break;
            }
            // Wait and try again.
            await sleep(1000);
            continue;
        }
        // Save our progress
        await fs.writeFile(reviewScraper.progressFile, currentPageNum.toString()).catch(console.log);
        // Sleep 0.1 seconds, we do not want the Google API to stop responding.
        await sleep(1000);
    }
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

