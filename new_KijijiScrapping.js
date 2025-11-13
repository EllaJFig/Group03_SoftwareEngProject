// for stealth so kijiji doesnt kick us out
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

//will convert scrapped data into string format, allow to write to final CSV data, and make sure files path is constructed right
const {Parser} = require('json2csv');
const fs = require('fs');
const path = require('path');

//set up variables
const URL = 'http://www.kijiji.ca';

const SEARCH_URL = 'http://www.kijiji.ca/b-apartments-condos/canada'; //this line should be changed to be more dynamic (maybe ask user for location they are looking for and insert that info accordingly into URL)
const PAGE_PRE = '/pages-';
const PAGE_SUF = '/c37l0'; //this value will change based on useres needs (this ex. is where 'c37' is for Apartment & Condos and '10' is for Canada)
const PAGES_TO_SCRAPE = 3; //we can shorten or lengthen depending
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
                    const location = card.querySelector('[data-testid="listing-location"]')?.innerText || "n/a";
                    const address = card.querySelector('[data-testid="listing-address"]')?.innerText || "n/a";
                    

                    data.push({
                        'Title': title,
                        'Price' : parseFloat(price.replace(/[^0-9.]/g, ''))||0,
                        'Bedrooms': bedrooms,
                        'Bathrooms': bathrooms,
                        'Location': location,
                        'Description': desc,
                        'URL': link,
                        'Address': address
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