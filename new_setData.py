import csv

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


'''
end goal --> call this function to upload a single listings attributes to a table where the feilds are the following;
FIELDS;
    bathrooms
    bedrooms
    desc
    location
    price
    title
    url

'''


def saveToFB(filename, fp):
        
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        data_importing = [row for row in reader ]

    if not firebase_admin._apps:
        cred = credentials.Certificate(fp)
        firebase_admin.initialize_app(cred)

    db = firestore.client()

    coll_ref = db.collection('listings')

    for i in data_importing:
        price = i.get("Price", "").strip()
        address = i.get("Address", "").strip().lower()
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

fp = r"/Users/aasthapunj/Downloads/group03softengproj-firebase-adminsdk-fbsvc-2c7834f25a.json"
filename = "kijiji_data.csv" #maybe we change this to work with both files


saveToFB(filename, fp)



