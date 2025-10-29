import sqlite3
import hashlib
import os

dbName = "prototype.db"
connection = sqlite3.connect(dbName)
cursor = connection.cursor()

#TABLE listings
command1 = """CREATE TABLE IF NOT EXISTS listings(
listingID INTEGER, 
title TEXT, 
price INTEGER, 
address TEXT,  
lat FLOAT, 
long FLOAT, 
bedrooms INTEGER, 
bathrooms INTEGER, 
desc TEXT, 
area INTEGER,
petFriendly BOOLEAN,
listingURL VARCHAR(500), 
source TEXT, 
type TEXT, uploaded BOOLEAN)"""

cursor.execute(command1)


#TABLE client
command2 = """CREATE TABLE IF NOT EXISTS client(
userID INTEGER PRIMARY KEY AUTOINCREMENT, 
username TEXT, 
email TEXT, 
password TEXT, 
preferences TEXT)"""

cursor.execute(command2)



#TABLE saved_listings
command3 = """CREATE TABLE IF NOT EXISTS saved_listings(
userID INTEGER, 
listingID INTEGER, 
dataSaved TEXT)"""

cursor.execute(command3)



#insert test listing

cursor.execute("""INSERT OR IGNORE INTO listings(
               listingID,
               title, 
               price, 
               address, 
               lat, 
               long, 
               bedrooms, 
               bathrooms, 
               desc, 
               area,
               petFriendly,
               listingURL, 
               source, 
               type, 
               uploaded
               ) 
               VALUES (
               1001,
               'Listing #1', 
               1800, 
               'ABC 567', 
               43.4735, 
               -80.5434, 
               2, 
               1, 
               'Close to WLU',
               1000,
               1, 
               'abc/test.com', 
               'Kijiji', 
               'Apartment',
                0
               );""")

cursor.execute("""INSERT OR IGNORE INTO listings(
               listingID,
               title, 
               price, 
               address, 
               lat, 
               long, 
               bedrooms, 
               bathrooms, 
               desc, 
               area,
               petFriendly,
               listingURL, 
               source, 
               type, 
               uploaded
               ) 
               VALUES (
               1002,
               'Listing #2', 
               2200, 
               'ABC 567', 
               43.4641, 
               -80.5242, 
               1, 
               1, 
               'Downtown Waterloo', 
               700,
               0,
               'abc/test.com', 
               'Realtor.ca', 
               'Condo',
                0
               );""")

cursor.execute("""INSERT OR IGNORE INTO listings(
               listingID,
               title, 
               price, 
               address, 
               lat, 
               long, 
               bedrooms, 
               bathrooms, 
               desc, 
               area,
               petFriendly,
               listingURL, 
               source, 
               type, 
               uploaded
               ) 
               VALUES (
               1003,
               'Listing #2', 
               2000, 
               'ABC 567', 
               43.4602, 
               -80.5151, 
               2, 
               2, 
               'Downtown Waterloo', 
               1000,
               1,
               'abc/test.com', 
               'Realtor.ca', 
               'House',
                0
               );""")

pw = hashlib.sha256("password123".encode()).hexdigest()
cursor.execute(f"""INSERT OR IGNORE INTO client (
                username,
                email,
                password,
                preferences
                )
                VALUES (
                'ManjeTest',
                'testEmail@gmail.com',
                '{pw}',
                '1 Bed, 2 Bath'
                );""")

#cursor.execute("DELETE FROM listings WHERE listingID = 1001")
#cursor.execute("DELETE FROM listings WHERE listingID = 1002")
#cursor.execute("DELETE FROM listings WHERE listingID = 1003")
#cursor.execute("SELECT * FROM listings")
#print(cursor.fetchall())
connection.commit()
connection.close()
