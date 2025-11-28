import streamlit as st
from firebase_utils import get_firebase

# ------------------------------------------------------------------------------
# Page config
# ------------------------------------------------------------------------------
st.set_page_config(
    page_title="Manje Rentals – Profile",
    page_icon="🏠",
    layout="wide"
)

# ------------------------------------------------------------------------------
# Firebase
# ------------------------------------------------------------------------------
auth, db = get_firebase()

# ------------------------------------------------------------------------------
# Header
# ------------------------------------------------------------------------------
st.markdown(
    """
    <h1 style='text-align: center; color: #2C3E50;'>🏠 MANJE RENTALS</h1>
    <h3 style='text-align: center; color: #5D6D7E;'>
        <i>Your profile & saved rentals.</i>
    </h3>
    <hr style='margin-top: 10px; margin-bottom: 30px;'>
    """,
    unsafe_allow_html=True
)

# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------
def require_login():
    """Ensure user is logged in; otherwise show message and stop."""
    if "user" not in st.session_state:
        st.warning("You must be logged in to view your profile. Go to the **Sign up** page to log in.")
        st.stop()
    return st.session_state["user"]


def load_user_data(uid, id_token):
    """Load the current user's profile document from Firebase."""
    try:
        snapshot = db.child("users").child(uid).get(id_token)
        return snapshot.val()
    except Exception as e:
        st.error("Could not load your profile from the database. "
                 "Try logging out and logging back in.")
        st.text(f"Debug info: {e}")
        st.stop()


def clear_saved_listings(uid, id_token):
    """Delete all saved listings for this user."""
    try:
        db.child("users").child(uid).child("saved_listings").remove(id_token)
    except Exception as e:
        st.error("Could not clear saved listings. Please try again.")
        st.text(f"Debug info: {e}")


# ------------------------------------------------------------------------------
# Main Profile Page
# ------------------------------------------------------------------------------
def profile_page():
    # 1) Ensure user is logged in
    user = require_login()
    uid = user["uid"]
    id_token = user["idToken"]

    # 2) Load profile data from Firebase
    user_data = load_user_data(uid, id_token) or {}

    first_name = user_data.get("first_name", "")
    last_name = user_data.get("last_name", "")
    full_name = user_data.get("full_name") or f"{first_name} {last_name}".strip()
    email = user_data.get("email", "")

    # 3) Layout: left column for profile info, right for saved listings
    col1, col2 = st.columns([1, 2])

    with col1:
        st.subheader("👤 Your Information")
        if full_name:
            st.write(f"**Name:** {full_name}")
        else:
            st.write("**Name:** (not set)")

        st.write(f"**Email:** {email}")

        # Simple future extension: editable names
        # if st.checkbox("Edit name"):
        #     new_first = st.text_input("First name", value=first_name or "")
        #     new_last = st.text_input("Last name", value=last_name or "")
        #     if st.button("Save name"):
        #         db.child("users").child(uid).update(
        #             {"first_name": new_first, "last_name": new_last,
        #              "full_name": f\"{new_first} {new_last}\"},
        #             id_token
        #         )
        #         st.success("Name updated. Reloading...")
        #         st.rerun()

        if st.button("Log out"):
            st.session_state.pop("user", None)
            st.rerun()

    with col2:
        st.subheader("⭐ Saved Listings")

        saved = user_data.get("saved_listings") or {}

        if not saved:
            st.info("You haven't saved any listings yet. "
                    "Go to the map and click **Save** on a listing you like.")
        else:
            # Button to clear everything
            if st.button("Clear all saved listings"):
                clear_saved_listings(uid, id_token)
                st.success("Saved listings cleared.")
                st.rerun()

            st.markdown("---")

            # Flexible handling: work whether saved_listings is
            # {id: True} or {id: {title, price, ...}}
            for listing_id, listing_value in saved.items():
                if isinstance(listing_value, dict):
                    title = listing_value.get("title", f"Listing {listing_id}")
                    price = listing_value.get("price", None)
                    address = listing_value.get("address", "")
                    url = listing_value.get("url", None)
                    beds = listing_value.get("bedrooms", None)
                    baths = listing_value.get("bathrooms", None)

                    with st.expander(f"{title} (ID: {listing_id})"):
                        if price is not None:
                            st.write(f"**Price:** ${price}")
                        if beds is not None or baths is not None:
                            st.write(f"**Bedrooms/Bathrooms:** {beds} / {baths}")
                        if address:
                            st.write(f"**Address:** {address}")
                        if url:
                            st.write(f"[View original listing]({url})")

                else:
                    # Fallback if you only stored a boolean or simple flag
                    st.write(f"- Listing ID: `{listing_id}`")

# Run page
profile_page()
