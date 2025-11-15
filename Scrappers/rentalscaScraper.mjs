import { AbsScraper } from './abstractScrapper.mjs';

const CONFIG_RENTALSCA= {
    URL: 'http://www.rentals.ca',
    SEARCH_URL: 'https://rentals.ca/waterloo', //this line should be changed to be more dynamic (maybe ask user for location they are looking for and insert that info accordingly into URL)
    PAGE_PRE: '/p=',
    PAGES_TO_SCRAPE: 4, //we can shorten or lengthen depending
};

const SELECTORS_RENTALSCA = { //specific HTML call information for rentals.ca
    LISTING_CONT: 'listing-card-container col-12',
    INFO_CONT:'listing-card__main-features',
    TYPE: 'listing-card__type',
    PRICE: 'listing-card__price',
    ADDRESS: 'listing-card__title',
    LINK: 'listing-card__details-link',
};

//NOT SET UP YET
export class RentalscaScraper extends AbsScraper {

    //call abstract class to get url outline and save configuration variables + create dataList to store all listing info
    constructor(OUT_FILE) {
        super(CONFIG_RENTALSCA.URL, OUT_FILE);
        this.config = CONFIG_RENTALSCA;
        this.dataList = [];
    }

    //build full url for page
    buildURL(PAGES_TO_SCRAPE) {
        return `${this.config.URL}${this.config.SEARCH_URL}${this.config.PAGE_PRE}${this.config.PAGE_SUF}`
    }

    //gets listting data for a single page
    async scrapePage(){
        await this.page.waitForSelector(this.selector.LISTING_CONT,{timeout: 15000});

        const pageData = await this.page.evaluate((selectors) => {

            const listings = [];
            const containers = document.querySelectorAll(selectors.LISTING_CONT);
            
        })
    }
}