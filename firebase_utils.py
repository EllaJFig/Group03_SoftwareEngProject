# firebase_utils.py
import streamlit as st
import pyrebase

@st.cache_resource
def get_firebase():
    """
    Initialize Firebase and return (auth, db).
    Cached so Streamlit doesn't re-init on every rerun.
    """
    cfg = st.secrets["firebase"]

    config = {
        "apiKey": cfg["apiKey"],
        "authDomain": cfg["authDomain"],
        "projectId": cfg["projectId"],
        "storageBucket": cfg["storageBucket"],
        "messagingSenderId": cfg["messagingSenderId"],
        "appId": cfg["appId"],
        "databaseURL": cfg["databaseURL"],   # for Realtime DB
    }

    firebase = pyrebase.initialize_app(config)
    auth = firebase.auth()
    db = firebase.database()
    return auth, db