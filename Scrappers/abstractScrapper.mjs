
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

    //going to url func --> takes url
    async buildUrl(pageNumber) {
       throw new Error("implement a buildURL method");
    }

    //scrolling page func 
    async scrollPage(){
        throw new Error("implement scrollPage method ");
    }

    //saving to csv func --> takes data and output file name
    async saveCSV(data, filename = 'scraped_data.csv') {
        if (data.length === 0){
            console.log("no data written to csv");
            return;
        } 

        const header =Object.keys(data[0]).map(key => ({
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

    //execute function that will run either file
    async execute() {
        let allData =[];

        try {
            const puppeteer = await import('puppeteer');
            this.browser = await puppeteer.launch({headless: true});
            this.page = await this.browser.newPage();

            for (let i = 1; i<= this.config.PAGES_TO_SCRAPE; i++) {
                const url = this.buildUrl(i);
                console.log('Navigating to page');
                await this.page.goto(url, {waitUntil: 'networkkidle2', timeout: 60000});

                const pageData = await this.scrollPage();
                if (pageData.length === 0) {
                    console.log('no new listings...stopped');
                    break;
                }

                allData = allData.concat(pageData);
                console.log(`scrapped ${pageData.length} listings`)
            }

            return allData;
        } catch(error) {
            console.error("error happened during execution", error);
            return [];
        } finally {
            if (this.browser) {
                await this.browser.close();
                console.log("closed browser");
            }
        }
    }
}
