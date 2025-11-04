import requests
from bs4 import BeautifulSoup

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

#filepath to key
fp = r"/Users/ejfig/Desktop/group03softengproj-firebase-adminsdk-fbsvc-6dc0225bd0.json"

'''testing data
data = {
    'title': 'testing123',
    'address': 'thisisatest'
}
'''

#setting data into database --> doc_ref.set(data)

# printing ID --> print("Document ID: ", doc_ref.id)

class StoreData():
   

    '''
    end goal --> call this function to upload a single listings attributes to a table where the feilds are the following;
    FIELDS;
        title
        price
        address
        lat
        long
        bedrooms
        bathrooms
        desc
        area 
        petFriendly
        listingURL
        source 
        type
    
    
    def saveToFB(listing):
        pass
    '''

def scrapTest():
    fp = r"/Users/ejfig/Desktop/group03softengproj-firebase-adminsdk-fbsvc-6dc0225bd0.json"

        #connection to firebase database
    cred = credentials.Certificate(fp)
    firebase_admin.initialize_app(cred)

    #pointer
    db = firestore.client()

    url = "https://www.kijiji.ca/b-real-estate/canada/c34l0?view=list"
    res = requests.get(url)
    soup = BeautifulSoup(res.content, 'lxml')

    scr_data = []
    scr_data.append({'title': 'testing', 'source_url': 'abcd.com'})
    
    for h in soup.find_all('all'):
        scr_data.append({'title': h.text.strip(), 'source_url':url})

    #adding to collection
    doc_ref = db.collection('listingsCollection').document()

    for i in scr_data:
        doc_ref.set(i)

scrapTest()



