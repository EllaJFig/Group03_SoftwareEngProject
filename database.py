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
        
        with open(filename, 'r') as file:
            reader = csv.DictReader(file)
            data_importing = [row for row in reader ]
        
        cred = credentials.Certificate(fp)
        firebase_admin.initialize_app(cred)

        db = firestore.client()

        coll_ref = db.collection('listings')

        for i in data_importing:
             coll_ref.add(i)
        
        
#filepath to key
fp = r"/Users/ejfig/Desktop/group03softengproj-firebase-adminsdk-fbsvc-6dc0225bd0.json"
filename = "kijiji_data.csv" #maybe we change this to work with both files


saveToFB(filename, fp)



