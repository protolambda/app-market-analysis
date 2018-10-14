import {startScraping} from "./scraper";


const appID = "com.snapchat.android";

const reviewScraper = {
    progressFile: "scrape_progress.txt",
    resultsFile: "scrape_results.txt",
    pageCount: 20
};

startScraping(appID, reviewScraper);

