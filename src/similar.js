import gplay from "google-play-scraper";
import fs from "babel-fs";

// To get similar apps a specific app when debugging:
// gplay.similar({appId: appID, fullDetail: true, throttle: 10}).then(console.log);

export async function fetchSimilar(appID, resultNodesFile, resultEdgesFile, maxDegree, maxOutEdges) {
    // Collection of resulting apps
    const results = [];
    // List of items, each item is a list of 2 elements: appID A, appID B
    const edges = [];
    // Keep track of all appIDs with a set, to spot duplicates
    const seenAppIds = new Set();
    // Keep track of all appIDs, but per degree
    const appIdsByDegree = [[appID]];

    const sourceNode = await gplay.app({appId: appID, throttle: 5});
    results.push(sourceNode);
    seenAppIds.add(appID);
    for(let d = 0; d < maxDegree; d++) {
        // Add new degree, this is where next apps will be inserted into.
        appIdsByDegree.push([]);
        console.log("Starting fetching degree ", d);
        for (let i = 0; i < appIdsByDegree[d].length; i++) {
            const srcAppId = appIdsByDegree[d][i];
            console.log("Fetching apps similar to ", srcAppId);
            let similarApps = null;
            try {
                similarApps = await gplay.similar({appId: srcAppId, fullDetail: true, throttle: 5});
            } catch (err) {
                // App not accessible? Continue.
                console.log("Could not fetch app", err);
                continue;
            }
            // Add all new edges
            for(let a = 0; a < similarApps.length && a < maxOutEdges; a++) {
                const app = similarApps[a];
                edges.push([srcAppId, app.appId]);
            }
            const newSimilars = similarApps.slice(0, maxOutEdges).filter(app => !seenAppIds.has(app.appId));
            // Add all new unseen apps to the results
            results.push(...newSimilars);
            // Mark new similars as seen
            newSimilars.forEach(app => {
                seenAppIds.add(app.appId);
            });
            // Add new similars to the degree output
            appIdsByDegree[d + 1].push(...(newSimilars.map(app => app.appId)));
        }
    }

    // Add header to nodes output
    await fs.appendFile(resultNodesFile, '"Id","Label","minInstalls","score","ratings","reviews","price","size","IAP","genre","developer","icon_link"\n');
    await fs.appendFile(resultNodesFile, results.map(formatEntry).join("\n")+"\n");
    await fs.appendFile(resultEdgesFile, '"Source","Target","Weight"\n');
    await fs.appendFile(resultEdgesFile, edges.map((edge, i) => `"${edge[0]}","${edge[1]}",${maxOutEdges-i}`).join("\n")+"\n");
}


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
    // Select the data we want to save
    // Note: we save the ID too, so we can detect duplicate entries when verifying the data.
    const dataRow = [strF(entry.appId), strF(entry.title), entry.minInstalls, entry.score, entry.ratings, entry.reviews, entry.price, strF(entry.size), entry.offersIAP, strF(entry.genre), strF(entry.developer), strF(entry.icon)];

    return dataRow.join(",")
}
