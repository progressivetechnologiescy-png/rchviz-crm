const axios = require('axios');

async function scrape() {
    const industry = "Architects";
    const location = "London";
    const banned = [];
    const targetLimit = 3;
    let leads = [];

    const currentIndustry = industry;
    const cleanLocation = location;
    
    const targetUrl = `https://www.ask.com/web?q=${encodeURIComponent(`${currentIndustry} in ${cleanLocation}`)}`;
    const res = await axios.get(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const match = res.data.match(/window\.MESON\.initialState\s*=\s*(\{.*?\});/);
    if(!match) return console.log("No match");
    const data = JSON.parse(match[1]);
    const organicResults = data.search?.webResults?.results || [];

    const excludedDomains = [
        'yelp.com', 'linkedin.com', 'facebook.com', 'yellowpages',
        'instagram.com', 'twitter.com', 'x.com', 'youtube.com', 'tiktok.com',
        'pinterest.com', 'houzz.com', 'archello.com', 'archdaily.com',
        'glassdoor.com', 'indeed.com', 'apollo.io', 'dnb.com', 'crunchbase.com',
        'zoominfo.com', 'cylex', 'cyprus.com', 'cyprusprofile', 'realtor.com',
        'zillow.com', 'rightmove', 'zoopla', 'realesigntrust', 'cyprusresaleproperties',
        'realting.com', 'aplaceinthesun.com', 'duckduckgo.com', 'tripadvisor',
        'b2bhint.com', 'companieshouse', 'bloomberg.com', 'trustpilot.com', 'foursquare.com',
        'cyprusmail', 'cyprus-mail', 'news', 'wikipedia.org', 'gov.cy', 'amazon', 'ebay',
        'cbn.com.cy', 'fastforward.com.cy', 'wn.com', 'cypr24.eu', 'cyprus-tourism.net',
        'yahoo', 'forbes', 'blob', 'dezeen.com', 'e-architect.com', 'weather',
        'guruwalk', 'aia.org', 'archisoup', 'booking.com', 'airbnb', 'trip.com',
        'agoda', 'expedia', 'architecturaldigest', 'architizer', 'admagazine',
        'gplazarou', 'contemporist.com', 'architectmagazine.com', 'limassolmarina.com',
        'loopnet.com', 'korter.co.uk', 'toprated.london', 'boydmorison.co.uk', 'sothebysrealty.co.uk',
        'benhams.com', 'archinect.com', 'designboom.com', 'issuu.com', 'firms.com',
        'cybo.com', 'cyprusarchitects.com'
    ];

    const results = [];
    organicResults.forEach((el) => {
        let title = el.title ? el.title.trim() : '';
        let url = el.url ? el.url.trim() : '';
        
        console.log("Processing:", url);

        if (!title || !url) return console.log("Missing title or url");

        if (url && !url.startsWith('http')) url = 'https://' + url;

        if (url.includes('ask.com') || url.includes('.edu/') || url.endsWith('.edu') || url.includes('university') || url.includes('college')) {
            return console.log("Skipping education");
        }

        const isBanned = false;

        let isDirectory = excludedDomains.some(domain => url.toLowerCase().includes(domain.toLowerCase()));
        if (title.toLowerCase() === 'more info' || title.toLowerCase() === 'ask.com' || title.toLowerCase().includes('search')) {
            isDirectory = true;
        }

        const lowerUrl = url.toLowerCase();
        if ((lowerUrl.includes('realestate') || lowerUrl.includes('estateagent') || lowerUrl.includes('propertyforsale')) &&
            !lowerUrl.includes('developer') && !lowerUrl.includes('architect')) {
            isDirectory = true;
        }

        let isDeepLink = false;
        try {
            const parsed = new URL(url);
            if (url.includes('/article/') || url.includes('/news/') || url.includes('/blog/') || url.includes('/view') || url.match(/\/\d{4}\/\d{2}\//)) {
                isDeepLink = true;
            } else {
                url = parsed.origin;
            }
        } catch (e) { }

        if (!isDirectory && !isBanned && !isDeepLink) {
            results.push({ url });
        } else {
            console.log("Filtered out:", url, "isDirectory:", isDirectory, "isDeepLink:", isDeepLink);
        }
    });

    console.log("Kept", results.length, "results");
}

scrape();
