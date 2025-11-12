import { AbsScraper } from './abstractScrapper.mjs';

const CONFIG_KJIJI = {
    URL: 'http://www.kijiji.ca',
    SEARCH_URL: 'http://www.kijiji.ca/b-apartments-condos/canada', //this line should be changed to be more dynamic (maybe ask user for location they are looking for and insert that info accordingly into URL)
    PAGE_PRE: '/pages-',
    PAGE_SUF: '/c37l', //this is the code for short term rental (long term rentals is c37l1 if we want to change it or somehow make this dynamic)
    PAGES_TO_SCRAPE: 4, //we can shorten or lengthen depending

};

const SELECTORS_KIJIJI = { //specific HTML call information for kijiji
    LISTING_CONT: 'div.search-item',
    TITLE: 'data-testid="listing-title"',
    PRICE: 'data-testid="listing-price',
    LOCATION: 'data-testid="listing-location',
    LINK: 'data-testid="listing-link"',
    ATT_CONT: 'div.attribute',
    ATT_ITEM: '.attribute-row',
    BEDS_INFO: 'div.bedrooms',
    DETAIL_BLOCK: 'div.details-info',
};

export class KijijiScraper extends AbsScraper {

    //call abstract class to get url outline and save configuration variables + create dataList to store all listing info
    constructor(OUT_FILE) {
        super(CONFIG_KJIJI.URL, OUT_FILE);
        this.config = CONFIG_KJIJI;
        this.dataList = [];
    }

    //build full url for page
    buildURL(PAGES_TO_SCRAPE) {
        if (PAGES_TO_SCRAPE == 1) {
             return `${this.config.URL}${this.config.SEARCH_URL}${this.config.PAGE_PRE}${this.config.PAGE_SUF}`;
        }
        return `${this.config.URL}${this.config.SEARCH_URL}${this.config.PAGE_PRE}${this.config.PAGE_SUF}`;
    }

    //gets listting data for a single page
    async scrapePage(){
        await this.page.waitForSelector(this.selector.LISTING_CONT,{timeout: 15000});

        const pageData = await this.page.evaluate((selectors) => {

            const listings = [];
            const containers = document.querySelectorAll(selectors.LISTING_CONT);
            
            containters.forEach(container => {
                const titleEl = container.querySelector(selectors.TITLE);
                const linkEl = container.querySelector(selectors.LINK);

                const rawPrice = container.querySelector(selectors.PRICE)?.innerText.trim() || "N/A";
                const clearPrice = rawPrice.replace(/[^0-9.]/g, '');

                const getText = (selector) => container.querySelector(selector)?.innerText.trim() || "N/A";
                let bedrooms = "N/A", bathrooms = "N/A", sqft = "N/A", type = "N/A", parking = "N/A";

                const detailBlock = container.querySelector(selectors.DETAIL_BLOCK) || container.querySelector(selectors.ATT_CONT);

                if (detailBlock) {
                    const attributeItems = detailBlock.querySelectorAll('li, div[role="listitem"]');

                    attributeItems.forEach(item => {
                        const text = item.innerText.trim();

                        if (text.includes('Beds')) {
                            bedrooms = text.replace('Beds', '').trim();
                        } else if (text.includes('Baths')) {
                            bedrooms = text.replace('Baths', '').trim();
                        } else if (text.includes('Beds')) {
                            bedrooms = text.replace('Beds', '').trim();
                        } else if (text.includes('sqfeet')) {
                            bedrooms = text.replace('sqfeet', '').trim();
                        } else if (text.includes('type')) {
                            bedrooms = text.replace('type', '').trim();
                        } else if (text.includes('parking')) {
                            bedrooms = text.replace('parking', '').trim();
                        }

                    });
                }
                
                if (bedrooms == "N/A") { bedrooms = getText(selectors.BEDS_INFO);}

                listings.push({
                    title: getText(selectors.TITLE),
                    price: clearPrice,
                    location: getText(selectors.LOCATION),
                    url: linkEl ? linkEl.href : "N/A",
                    bedrooms: bedrooms,
                    bathrooms: bathrooms,
                    square_feet: sqft,
                    type: type,
                    parking_info: parking,
                    source: "Kijiji",
                });
            });
            return listings;
        }, this.selectors);
        return pageData;
    }

}




