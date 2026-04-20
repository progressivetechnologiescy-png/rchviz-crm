const { search, SafeSearchType } = require('duck-duck-scrape');

async function testLib() {
    try {
        console.log("Searching duck-duck-scrape...");
        const searchResults = await search('Architects in London', {
            safeSearch: SafeSearchType.OFF
        });
        
        console.log(`Found ${searchResults.results.length} results`);
        if(searchResults.results.length > 0) {
            console.log("First result:", searchResults.results[0]);
        }
    } catch(e) {
        console.error("DDG Lib failed:", e);
    }
}

testLib();
