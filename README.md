# App market analysis

Data source for a CityU project.

## Installation

```
$ npm install -g app-market-analysis
```

## Usage

To get an overview of all the sub-commands:

    $ app-market-analysis --help
    
    Usage: index [options] [command]
    
    Options:
      -V, --version              output the version number
      -h, --help                 output usage information
    
    Commands:
      scrape [options] <appID>   Scrape reviews for the specified app.
      wordcloud [options]        Convert scraped data to a sorted list of most-occurring words.
      similar [options] <appID>  Scrape a network of similar apps for the specified app.


Run `app-market-analysis <cmd> --help` to get information for the given command.

### Command Format

An `appID` is formatted like the application ID used in the android ecosystem; e.g. `com.snapchat.android`

List arguments are formatted like `"foo","bar 123","test"`

### Scraping

Scraping can be a long process (due to rate-limits), and you may want to stop and re-start the scraper. 
Hence the choice for a file which keeps track of the last page-number. The results are appended as rows to a CSV file.

    Usage: scrape [options] <appID>
    
    Scrape reviews for the specified app.
    
    Options:
      -p, --progress-file <path>  Specify file-path for progress file. Defaults to scrape_progress.txt
      -r, --results-file <path>   Specify file-path for results CSV file. Defaults to scrape_results.csv
      -s, --sorting-type <name>   Specify the sorting order used when scraping reviews. Can be NEWEST, RATING, or HELPFULNESS. Defaults to NEWEST
      -c, --page-count <count>    The amount of review pages to scrape, each page can be 1 - 40 reviews.
      -h, --help                  output usage information

Try it out! Scrape 10 pages of reviews:

    $ app-market-analysis scrape -c 10 com.snapchat.android


### Similar apps

To create a network of similar apps, this tool scrapes the recommended apps,
 starting from the given appID, and exploring further and further.
    
    Usage: similar [options] <appID>
    
    Scrape a network of similar apps for the specified app.
    
    Options:
      -n, --nodes-file <path>    Specify file-path for nodes CSV file. Defaults to nodes_similar_<appID>.csv
      -e, --edges-file <path>    Specify file-path for edges CSV file. Defaults to edges_similar_<appID>.csv
      -d, --max-degree <degree>  The maximum degree of depth. I.e. how many nodes in the longest path from appID outwards. Defaults to 3.
      -l, --edge-limit <limit>   The maximum amount of edges per app. Defaults to 6.
      -h, --help                 output usage information

The results are split in two files:

1) A nodes file, with all the data for each app in the network.
2) An edges file, that connects the similar apps. Each edge also has a weight (inverse of recommendation order): 
 starting from `edge-limit` (first recommendation), down to `1` (last recommendation).


    $ app-market-analysis similar -d 4 -l 10 com.snapchat.android


### Wordcloud

The analysis tool also includes this utility which converts the scraped reviews
 into a filtered and counted list of words. 
This list can then be inserted into any wordcloud tool online, to get the final visualization.

    Usage: wordcloud [options]
    
    Convert scraped data to a sorted list of most-occurring words.
    
    Options:
      -r, --results-file <path>  Specify file-path of the scrape results CSV file. Defaults to scrape_results.csv
      -w, --word-file <path>     Specify file-path for the list of word-counts for the word-cloud.
      -t, --threshold <count>    The minimum occurrence count (threshold) for a word to be included.
      -l, --min-length <length>  The minimum length of a word to be included.
      -b, --blacklist <list>     A comma separated list of words to filter out.
      -n, --ratings <list>       A comma separated list of ratings to include. Defaults to all (1,2,3,4,5).
      -h, --help                 output usage information

Here is an example that takes a set of scrape results, and creates a wordlist with each word:

- occurring 11 or more times
- with a length of at least 4
- ignoring the name and alias of the app itself (e.g. snapchat)

Command:

    $ wordcloud -r out/scrape_results_sort_newest.csv -t 11 -l 4 --blacklist snap,snapchat

