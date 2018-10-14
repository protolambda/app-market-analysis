// import {startScraping} from "./scraper";
import {createTopWordList} from "./wordcloud";


const appID = "com.snapchat.android";

const reviewScraper = {
    progressFile: "out/scrape_progress.txt",
    resultsFile: "out/scrape_results.csv",
    // Each page is max. 40 reviews.
    pageCount: 50000
};

// startScraping(appID, reviewScraper);

createTopWordList("scrape_results_sort_newest.csv", "out/word_count.csv", 11, 4, ["snapchat", "snap"]);

