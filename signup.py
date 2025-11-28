import streamlit as st
import re
from firebase_utils import get_firebase

# ------------------------------------------------------------------------------
# Page config
# ------------------------------------------------------------------------------
st.set_page_config(
    page_title="Manje Rentals – Account",
    page_icon="🏠",
    layout="wide"
)

# ------------------------------------------------------------------------------
# Firebase initialization
# ------------------------------------------------------------------------------
auth, db = get_firebase()

# ------------------------------------------------------------------------------
# Email validation helper
# ------------------------------------------------------------------------------
def is_valid_email(email: str) -> bool:
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None

# ------------------------------------------------------------------------------
# Header (matches your home.py styling)
# ------------------------------------------------------------------------------
st.markdown(
    """
    <h1 style='text-align: center; color: #2C3E50;'>🏠 MANJE RENTALS</h1>
    <h3 style='text-align: center; color: #5D6D7E;'>
        <i>Sign up or log in to access your personalized profile.</i>
    </h3>
    <hr style='margin-top: 10px; margin-bottom: 30px;'>
    """,
    unsafe_allow_html=True
)

# ------------------------------------------------------------------------------
# Authentication page
# ------------------------------------------------------------------------------
def auth_page():

    # Already logged in → show banner + logout button
    if "user" in st.session_state:
        user = st.session_state["user"]
        st.success(f"Already logged in as {user['email']}")

        if st.button("Log out"):
            st.session_state.pop("user", None)
            st.rerun()
        return

    # Toggle Login / Sign up
    mode = st.radio("Choose an option:", ["Login", "Sign up"], horizontal=True)

    email = st.text_input("Email")
    password = st.text_input("Password", type="password")

    # Extra fields only for Sign up
    first_name = last_name = confirm_password = None
    if mode == "Sign up":
        cols = st.columns(2)
        with cols[0]:
            first_name = st.text_input("First name")
        with cols[1]:
            last_name = st.text_input("Last name")
        confirm_password = st.text_input("Confirm password", type="password")

    # When user presses Login or Sign up
    if st.button(mode):

        # Basic field validation
        if not email or not password:
            st.error("Please fill in both email and password.")
            return

        # Email format validation
        if not is_valid_email(email):
            st.error("Please enter a valid email address.")
            return

        # -----------------------------
        # SIGN UP FLOW
        # -----------------------------
        if mode == "Sign up":
            # Extra validation for signup-only fields
            if not first_name or not last_name:
                st.error("Please enter both your first name and last name.")
                return

            if not confirm_password:
                st.error("Please confirm your password.")
                return

            if password != confirm_password:
                st.error("Passwords do not match. Please re-enter them.")
                return

            try:
                # 1) Create user in Firebase Auth
                created = auth.create_user_with_email_and_password(email, password)
                uid = created["localId"]

                # 2) Log them in immediately to obtain idToken
                login_user = auth.sign_in_with_email_and_password(email, password)
                id_token = login_user["idToken"]

                # 3) Create user profile in Realtime DB
                full_name = f"{first_name} {last_name}"
                db.child("users").child(uid).set(
                    {
                        "email": email,
                        "first_name": first_name,
                        "last_name": last_name,
                        "full_name": full_name,  # convenient combined name
                        "saved_listings": {}
                    },
                    id_token
                )

            except Exception as e:
                error_str = str(e)

                if "EMAIL_EXISTS" in error_str:
                    st.error("An account with this email already exists. Try logging in instead.")
                elif "WEAK_PASSWORD" in error_str:
                    st.error("Your password is too weak. Please choose a stronger one.")
                else:
                    st.error("Something went wrong while creating your account. Please try again.")
                return

            # 4) Store session and rerun (outside try so rerun exception isn't caught)
            st.session_state["user"] = {
                "uid": uid,
                "email": email,
                "idToken": id_token
            }

            st.success("Account created and logged in successfully!")
            st.rerun()

        # -----------------------------
        # LOGIN FLOW
        # -----------------------------
        else:
            try:
                login_user = auth.sign_in_with_email_and_password(email, password)
                uid = login_user["localId"]
                id_token = login_user["idToken"]

            except Exception as e:
                error_str = str(e)

                if "INVALID_LOGIN_CREDENTIALS" in error_str or "EMAIL_NOT_FOUND" in error_str:
                    st.error("The email and password do not match. Please try again.")
                elif "USER_DISABLED" in error_str:
                    st.error("This account has been disabled. Please contact support.")
                else:
                    st.error("Something went wrong while logging in. Please try again.")
                return

            # Successful login
            st.session_state["user"] = {
                "uid": uid,
                "email": email,
                "idToken": id_token
            }

            st.success("Logged in successfully!")
            st.rerun()


# Run the page
auth_page()
