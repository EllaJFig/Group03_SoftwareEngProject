import streamlit as st
from streamlit_folium import st_folium
import folium

# config
st.set_page_config(
    page_title="CP317 Manje Demo",
    page_icon="🏠",
    layout="wide"  # full-width desktop layout
)

# header
st.markdown(
    """
    <h1 style='text-align: center; color: #2C3E50;'>🏠 Manje Rentals</h1>
    <h3 style='text-align: center; color: #5D6D7E;'>Trouble finding University housing? Look no further!</h3>
    <hr style='margin-top: 10px; margin-bottom: 30px;'>
    """,
    unsafe_allow_html=True
)

# main
col1, col2 = st.columns([1, 1])

with col1:
    # map preview
    st.markdown("###  Interactive Map Preview")

    # Create the map 
    m = folium.Map(location=[43.4643, -80.5204], zoom_start=13)

  
    folium.Marker(
        [43.4735, -80.5434],
        popup="<b>Kijiji Listing #1</b><br>$1,800/month<br>2 Bed • 1 Bath<br>Close to WLU",
        tooltip="Kijiji Listing #1"
    ).add_to(m)

    folium.Marker(
        [43.4641, -80.5242],
        popup="<b>Realtor.ca Listing #2</b><br>$2,200/month<br>1 Bed • 1 Bath<br>Downtown Waterloo",
        tooltip="Realtor.ca Listing #2"
    ).add_to(m)

    folium.Marker(
        [43.4602, -80.5151],
        popup="<b>Kijiji Listing #3</b><br>$2,000/month<br>2 Bed • 2 Bath<br>Near University Ave",
        tooltip="Kijiji Listing #3"
    ).add_to(m)

    # Display mao
    st_folium(m, width=700, height=400)

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

st.markdown("---")

# Footer
colA, colB, colC = st.columns(3)

with colA:
    if st.button("🗺 Map"):
        st.write("Navigating to Map Page...")

with colB:
    if st.button("💾 Saved Listings"):
        st.write("Navigating to Saved Listings...")

with colC:
    if st.button("👤 Profile"):
        st.write("Navigating to Profile Page...")

