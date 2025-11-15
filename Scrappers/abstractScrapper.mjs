import puppeteer from 'puppeteer-extra';
import {createObjectCsvWriter} from 'csv-writer';

export class AbsScraper {

    constructor(config, selectors) {
        if (new.target === AbsScraper)
            throw new Error ("cant be instantiated direcly");
        this.config = config;
        this.selectors = selectors;
        this.browser = null;
        this.page = null;
    }

    //override funcs
    buildURL(pageNumber) {
       throw new Error("implement a buildURL method");
    }

    async scrollPage(){
        throw new Error("implement scrollPage method ");
    }

    async scrapePage() {
        throw new Error("no child class has been implemented for scrapePage()");
    }

    async scrapeAddress(url) {
        return null;
    }

    //generic methods
    async getText(element,selector) {
        const found = await element.$(selector);
        if (!found) return null;
        return await element.$eval(selector,el => el.innerText.trim());
    }

    async getAttribute(element,selector, attribute) {
        const found = await element.$(selector);
        if (!found) return null;
        return await element.$eval(selector, (el,attribute) => el.getAttribute(attribute), attribute);
    }


    //save results to csv
    async saveCSV(data, filename = 'scraped_data.csv') {
        if (data.length === 0){
            console.log("no data written to csv");
            return;
        } 

        const header = Object.keys(data[0]).map(key => ({
            id: key,
            title: key.replace(/_/g, ' ').toUpperCase()
        }));

        const csvWriter = createObjectCsvWriter({
            path: filename,
            header: header
        });
        
        console.log(`writting ${data.length} listings `);
        await csvWriter.writeRecords(data);
        console.log('done writting');

    }
    //closing browser
    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            console.log("closed broswser");
        }
    }

    //execute function that will run either file
    async execute() {
        let allData =[];

        try {
            
            this.browser = await puppeteer.launch({headless: true});
            this.page = await this.browser.newPage();

            for (let i = 1; i<= this.config.PAGES_TO_SCRAPE; i++) {
                const url = this.buildURL(i);
                console.log('Navigating to page');
                await this.page.goto(url, {waitUntil: 'networkidle2', timeout: 60000});

                await this.scrollPage();

                const pageData = await this.scrapePage();

                if (!pageData || pageData.length === 0) {
                    console.log(`Page ${i} had no listings continue...`);
                    continue;
                }

                if (this.scrapeAddress !== AbsScraper.prototype.scrapeAddress) {
                    for (let listing of pageData) {
                        listing.address = await this.scrapeAddress(listing.url);
                    }
                }
                
                allData.push(...pageData);
                console.log(`scrapped ${pageData.length} listings`)
            }

            await this.saveCSV(allData);
            return allData;

        } catch(error) {
            console.error("error happened during execution", error);
            return [];
        } 
    }
}
