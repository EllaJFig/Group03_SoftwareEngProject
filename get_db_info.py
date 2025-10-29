import database
import sqlite3

class Listing:
 
    #get data
    def get_data(self):

        connection = sqlite3.connect(database.dbName) #database; fix later to make global name
        connection.row_factory = sqlite3.Row #get row
        cursor = connection.cursor() 

        #get listings that havent been looked at yet
        cursor.execute("SELECT * FROM listings;")
        
        recent_row = cursor.fetchall()
        
        listing_to_map = []

        for row in recent_row:
            #set listing data
            listing_data= {
                'name': row['title'],
                'lat': float(row['lat']),
                'lon': float(row['long']), 
                'price': row['price'], 
                'address': row['address'],
                'bedrooms': row['bedrooms'], 
                'bathrooms': row['bathrooms'], 
                'type': row['type'],
                'desc': row['desc'], 
                'area': row['area'],
                'petFriendly': row['petFriendly'],
                'listingURL': row['listingURL'], 
                'source': row['source'], 
                'popup': (f"<b>{row['title']} </b><br>${row['price']}/month<br>{row['bedrooms']} Bed • {row['bathrooms']} Bath<br>{row['desc']}") }
            listing_to_map.append(listing_data)


        connection.commit()
        connection.close()

        return listing_to_map
        


