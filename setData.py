import csv

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from geopy.geocoders import Nominatim


'''
end goal --> call this function to upload a single listings attributes to a table where the feilds are the following;
FIELDS;
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
    address,
    source,

'''
geocoder_object = Nominatim(user_agent="long_lat")
def getCoords(address):
    loc = geocoder_object.geocode(address)
    if loc:
        return loc.longitude, loc.latitude
    else:
        return None, None
    
def Kijiji_setdata():
    pass

def saveToFB(filename, fp):
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
        price = float((i.get("Price")).replace("$", "").replace(",", ""))
        address = i.get("Address", "").strip().lower()
        bedrooms = i.get("Bedrooms").replace("Bedrooms", "")
        bathrooms = i.get("Bathrooms").replace("Bathrooms","")
        sqft = i.get("Sqft").replace("sqft","").replace(",", "")
        parking = int(i.get("Parking").replace("Parking","").replace("Included","").replace("+","").strip())
        parking_available = "N"
        if (parking >= 1):
            parking_available = "Y"
        
        i["Price"] = price
        i["Address"] = address
        i["Bedrooms"] = bedrooms
        i["Bathrooms"] = bathrooms
        i["Sqft"] = sqft
        i["Parking"] = parking_available

        # print(i.get("Price"))
        # print(i.get("Address"))
        # print(i.get("Bedrooms"))
        # print(i.get("Bathroooms"))
        # print(i.get("Sqft"))
        # print(i.get("Parking"))

        # print(f"\nChecking listing: Address='{address}', Price='{price}'")

        if not checkData(db, 'listings', address, price):
            coll_ref.add(i)
            # print("listing added\n")
        # else:
        #     print("duplicate detected\n")
        
        
def checkData(db, collection, address, price):
    coll_ref = db.collection(collection)
    # q = coll_ref.where("address", "==", new_listing.get("address")) \
    #     .where("price", "==", new_listing.get("price"))

    q = coll_ref.where(filter=firestore.FieldFilter("Address", "==", address)) \
        .where(filter=firestore.FieldFilter("Price", "==", price))
    
    duplicate = list(q.limit(1).stream())
    return len(duplicate)>0

#filepath to key

fp = r"/Users/aasthapunj/Downloads/group03softengproj-firebase-adminsdk-fbsvc-2c7834f25a.json" #INSERT YOUR FILE PATH TO THE FIREBASE DATABASE FROM YOUR DEVICE
filename = "KijijiScrappedData.csv" #this will be both scrappers saved into one file


saveToFB(filename, fp)



