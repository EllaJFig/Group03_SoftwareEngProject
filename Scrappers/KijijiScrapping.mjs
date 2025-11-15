import { AbsScraper } from './abstractScrapper.mjs';

const CONFIG_KJIJI = {
    URL: 'https://www.kijiji.ca/', //DO NOT CHANGE THIS URL
    SEARCH_URL: '/b-apartments-condos/canada', //this line should be changed to be more dynamic (maybe ask user for location they are looking for and insert that info accordingly into URL)
    PAGE_PRE: '/pages-',
    PAGE_SUF: '/c37l', //this is the code for long term rentals 
    PAGES_TO_SCRAPE: 4, //we can shorten or lengthen depending
};

const SELECTORS_KIJIJI = { //specific HTML call information for kijiji (DO NOT CHANGE THESE VALUES)
    LISTING_CONT: 'section[data-testid="listing-card"]',
    TITLE: 'h3[data-testid="listing-title"]',
    PRICE: 'p[data-testid="listing-price"]',
    LOCATION: 'p[data-testid="listing-location"]',
    LINK: 'a[data-testid="listing-link"]',
    BEDS_INFO: 'li[aria-label="Bedrooms"]',
    BATHS_INFO: 'li[aria-label="Bathrooms"]',
    TYPE: 'li[aria-label="Unit type"]',
    PARKING_INFO: 'li[aria-label="Parking included"]',
    SQFEET: 'li[aria-label="Size (sqft)"]',
    PET_FRIENDLY: 'li[aria-label="Pets friendly"]',
    ADDRESS_BUTTON: 'button[style*="text-align: left"]',
};

export class KijijiScraper extends AbsScraper {

    //call abstract class to get url outline and save configuration variables + create dataList to store all listing info
    constructor() {
        super(CONFIG_KJIJI, SELECTORS_KIJIJI);
        this.dataList = [];
    }

     //build full url for page
    buildURL(pageNumber) {
        if (pageNumber === 1) {
             return `${this.config.URL}${this.config.SEARCH_URL}${this.config.PAGE_SUF}`;
        }
        return `${this.config.URL}${this.config.SEARCH_URL}${this.config.PAGE_PRE}${pageNumber}${this.config.PAGE_SUF}`;
    }

    //scroll page
    async scrollPage() {
        console.log("scrolling page");

        for (let i = 0; i < 3; i++) {
            await this.page.evaluate(() => {
                window.scrollBy(0, window.innerHeight *5); // scroll down 5 times the viewport height
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        console.log("scrolling completer ");
    }
    
    async scrapeAddress(url) {
        if (url === "N/A") {
            return "N/A";
        }
        

        let address = "N/A";

        try {
            await this.page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            const addressSelector = this.selectors.ADDRESS_BUTTON;
            await this.page.waitForSelector(addressSelector, {timeout: 10000});

            address = await this.page.$eval(
                addressSelector,
                el => el.innerText.trim()
            );

            if (address.toLowerCase().includes('map')) {
                address = address.split('\n').trim();
            }

            return address;
            
        } catch (e) {
            console.warn(`couldnt scrape from ${url}; Error: ${e.message}`);
            return "N/A"
        } 
    }

    //gets listting data for a single page
    async scrapePage(){
        console.log("extract data");
       
        try { 
            await this.page.waitForSelector(this.selectors.LISTING_CONT,{timeout: 30000});

        } catch(e) {
            console.warn("debug listing cont selector");
            return [];
        } 
        
        const results = await this.page.evaluate((selectors, kijijiBaseUrl) => {
            
            const getAttValue = (container, selector) => {
                const el = container.querySelector(selector);
                const valueEl = el?.querySelector('p');
                return valueEl ? valueEl.innerText.trim() : "N/A";
            };
            
            const listings = [];
            const containers = document.querySelectorAll(selectors.LISTING_CONT);
            
            containers.forEach(container => {
                    
                const getText = (selector) => {
                        const el = container.querySelector(selector);
                        return el ? el.innerText.trim() : "N/A";
                };

                const title = getText(selectors.TITLE);
                const location = getText(selectors.LOCATION);

                const rawPrice = getText(selectors.PRICE);
                const price = rawPrice.replace(/[^0-9.]/g, '') || "N/A";

                const linkEl = container.querySelector(selectors.LINK);
                const extractedUrl = linkEl ? linkEl.getAttribute('href') : null;
                let url = "N/A";

                if (extractedUrl) {
                    if (extractedUrl.startsWith('http')) {
                        url = extractedUrl;
                    } else {
                        url = `${kijijiBaseUrl}${extractedUrl}`
                    }
                }


                let bedrooms = getAttValue(container,selectors.BEDS_INFO);
                let bathrooms = getAttValue(container,selectors.BATHS_INFO);
                let sqfeet = getAttValue(container,selectors.SQFEET);
                let type = getAttValue(container,selectors.TYPE);
                let parking_info = getAttValue(container,selectors.PARKING_INFO);
                let pet_friendly = getAttValue(container,selectors.PET_FRIENDLY);

                listings.push({
                    title,
                    price,
                    location,
                    url,
                    bedrooms,
                    bathrooms,
                    square_feet: sqfeet,
                    type,
                    parking_info,
                    pet_friendly,
                    address: "placeholder",
                    source: "Kijiji",
                });
            });
            return listings;
        }, this.selectors, this.config.URL);

        console.log("extaction complete");
        return results || [];
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            console.log("closing broswer");
        }
    }

}


