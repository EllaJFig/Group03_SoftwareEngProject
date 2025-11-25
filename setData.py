import csv
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from geopy.geocoders import Nominatim
import datetime

'''
end goal --> call this function to upload a single listings attributes to a table where the feilds are the following;
FIELDS;
    price,
    location,
    url,
    bedrooms,
    bathrooms,
    sqft,
    type,
    parking_info,
    source,

'''
geocoder_object = Nominatim(user_agent="long_lat")
def getCoords(address):
    loc = geocoder_object.geocode(address)
    if loc:
        return loc.longitude, loc.latitude
    else:
        return None, None
    

'''Opens csv file Kfilename ("KijijiScrapperData.csv")
    Open path to firebase
    Loop listing information from csv file, strip and set info
    Delete csv file when done
'''
def Kijiji_setdata(filename, fp):

    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        data_importing = [row for row in reader ]

    #connect to firebase
    if not firebase_admin._apps:
        cred = credentials.Certificate(fp)
        firebase_admin.initialize_app(cred)

    db = firestore.client()

    coll_ref = db.collection('listings')

    for i in data_importing:
        #call kijiji_setdata
        # Kijiji_setdata(i.get('price'))
        price = (i.get("Price")).replace("$", "").replace(",", "") #DONT PUT FLOAT; some listings have price as "Please Contact"
        location = i.get("Location", "").strip().lower()
        bedrooms = i.get("Bedrooms").replace("Bedrooms", "")
        bathrooms = i.get("Bathrooms").replace("Bathrooms","")
        type = i.get("Type").strip().lower()
        sqft = i.get("sqft").replace("sqft","").replace(",", "")
        parking = int(i.get("Parking").replace("Parking","").replace("Included","").replace("+","").strip())
        parking_available = "N"
        if (parking >= 1):
            parking_available = "Y"
        
        i["Price"] = price
        i["Location"] = location
        i["Bedrooms"] = bedrooms
        i["Bathrooms"] = bathrooms
        i["sqft"] = sqft
        i["Parking"] = parking_available
        i["Type"] = type
        i["Source"] = "Kijiji"
        i["savedBy"] = []
        i["Upload Date"] = datetime.date.today()

        # print(i.get("Price"))
        # print(i.get("Address"))
        # print(i.get("Bedrooms"))
        # print(i.get("Bathroooms"))
        # print(i.get("Sqft"))
        # print(i.get("Parking"))

        # print(f"\nChecking listing: Address='{location}', Price='{price}'")

        if not checkData(db, 'listings', location, price):
            coll_ref.add(i)
            # print("listing added\n")
        # else:
        #     print("duplicate detected\n")

    os.remove(filename)

def Rentalsca_setdata(filename,fp):
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        data_importing = [row for row in reader ]

    #connect to firebase
    if not firebase_admin._apps:
        cred = credentials.Certificate(fp)
        firebase_admin.initialize_app(cred)

    db = firestore.client()

    coll_ref = db.collection('listings')


    '''loop csv file'''
    for i in data_importing:
        location = i.get("Location", "").strip().lower()
        type = i.get("Type", "").lower()


        '''Gets highest price given'''
        priceList = (i.get("Price", "").replace("$","")).split("-")
        if (len(priceList) > 1):
            price = (priceList[1]).strip()
        else:
            price = (priceList[0]).strip()
    
        #print(price)


        features = i.get("Features", "")

        '''Gets largest number of Bedrooms'''
        bedsList = (features.split("Bed")[0]).split("-")
        if (len(bedsList) > 1):
            bedrooms = (bedsList[1]).strip()
        else:
            bedrooms = (bedsList[0]).strip()

        '''Gets largest number of Bathrooms'''
        bathsList = ((features.split("Bath")[0]).split("Bed")[-1]).split("-")
        if (len(bathsList) > 1):
            bathrooms = (bathsList[1]).strip()
        else:
            bathrooms = (bathsList[0]).strip()

        '''Gets largest Squarefeet size'''
        sqftList = ((features.split("FT")[0]).split("Bath")[-1].strip()).split("-")
        if (len(sqftList) > 1):
            sqft = (sqftList[1]).strip()
        else:
            sqft = (sqftList[0]).strip()

        '''set parking as No until more resources are available'''
        parking = "N"
        #print(beds)
        #print(baths)
        #print(sqft)

        i["Price"] = price
        i["Location"] = location
        i["Bedrooms"] = bedrooms
        i["Bathrooms"] = bathrooms
        i["sqft"] = sqft
        i["Parking"] = parking
        i["Type"] = type
        i["Source"] = "Rentals.ca"
        i["savedBy"] = []
        i["Upload Date"] = datetime.date.today()

        '''remove Features feild'''
        i.pop("Features", None)
        
        if not checkData(db, 'listings', location, price):
            coll_ref.add(i)
            # print("listing added\n")
        # else:
        #     print("duplicate detected\n")

    os.remove(filename)


        
def checkData(db, collection, address, price):
    coll_ref = db.collection(collection)
    # q = coll_ref.where("address", "==", new_listing.get("address")) \
    #     .where("price", "==", new_listing.get("price"))

    q = coll_ref.where(filter=firestore.FieldFilter("Location", "==", address)) \
        .where(filter=firestore.FieldFilter("Price", "==", price))
    
    duplicate = list(q.limit(1).stream())
    return len(duplicate)>0

#filepath to key

fp = r"" #INSERT YOUR FILE PATH TO THE FIREBASE DATABASE FROM YOUR DIVICE
Kfilename = "KijijiScrapperData.csv" 
Rfilename = "RentalscaScrapperData.csv"

'''RUN WHEN RENTALS DATA'''
#Rentalsca_setdata(Rfilename, fp)

'''RUN WHEN KIJIJI DATA'''
#Kijiji_setdata(Kfilename,fp)


