import streamlit as st
from streamlit_folium import st_folium
import folium
import get_db_info



# config ------------------------------------------------------------------------
st.set_page_config(
    page_title="CP317 Manje Demo",
    page_icon="🏠",
    layout="wide"  # full-width desktop layout
)

# header ------------------------------------------------------------------------
st.markdown(
    """
    <h1 style='text-align: center; color: #2C3E50;'>🏠 MANJE RENTALS</h1>
    <h3 style='text-align: center; color: #5D6D7E;'>
        <i>Trouble finding University housing? Look no further!<i> </h3>
    <hr style='margin-top: 10px; margin-bottom: 30px;'>
    """,
    unsafe_allow_html=True
)

if 'current_listing' not in st.session_state:
    st.session_state['current_listing'] = None

if st.session_state['current_listing'] is None:
    st.session_state['current_listing'] = get_db_info.Listing().get_data()

icon_map = {"House": {"icon": "home", "colour": "green"}, "Apartment": {"icon": "building", "colour": "blue"}, "Condo": {"icon": "university", "colour": "purple"} }
# main
col1, col2 = st.columns([1, 1])

with col1:
    
    currentLocation = [43.4643, -80.5204]
    # map preview
    st.markdown("###  Interactive Map Preview")
    # Create the map 
    m = folium.Map(location= currentLocation, zoom_start=13)


    listing_data = st.session_state['current_listing']

    if listing_data:

        for listing in listing_data:

            icon_info = icon_map.get(listing.get('type'))

            folium.Marker(
                [listing['lat'], listing['lon']],
                icon=folium.Icon(color=icon_info['colour'], icon=icon_info['icon'], prefix='fa'),
                popup=listing['popup'],
                tooltip=listing['name']
            ).add_to(m)

        
    else:
        st.write("no listings to load")

    # Display mao
    st_folium(m, width=700, height=650)

with col2:
    st.markdown(
        """
        ### About the Platform  
        Manje simplifies the rental search process by combining listings from **Kijiji** and **Realtor.ca**  
        into one **interactive map**. By filtering based on your preferences, you can find the perfect rental.
        
        **Features:**
        - Unified search across platforms  
        - Interactive map interface  
        - Save & compare listings  
        - Personalized profiles  
        - Real-time filtering  
        """,
        unsafe_allow_html=True
    )

    st.markdown("<br>", unsafe_allow_html=True)

# Footer
colA, colB, colC = st.columns(3)

with colA:
    if st.button("🗺 Map"):
        st.write("Navigating to Map Page...")

with colB:
    if st.button("👤 Profile"):
        st.write("Navigating to Profile Page...")