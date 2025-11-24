import sqlite3
import setData
import hashlib
class Client:

    def __init__(self, email, password):
        self.email = email
        self.password = password

    def user_password(self,password):
        return hashlib.sha256(password.encode()).hexdigest()

    def find_email_db(self):

        try:
            connection = sqlite3.connect(setData.dbName)
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
