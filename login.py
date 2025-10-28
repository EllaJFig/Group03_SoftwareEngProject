import sqlite3
# import re
import database
import hashlib

# dbName = "prototype.db"

# email_exp = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,}$'

# def user_password(password):
#     return hashlib.sha256(password.encode()).hexdigest()

# def check_email_syntax(email):
#     if re.match(email_exp, email):
#         if not find_email_db(email):
#             return True
#         else:
#             print(f"Email already exists ")
#             return False
#     else:
#         return False
#         exit

# def find_email_db(email):

#     try:
#         connection = sqlite3.connect(database.dbName)
#         cursor = connection.cursor()
#         cursor.execute("SELECT COUNT(*) FROM client WHERE email =?;", (email,))
#         exists = cursor.fetchone()[0] >0
#         return exists   #this will return true if the email exists
    
#     except sqlite3.Error as e:
#         print(f"Database error")
#         return False

#     finally:
#         cursor.close()
#         connection.close()

# set()
# get()

# def add_user_db(username, email, password):
#     try:
#         if not check_email_syntax(email):
#             return
#         connection = sqlite3.connect(database.dbName)
#         cursor = connection.cursor()
#         pw = user_password(password)
#         cursor.execute(
#             "INSERT INTO client (username, email, password) VALUES (?, ?, ?);", 
#             (username, email, pw)
#         )
#         connection.commit()
    
#     except sqlite3.Error as e:
#         print(f"Database error")

#     finally:
#         cursor.close()
#         connection.close()

# def list_emails():
#     try:
#         connection = sqlite3.connect(database.dbName)
#         cursor = connection.cursor()
#         cursor.execute("SELECT userID, username, email FROM client;")
#         users = cursor.fetchall()
#         return users
#     except sqlite3.Error as e:
#         print(f"Database error")
#         return None
#     finally:
#         cursor.close()
#         connection.close()c

class Client:

    def __init__(self, email, password):
        self.email = email
        self.password = password

    def user_password(self,password):
        return hashlib.sha256(password.encode()).hexdigest()

    def find_email_db(self):

        try:
            connection = sqlite3.connect(database.dbName)
            cursor = connection.cursor()
            cursor.execute("SELECT password FROM client WHERE email =?;", (self.email,))
            exists = cursor.fetchone()
            if exists:
                return self.check_pw(exists[0])
            else:
                print(f"Email does not exist")
                return False
        
        except sqlite3.Error as e:
            print(f"Database error")
            return False

        finally:
            cursor.close()
            connection.close()

    def check_pw(self, pw_from_db):
        input_pw = self.user_password(self.password)
        if input_pw == pw_from_db:
            return True
        else:
            print("Incorrect password")
            return False

if __name__ == "__main__":
    client = Client("test123@gmail.com", "password123")
    client.find_email_db()