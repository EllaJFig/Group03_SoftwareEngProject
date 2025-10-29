import streamlit as st
from streamlit_folium import st_folium
import folium
import get_db_info

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

if 'all_listing_data' not in st.session_state:
    st.session_state['all_listing_data'] = get_db_info.Listing().get_data()

listings = st.session_state['all_listing_data']

if not listings:
    st.error("your broke")
    st.stop()


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

    if not filtered_listings:
        st.warning("no listings here")
        m = folium.Map(location=[43.4643, -80.5204], zoom_start=13)
    else:
        lat1 = filtered_listings[0]['lat']
        long1 = filtered_listings[0]['lon']
        m = folium.Map(location=[lat1, long1], zoom_start=13)


    for l in filtered_listings:
        icon_info = icon_map.get(l["type"], {"icon": "home", "color": "red"})
        folium.Marker(
            [l["lat"], l["lon"]],
            icon=folium.Icon(color=icon_info["color"], icon=icon_info["icon"], prefix='fa'),
            popup=folium.Popup(
                f"<b>{l['name']}</b><br>${l['price']}/month<br>**Area{l.get('area', 'N/A')} sq ft<br>{l['bedrooms']} Bed • {l['bathrooms']} Bath<br>Type: {l['type']}",
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

