import sqlite3
import database
import hashlib
from login import Client

def find_email_db(email):

        try:
            connection = sqlite3.connect(database.dbName)
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM client WHERE email =?;", (email,))
            exists = cursor.fetchone()[0]>0
            return exists
            
        finally:
            cursor.close()
            connection.close()

class NewClient:

    def __init__(self, first_name, last_name, email, confirm_email, password, confirm_password):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.confirm_email = confirm_email
        self.password = password
        self.confirm_password = confirm_password
        self.password = password


    def check_info(self):
        if self.email != self.confirm_email:
            print("Emails do not match")
            return False
        if self.password != self.confirm_password:
            print("Passwords do not match")
            return False
        if find_email_db(self.email):
            print("Email already exists. Please log in.")
            return False
        return True
    


    def add_user_to_db(self):
        if not self.check_info():
            return False
        
        try:
            connection = sqlite3.connect(database.dbName)
            cursor = connection.cursor()
            username = f"{self.first_name} {self.last_name}"
            password = Client(self.email, self.password).user_password(self.password)
            cursor.execute("INSERT INTO client (username, email, password) VALUES (?,?,?);", (username, self.email, password))
            connection.commit()
            return True
        
        except sqlite3.Error as e:
            print(f"Database error")
            return False

        finally:
            cursor.close()
            connection.close()

if __name__ == "__main__":
    new_client = NewClient(
        first_name= "Manje",
        last_name= "Test",
        email= "manje@gmail.com",
        confirm_email= "manje@gmail.com",
        password= "manje@123",
        confirm_password= "manje@123"
    )
    new_client.add_user_to_db()