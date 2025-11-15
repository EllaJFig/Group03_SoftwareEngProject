import { KijijiScraper } from "./KijijiScrapping.mjs";
//import { RentalscaScraper } from "./rentalscaScraper.mjs";

async function runScrapsAndSave() {
    let combinedData = [];

    console.log("starting kijiji scrapper");
    const kijijiScraper = new KijijiScraper();
    const initialData = await kijijiScraper.execute();

    console.log(`k collected ${initialData.length} listings`);

    const finalKijijData = [];
    for (const listing of initialData) {
        if (listing.url !== "N/A") {
            listing.address = await kijijiScraper.scrapeAddress(listing.url);
        }
        finalKijijData.push(listing);
    }

    
    combinedData = combinedData.concat(finalKijijData);
    console.log("k collected full listings");

    // console.log("stating rentals.ca scrapper");
    //const rentalscaScraper = new RentalscaScraper();
    //const rentalscaData = await rentalscaScraper.execute();

    //combinedData = combinedData.concat(rentalscaData);
    //console.log(`r collected ${rentalscaData.length} listings`);

    if (combinedData.length > 0) {

        console.log(`saving ${combinedData.length}`);
        await utilityInstance.saveCSV(combinedData, 'scraped_data.csv');
    } else {
        console.log("no data collected");
    }

    await kijijiScraper.closeBrowser();
}

runScrapsAndSave();