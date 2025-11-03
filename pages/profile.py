import streamlit as st
from login import Client
from signup import NewClient

st.set_page_config(page_title="User Account", page_icon="👤")
st.title("👤 Manje Rentals — Account Portal")

# Dashboard Function
def show_dashboard():
    """Display the profile/dashboard page for logged-in users."""
    st.success(f"Welcome, {st.session_state['user_email']}!")

    # --- Saved Listings Section ---
    st.header("Saved Listings")
    # TODO: Replace with actual database query for saved listings
    saved_listings = ["Apartment 1", "Apartment 2", "Apartment 3"]
    if saved_listings:
        for listing in saved_listings:
            st.write(f"🏠 {listing}")
    else:
        st.write("You have no saved listings yet.")

    # --- Account Details Section ---
    st.header("Account Details")
    # Example details, can be fetched from database
    st.text(f"Email: {st.session_state['user_email']}")

    # Logout
    if st.button("Logout"):
        del st.session_state["user_email"]
        st.success("Logged out successfully.")


# Main Function
if "user_email" in st.session_state:
    # User is logged in
    show_dashboard()
else:
    # Login / Sign Up selection
    option = st.radio("Select Option", ["Login", "Sign Up"])

    if option == "Login":
        st.subheader("Login")
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")

        if st.button("Login"):
            client = Client(email, password)
            if client.find_email_db():
                st.session_state["user_email"] = email
                st.success("✅ Login successful!")
                show_dashboard()
            else:
                st.error("❌ Invalid email or password")

    elif option == "Sign Up":
        st.subheader("Create Account")
        first = st.text_input("First Name")
        last = st.text_input("Last Name")
        email = st.text_input("Email")
        confirm_email = st.text_input("Confirm Email")
        password = st.text_input("Password", type="password")
        confirm_password = st.text_input("Confirm Password", type="password")

        if st.button("Create Account"):
            user = NewClient(first, last, email, confirm_email, password, confirm_password)
            if user.add_user_to_db():
                st.success("✅ Account created! Please log in.")
            else:
                st.error("❌ Could not create account.")