// for stealth so kijiji doesnt kick us out
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

//will convert scrapped data into string format, allow to write to final CSV data, and make sure files path is constructed right
const {Parser} = require('json2csv');
const fs = require('fs');
const path = require('path');

const OUT_FILE = 'kijiji_data.csv';

let dataList = []; //list to store final data



// func to get info data from seach pages
async function scrapePages(browser) {
    console.log("start data collection");

    for (let i = 1; i <= PAGES_TO_SCRAPE; i++) {
        const page = await browser.newPage();

        const finalUrl = `${SEARCH_URL}${PAGE_PRE}${i}${PAGE_SUF}`; //adding all URLS together
        console.log(`scrape page: ${finalUrl}`);


        try {
            // load a browser instance, wait till info has been collected, if takes longer than 60s (60000ms) stop loading
            await page.goto(finalUrl, {waitUntil: 'domcontentloaded', timeout: 60000});


            //define CSS selector and wait until element appears on page, timeout after 30s(30000ms)
            const CSSselector = '[data-testid="listing-card"]';
            await page.waitForSelector(CSSselector, {timeout:30000});

            //extract data using selectors
            const pageData = await page.evaluate(() => {
                const data = [];
                const cards = document.querySelectorAll('[data-testid="listing-card"]');

                cards.forEach((card) => {
                    //attributes
                    const title = card.querySelector('[data-testid="listing-title"]')?.innerText || "n/a";
                    const price = card.querySelector('[data-testid="listing-price"]')?.innerText || "n/a";
                    const linkElement = card.querySelector('[data-testid="listing-link"]');
                    const link = linkElement ? linkElement.href : 'n/a';
                    const desc = card.querySelector('[data-testid="listing-description"]')?.innerText || "n/a";
                    const bedrooms = card.querySelector('[aria-label="Bedrooms"] p')?.innerText || "n/a";
                    const bathrooms = card.querySelector('[aria-label="Bathrooms"] p')?.innerText || "n/a";
                    const location = card.querySelector('[data-testid="listing-location"]')?.innerText || "n/a"; //*PROBLEM: this is only pulling the city not the actual address; 
                                                                                            // needs to go into each listing and access the postal code then figure out the address from the postal code
                    

                    data.push({
                        'Title': title,
                        'Price' : price,
                        'Bedrooms': bedrooms,
                        'Bathrooms': bathrooms,
                        'Location': location,
                        'Description': desc,
                        'URL': link
                    });
                    
                });
                return data;
            });

            dataList.push(...pageData);
            console.log(`found and collected ${pageData.legth} from page ${i}`);

        } catch (error) {
            console.error(`error fetching...likely blocked or slow`);
            console.error(`error message: ${error.message}`);
        } finally {
            await page.close();

            await new Promise(resolve => setTimeout(resolve, 5000)); //delay for good scrape
        }

    }
    console.log(`data collected. total collections: ${dataList.length}`);
}



//func to execute
async function main() {
    let browser;
     
    try{
        //launch browser with stealth plugin 
        browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            userDataDir: './user_data'
        });

        await scrapePages(browser); //scrape from search results page

        //save to CSV file
        if (dataList.length > 0) {
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(dataList);

            fs.writeFileSync(OUT_FILE, csv);
            console.log(`\n successful scrape and saved to ${OUT_FILE}`);
        } else {
            console.log("no data was scrapped")
        }
    } catch (error) {
        console.error("\n error in execute process")
        console.error(error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

main();