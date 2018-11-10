import program from "commander";

import {startScraping} from "./scraper";
import {createTopWordList} from "./wordcloud";
import {fetchSimilar} from "./similar";

function listOpt(val) {
    return val.split(',').map(v => v.trim().toLowerCase());
}

program
    .version('1.0.0');

program
    .command('scrape <appID>')
    .description('Scrape reviews for the specified app.')
    .option('-p, --progress-file <path>', 'Specify file-path for progress file. Defaults to scrape_progress.txt')
    .option('-r, --results-file <path>', 'Specify file-path for results CSV file. Defaults to scrape_results.csv')
    .option('-c, --page-count <count>', 'The amount of review pages to scrape, each page can be 1 - 40 reviews.', parseInt)
    .action(async function (appID, cmd) {
        await startScraping(appID, {
            progressFile: cmd.progressFile || 'scrape_progress.txt',
            resultsFile: cmd.resultsFile || 'scrape_results.csv',
            // Each page is max. 40 reviews.
            pageCount: cmd.pageCount || 20
        });
    });
program
    .command('wordcloud')
    .description('Convert scraped data to a sorted list of most-occurring words.')
    .option('-r, --results-file <path>', 'Specify file-path of the scrape results CSV file. Defaults to scrape_results.csv')
    .option('-w, --word-file <path>', 'Specify file-path for the list of word-counts for the word-cloud.')
    .option('-t, --threshold <count>', 'The minimum occurrence count (threshold) for a word to be included.', parseInt)
    .option('-l, --min-length <length>', 'The minimum length of a word to be included.', parseInt)
    .option('-b, --blacklist <list>', 'A comma separated list of words.', listOpt)
    .action(async function (appID, cmd) {
        await createTopWordList(
            (cmd.resultsFile || 'scrape_results.csv'),
            (cmd.wordFile || 'word_count.csv'),
            (cmd.threshold || 10),
            (cmd.minLength || 4),
            (cmd.blacklist || [])
        );
    });
program
    .command('similar <appID>')
    .description('Scrape a network of similar apps for the specified app.')
    .option('-n, --nodes-file', 'Specify file-path for nodes CSV file. Defaults to nodes_similar_<appID>.csv')
    .option('-e, --edges-file', 'Specify file-path for edges CSV file. Defaults to edges_similar_<appID>.csv')
    .option('-d, --max-degree', 'The maximum degree of depth. I.e. how many nodes in the longest path from appID outwards. Defaults to 3.', parseInt)
    .option('-l, --edge-limit', 'The maximum amount of edges per app. Defaults to 6.', parseInt)
    .action(async function (appID, cmd) {
        await fetchSimilar(appID,
            (cmd.nodesFile || `nodes_similar_${appID}.csv`),
            (cmd.edgesFile || `edges_similar_${appID}.csv`),
            (cmd.maxDegree || 3),
            (cmd.edgeLimit || 6)
        );
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
