import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import styled from "styled-components/macro";
import { STARTING_LOCATION } from "../../constants";
import { Accordion, AccordionDetails, Typography } from "@material-ui/core";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import debounce from "lodash.debounce";
import { handleCopyCoords } from "../../utils/map";
import CoordinatesPopup from "./components/CoordinatesPopup";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Container = styled.div`
  height: 300px;
  width: 100%;
`;

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const LatLongMarkerMap = ({ config }) => {
  const [map, setMap] = useState();
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const coordinatesContainerRef = useRef(null);
  const longRef = useRef(null);
  const latRef = useRef(null);
  const eleRef = useRef(null);
  const mapContainerRef = useRef(null); // create a reference to the map container

  async function getElevation() {
    // Construct the API request.
    const query = await fetch(
      `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${longRef.current.innerHTML},${latRef.current.innerHTML}.json?layers=contour&limit=50&access_token=${mapboxgl.accessToken}`,
      { method: "GET" }
    );
    if (query.status !== 200) return;
    const data = await query.json();

    const allFeatures = data.features;

    const elevations = allFeatures.map((feature) => feature.properties.ele);

    return (eleRef.current.innerHTML = Math.max(...elevations) * 3.28084);
  }

  //create map and apply all controls
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center:
        !config.data.map_lon_dd || !config.data.map_lat_dd
          ? STARTING_LOCATION
          : [config.data.map_lon_dd, config.data.map_lat_dd],
      zoom:
        config.data.map_lon_dd === "" || config.data.map_lat_dd === "" ? 9 : 18,
    });

    //top right controls
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    //bottom left controls
    map.addControl(
      new mapboxgl.ScaleControl({ unit: "imperial" }),
      "bottom-left"
    );

    map.on("load", () => {
      setMapIsLoaded(true);
      setMap(map);
    });
  }, []); // eslint-disable-line

  //resizes map when mapContainerRef dimensions changes (sidebar toggle)
  useEffect(() => {
    if (map) {
      const resizer = new ResizeObserver(debounce(() => map.resize(), 100));
      resizer.observe(mapContainerRef.current);
      return () => {
        resizer.disconnect();
      };
    }
  }, [map]);

  useEffect(() => {
    if (mapIsLoaded && typeof map != "undefined") {
      const marker = new mapboxgl.Marker({
        draggable: false,
      })
        .setLngLat(
          !config.data.map_lon_dd || !config.data.map_lat_dd
            ? STARTING_LOCATION
            : [config.data.map_lon_dd, config.data.map_lat_dd]
        )
        .addTo(map);

      if (config.data.map_lon_dd && config.data.map_lat_dd) {
        const lngLat = marker.getLngLat();
        coordinatesContainerRef.current.style.display = "block";
        longRef.current.innerHTML = lngLat.lng;
        latRef.current.innerHTML = lngLat.lat;
        getElevation(!config.data.elevation_ftabmsl);
      }

      // //handles copying coordinates and measurements to the clipboard
      const copyableRefs = [longRef, latRef, eleRef];
      copyableRefs.forEach((ref) => {
        ref.current.addEventListener("click", (e) =>
          handleCopyCoords(e.target.textContent)
        );
      });
    }
  }, [mapIsLoaded, map]); //eslint-disable-line

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="map"
          id="map"
          style={{ padding: "0" }}
        >
          <Typography variant="h4" ml={2}>
            Map (Current Coordinates & Elevation)
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ padding: "0" }}>
          <Container>
            <MapContainer ref={mapContainerRef}>
              <CoordinatesPopup
                coordinatesContainerRef={coordinatesContainerRef}
                title={config?.data.map_display_name}
                longRef={longRef}
                latRef={latRef}
                eleRef={eleRef}
                top={"10px"}
                left={"10px"}
              />
            </MapContainer>
          </Container>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default LatLongMarkerMap;
