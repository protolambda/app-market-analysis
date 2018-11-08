// import {startScraping} from "./scraper";
import {createTopWordList} from "./wordcloud";
import {createTopWordList} from "./wordcloud";
// import {fetchSimilar} from "./similar";


const appID = "com.snapchat.android";

const reviewScraper = {
    progressFile: "out/scrape_progress.txt",
    resultsFile: "out/scrape_results.csv",
    // Each page is max. 40 reviews.
    pageCount: 50000
};

// startScraping(appID, reviewScraper);

createTopWordList("scrape_results_sort_newest.csv", "out/word_count.csv", 11, 4, ["snapchat", "snap"]);


// fetchSimilar(appID, "nodes_similar_to_snapchat.csv", "edges_similar_to_snapchat.csv", 4, 6).then(_ => console.log("finished!"));

