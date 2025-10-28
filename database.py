import sqlite3

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
listingURL VARCHAR(500), 
source TEXT, 
dateScrapped DATETIME, uploaded BOOLEAN)"""

cursor.execute(command1)


#TABLE client
command2 = """
CREATE TABLE IF NOT EXISTS client(
userID INTEGER PRIMARY KEY AUTOINCREMENT, 
username TEXT, 
email TEXT, 
passward TEXT, 
preferences TEXT)"""

cursor.execute(command2)

#TABLE saved_listings
command3 = """
CREATE TABLE IF NOT EXISTS saved_listings(
userID INTEGER, 
listingID INTEGER, 
dataSaved TEXT)"""

cursor.execute(command3)

#insert test listing
'''cursor.execute("""INSERT INTO listings(
               listingID,
               title, 
               price, 
               address, 
               lat, 
               long, 
               bedrooms, 
               bathrooms, 
               desc, 
               listingURL, 
               source, 
               dateScrapped, 
               uploaded
               ) 
               VALUES (
               1001,
               'test2', 
               1800, 
               'ABC 567', 
               43.4735, 
               -80.5434, 
               2, 
               1, 
               'Close to WLU', 
               'abc/test.com', 
               'Kijiji', 
               '2015-05-02 10:05:02',
                0
               );""")

'''

#cursor.execute("DELETE FROM listings WHERE title = 'test1'")
#cursor.execute("SELECT * FROM listings")
#print(cursor.fetchall())
connection.commit()
connection.close()
