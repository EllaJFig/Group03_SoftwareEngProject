import streamlit as st
from streamlit_folium import st_folium
import folium

# config -----------------------------------------------------------------------
st.set_page_config(page_title="Full Map - Manje Rentals", page_icon = "map", layout="wide")

# header -----------------------------------------------------------------------
st.markdown(
    """
    <h1 style='text-align: center; color: #2C3E50;'>🏠 MANJE RENTALS</h1>
    <h3 style='text-align: center; color: #5D6D7E;'>
        <i>Find your perfect rental with personalized filters!</i> </h3>
    <hr style='margin-top: 10px; margin-bottom: 30px;'>
    """,
    unsafe_allow_html=True
)

# sample listings ---------------------------------------------------------------
listings = [
    {
        "name": "Kijiji Listing #1",
        "lat": 43.4735,
        "lon": -80.5434,
        "price": 1800,
        "area": 900,
        "bedrooms": 2,
        "bathrooms": 1,
        "pet_friendly": True,
        "type": "Apartment"
    },
    {
        "name": "Realtor.ca Listing #2",
        "lat": 43.4641,
        "lon": -80.5242,
        "price": 2200,
        "area": 700,
        "bedrooms": 1,
        "bathrooms": 1,
        "pet_friendly": False,
        "type": "Condo"
    },
    {
        "name": "Kijiji Listing #3",
        "lat": 43.4602,
        "lon": -80.5151,
        "price": 2000,
        "area": 1000,
        "bedrooms": 2,
        "bathrooms": 2,
        "pet_friendly": True,
        "type": "House"
    }
]

# sidebar filter-----------------------------------------------------------
st.sidebar.title("FILTER LISTINGS")

price_range = st.sidebar.slider("Price ($/month)", 500, 5000, (1000, 2500), step=100)
area_range = st.sidebar.slider("Area (sq ft)", 200, 2000, (400, 1200), step=50)
bedrooms = st.sidebar.slider("Bedrooms", 0, 5, (1, 3))
bathrooms = st.sidebar.slider("Bathrooms", 0, 3, (1, 2))
property_type = st.sidebar.selectbox("Property Type", ["Any", "House", "Apartment", "Condo"])

st.sidebar.markdown("---")
st.sidebar.info("Use the sliders and dropdown to refine your map view.")

# filter listing ----------------------------------------------------------
filtered_listings = [
    l for l in listings
    if price_range[0] <= l["price"] <= price_range[1]
    and area_range[0] <= l["area"] <= area_range[1]
    and bedrooms[0] <= l["bedrooms"] <= bedrooms[1]
    and bathrooms[0] <= l["bathrooms"] <= bathrooms[1]
    and (property_type == "Any" or l["type"] == property_type)
]

# icon --------------------------------------------------------------------
icon_map = {
    "House": {"icon": "home", "color": "green"},
    "Apartment": {"icon": "building", "color": "blue"},
    "Condo": {"icon": "university", "color": "purple"}
}

# layout ------------------------------------------------------------------
col1, col2 = st.columns([2, 1]) 

# map ---------------------------------------------------------------------
with col1:
    st.markdown("### MAP VIEW")
    m = folium.Map(location=[43.4643, -80.5204], zoom_start=13)

    for l in filtered_listings:
        icon_info = icon_map.get(l["type"], {"icon": "home", "color": "red"})
        folium.Marker(
            [l["lat"], l["lon"]],
            icon=folium.Icon(color=icon_info["color"], icon=icon_info["icon"], prefix='fa'),
            popup=folium.Popup(
                f"<b>{l['name']}</b><br>${l['price']}/month<br>{l['bedrooms']} Bed • {l['bathrooms']} Bath<br>Type: {l['type']}",
                max_width=300
            ),
            tooltip=l["name"]
        ).add_to(m)

    st_folium(m, width=1100, height=700)

# info -------------------------------------------------------------------
with col2:
    st.markdown("### Filters / Options")
    st.markdown("Adjust filters in the sidebar to refine the map view.")
    st.markdown("---")
    st.markdown("**Legend:**")
    st.markdown("- 🏠 House (green)\n- 🏢 Apartment (blue)\n- 🏬 Condo (purple)")
