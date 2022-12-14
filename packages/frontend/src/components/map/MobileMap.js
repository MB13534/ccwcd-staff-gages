import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import styled from "styled-components/macro";
import { Helmet } from "react-helmet-async";

import _ from "lodash";

import MapboxglSpiderifier from "mapboxgl-spiderifier";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import { STARTING_LOCATION } from "../../constants";
import ResetZoomControl from "../../components/map/ResetZoomControl";
// import LayersControl from "../../components/map/LayersControl";
import { Tooltip } from "@material-ui/core";
// import LineChart from "../dashboards/Default/LineChart";
import { findRawRecords } from "../../services/crudService";
import { useQuery } from "react-query";
import useService from "../../hooks/useService";
import { makeStyles } from "@material-ui/core/styles";

import "./styles.css";
import debounce from "lodash.debounce";
import ToggleBasemapControl from "./ToggleBasemapControl";
import { lineColors } from "../../utils";
import Search from "./components/search";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

// const MainContainer = styled.div`
//   position: fixed;
//   height: 100%;
//   width: 100vw;
// `;
//
// const MapContainer = styled.div`
//   position: relative;
//   width: 100%;
//   height: 100%;
// `;

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100vh - 57px - 61px);
`;

const Coordinates = styled.pre`
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translate(-50%, 0);
  padding: 5px 10px;
  margin: 0;
  font-size: 11px;
  line-height: 18px;
  border-radius: 3px;
  z-index: 1000;
  display: none;
`;

const Coord = styled.span`
  cursor: copy;
`;

const WellName = styled.div`
  text-align: center;
`;

//
// const GraphContainer = styled.div`
//   height: 40%;
//   width: 100vw;
//   background-color: red;
//   position: relative;
// `;
//
// const FlowContainer = styled.div`
//   height: 75%;
//   width: 100vw;
//   background-color: green;
//   position: absolute;
//   bottom: 0;
//   left: ${({ flowTransition }) => flowTransition || "100%"};
//   transition: 1s;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;
//
// const WaterLevelContainer = styled.div`
//   height: 75%;
//   width: 100vw;
//   background-color: yellow;
//   position: absolute;
//   bottom: 0;
//   right: ${({ waterLevelTransition }) => waterLevelTransition || "100%"};
//   transition: 1s;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;
//
// const GraphHeader = styled.div`
//   height: 25%;
//   width: 100vw;
//   bottom: 0;
//   right: 0;
//   background-color: blue;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   color: white;
// `;
//
// const DefaultContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   color: white;
//   margin: auto;
//   padding: auto;
// `;
//
//
//
// const BottomLeftIconContainer = styled.div`
//   position: absolute;
//   pointer-events: none;
//   z-index: 2;
//   bottom: 40px;
//   left: 10px;
// `;
//
// const BottomRightIconContainer = styled.div`
//   position: absolute;
//   pointer-events: none;
//   z-index: 2;
//   bottom: 40px;
//   right: 10px;
// `;
//
// const Icon = styled.button`
//   vertical-align: middle;
//   cursor: pointer;
// `;

const useStyles = makeStyles(() => ({
  propTable: {
    borderRadius: "5px",
    borderCollapse: "collapse",
    border: "1px solid #ccc",
    "& td": {
      padding: "3px 6px",
      margin: 0,
    },
    "& tr:nth-child(even)": {
      backgroundColor: "#eee",
    },
    "& tr": {
      borderRadius: "5px",
    },
  },
  popupWrap: {
    maxHeight: 200,
    overflowY: "scroll",
  },
  selected: {
    borderColor: "yellow !important",
    width: "25px !important",
    height: "25px !important",
    borderWidth: "4px !important",
  },
}));

function MobileMap() {
  const classes = useStyles();
  const service = useService({ toast: false });
  const [map, setMap] = useState();
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  // const [currentGraphType, setCurrentGraphType] = useState(null);
  // const [currentSelectedPoint, setCurrentSelectedPoint] = useState(null);
  const mapContainerRef = useRef(null); // create a reference to the map container
  const coordinatesRef = useRef(null);
  const currentlyPaintedPointRef = useRef(null);
  const longRef = useRef(null);
  const latRef = useRef(null);
  const wellNameRef = useRef(null);
  const SPIDERFY_FROM_ZOOM = 15;

  const DUMMY_BASEMAP_LAYERS = [
    { url: "satellite-streets-v11", icon: "satellite_alt" },
    { url: "streets-v11", icon: "commute" },
    // { url: "outdoors-v11", icon: "park" },
  ];

  // const [flowTransition, setFlowTransition] = useState("100%");
  // const handleFlowClick = () => {
  //   setFlowTransition((state) => (state === "100%" ? "0%" : "100%"));
  //   setWaterLevelTransition("100%");
  //   setCurrentGraphType((state) => (state !== "Flow" ? "Flow" : null));
  //   setCurrentSelectedPoint(null);
  //   map.fire("closeAllPopups");
  // };
  //
  // const [waterLevelTransition, setWaterLevelTransition] = useState("100%");
  // const handleWaterLevelClick = () => {
  //   setWaterLevelTransition((state) => (state === "100%" ? "0%" : "100%"));
  //   setFlowTransition("100%");
  //   setCurrentGraphType((state) =>
  //     state !== "Water Level" ? "Water Level" : null
  //   );
  //   setCurrentSelectedPoint(null);
  //   map.fire("closeAllPopups");
  // };

  const handleCopyCoords = (value) => {
    const dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.value = value;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
  };

  function onPointClick(e) {
    coordinatesRef.current.style.display = "block";
    wellNameRef.current.innerHTML = e.features[0].properties["Well Name"];
    longRef.current.innerHTML = e.features[0].properties["map_lon_dd"];
    latRef.current.innerHTML = e.features[0].properties["map_lat_dd"];
  }

  const coordinatesGeocoder = function (query) {
    // Match anything which looks like
    // decimal degrees coordinate pair.
    const matches = query.match(
      /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
    );
    if (!matches) {
      return null;
    }

    function coordinateFeature(lng, lat) {
      return {
        center: [lng, lat],
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        place_name: "Lat: " + lat + " Lng: " + lng,
        place_type: ["coordinate"],
        properties: {},
        type: "Feature",
      };
    }

    const coord1 = Number(matches[1]);
    const coord2 = Number(matches[2]);
    const geocodes = [];

    if (coord1 >= -90 && coord1 <= 90 && coord2 >= -180 && coord2 <= 180) {
      // must be lat, lng
      geocodes.push(coordinateFeature(coord2, coord1));
    }

    if (coord2 >= -90 && coord2 <= 90 && coord1 >= -180 && coord1 <= 180) {
      // must be lng, lat
      geocodes.push(coordinateFeature(coord1, coord2));
    }

    // if (geocodes.length === 0) {
    //   // else could be either lng, lat or lat, lng
    //   geocodes.push(coordinateFeature(coord1, coord2));
    //   // geocodes.push(coordinateFeature(coord2, coord1));
    // }

    return geocodes;
  };

  const { data, isLoading, error } = useQuery(
    ["ListMeasurementStationsUps"],
    async () => {
      try {
        const response = await service([
          findRawRecords,
          ["ListMeasurementStationsUps"],
        ]);
        //filters out any well that does not have geometry data
        const filterData = response.filter(
          (location) =>
            location.applies_to.includes("staffgages") &&
            !location.removed &&
            !location.inactive &&
            location.map_lon_dd &&
            location.map_lon_dd
        );
        return filterData;
      } catch (err) {
        console.error(err);
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/" + DUMMY_BASEMAP_LAYERS[0].url,
      center: STARTING_LOCATION,
      zoom: 11,
    });

    //top right controls
    //loop through each base layer and add a layer toggle for that layer
    DUMMY_BASEMAP_LAYERS.forEach((layer) => {
      return map.addControl(
        new ToggleBasemapControl(layer.url, layer.icon),
        "top-right"
      );
    });
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
      }),
      "top-right"
    );
    //bottom right controls
    map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        localGeocoder: coordinatesGeocoder,
        zoom: 16,
        mapboxgl: mapboxgl,
        reverseGeocode: true,
        placeholder: "Geocoder Search",
      }),
      "bottom-right"
    );
    map.addControl(new ResetZoomControl(), "top-right");

    //bottom left controls
    map.addControl(
      new mapboxgl.ScaleControl({ unit: "imperial" }),
      "bottom-left"
    );

    map.on("load", () => {
      setMapIsLoaded(true);
      setMap(map);
      // setSpiderifier(spiderifier);
    });
  }, []); //eslint-disable-line

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
    if (mapIsLoaded && data?.length > 0 && typeof map != "undefined") {
      const spiderifier = new MapboxglSpiderifier(map, {
        customPin: false,
        animate: true,
        animationSpeed: 500,
        circleFootSeparation: 40,
        initializeLeg: initializeSpiderLeg,
      });

      function initializeSpiderLeg(spiderLeg) {
        var pinElem = spiderLeg.elements.pin;
        var feature = spiderLeg.feature;
        var popup = new mapboxgl.Popup({
          maxWidth: "310px",
          offset: MapboxglSpiderifier.popupOffsetForSpiderLeg(spiderLeg),
        });

        const html =
          '<div class="' +
          classes.popupWrap +
          '"><h3>Properties</h3><table class="' +
          classes.propTable +
          '"><tbody>' +
          `<tr><td><strong>Enter Data</strong></td><td><a href="/models/list-measurement-stations-ups/${feature.id}">Link</a></td></tr>` +
          Object.entries(feature)
            .map(([k, v]) => {
              if (["map_lon_dd", "map_lat_dd", "station_ndx", "id"].includes(k))
                return null;
              if (!v) return null;
              return `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`;
            })
            .join("") +
          "</tbody></table></div>";

        pinElem.style.backgroundColor = feature["Last Value"]
          ? lineColors.cyan
          : lineColors.gray;
        pinElem.style.borderWidth = "3px";
        pinElem.style.borderColor = "white";

        if (feature.station_ndx === currentlyPaintedPointRef.current) {
          pinElem.classList.add(classes.selected);
          pinElem.id = feature.station_ndx;
        }

        pinElem.addEventListener(
          "click",
          function () {
            map.fire("closeAllPopups");
            popup.setHTML(html).addTo(map);
            spiderLeg.mapboxMarker.setPopup(popup);

            pinElem.id = feature.station_ndx;
            coordinatesRef.current.style.display = "block";
            wellNameRef.current.innerHTML = feature["Well Name"];
            longRef.current.innerHTML = feature["map_lon_dd"];
            latRef.current.innerHTML = feature["map_lat_dd"];

            if (currentlyPaintedPointRef.current) {
              const lastPointId = document.getElementById(
                currentlyPaintedPointRef.current
              );

              if (lastPointId) {
                lastPointId.classList.remove(classes.selected);
              }

              map.setFeatureState(
                { source: "pins", id: currentlyPaintedPointRef.current },
                { clicked: false }
              );
            }
            currentlyPaintedPointRef.current = feature.station_ndx;
            pinElem.classList.add(classes.selected);
            map.setFeatureState(
              { source: "pins", id: feature.station_ndx },
              { clicked: true }
            );

            // e.stopPropagation();
          },
          true
        );

        map.on("closeAllPopups", () => {
          popup.remove();
          coordinatesRef.current.style.display = "none";
        });
      }

      if (!map.getSource("pins")) {
        map.addSource("pins", {
          type: "geojson",
          cluster: true,
          clusterMaxZoom: 20, // Max zoom to cluster points on
          clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
          data: {
            type: "FeatureCollection",
            features: data.map((location) => {
              return {
                type: "feature",
                id: location.station_ndx,
                properties: {
                  "Well Name": location.map_display_name,
                  "Measure Type": location.measure_type,
                  "Last Value": location.last_value,
                  "Measure Units": location.measure_units,
                  "Last Report Fields": location.last_report,
                  station_ndx: location.station_ndx,
                  map_lon_dd: location.map_lon_dd,
                  map_lat_dd: location.map_lat_dd,
                  id: location.id,
                },
                geometry: {
                  type: "Point",
                  coordinates: [location.map_lon_dd, location.map_lat_dd],
                },
              };
            }),
          },
        });

        map.addLayer({
          id: "pins",
          type: "circle",
          source: "pins",
          filter: ["all", ["!has", "point_count"]],
          paint: {
            "circle-color": [
              "case",
              ["boolean", ["to-boolean", ["get", "Last Value"]], false],
              lineColors.lightBlue,
              lineColors.gray,
            ],
            "circle-radius": 10,
            "circle-stroke-width": [
              "case",
              ["boolean", ["feature-state", "clicked"], false],
              5,
              3,
            ],
            "circle-stroke-color": [
              "case",
              ["boolean", ["feature-state", "clicked"], false],
              lineColors.yellow,
              "white",
            ],
          },
        });
      }

      // Add a layer showing the places.
      if (!map.getLayer("cluster-pins")) {
        map.addLayer({
          id: "cluster-pins",
          type: "circle",
          source: "pins",
          filter: ["all", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#52bb52",
              3,
              "#c5c460",
              5,
              "#c97493",
            ],
            "circle-radius": ["step", ["get", "point_count"], 13, 3, 17, 5, 21],
            "circle-stroke-width": 2,
            "circle-stroke-color": "black",
          },
        });

        map.addLayer({
          id: "cluster-pins-count",
          type: "symbol",
          source: "pins",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
        });

        map.addLayer({
          id: "locations-labels",
          type: "symbol",
          source: "pins",
          minzoom: 11,
          layout: {
            "text-field": ["get", "Well Name"],
            "text-offset": [0, -2],
            "text-size": 14,
          },
          paint: {
            "text-halo-color": "#ffffff",
            "text-halo-width": 200,
          },
        });

        map.on("click", mouseClick);
        map.on("zoomstart", function () {
          spiderifier.unspiderfy();
        });

        function mouseClick(e) {
          var features = map.queryRenderedFeatures(e.point, {
            layers: ["cluster-pins"],
          });

          // spiderifier.unspiderfy();
          if (!features.length) {
            return;
          } else if (map.getZoom() < SPIDERFY_FROM_ZOOM) {
            map.flyTo({
              center: e.lngLat,
              zoom: map.getZoom() + 2,
              padding: { top: 250 },
            });
          } else {
            map.flyTo({ center: e.lngLat, padding: { top: 250 } });
            map
              .getSource("pins")
              .getClusterLeaves(
                features[0].properties.cluster_id,
                100,
                0,
                function (err, leafFeatures) {
                  if (err) {
                    return console.error(
                      "error while getting leaves of a cluster",
                      err
                    );
                  }
                  var markers = _.map(leafFeatures, function (leafFeature) {
                    return leafFeature.properties;
                  });
                  spiderifier.spiderfy(
                    features[0].geometry.coordinates,
                    markers
                  );
                }
              );
          }
        }

        //_____________________________________________________________

        //makes currently selected point yellow
        //removes previously yellow colored point
        map.on("click", "pins", (e) => {
          if (e.features.length > 0) {
            if (currentlyPaintedPointRef.current) {
              map.setFeatureState(
                { source: "pins", id: currentlyPaintedPointRef.current },
                { clicked: false }
              );
            }
            currentlyPaintedPointRef.current = e.features[0].id;
            map.setFeatureState(
              { source: "pins", id: e.features[0].id },
              { clicked: true }
            );
          }
        });

        //set well number used to fetch data for graph
        //fly to graph
        map.on("click", "pins", (e) => {
          // setCurrentSelectedPoint(e.features[0].properties["station_ndx"]);
          map.flyTo({
            center: [
              e.features[0].properties.map_lon_dd,
              e.features[0].properties.map_lat_dd,
            ],
            zoom: 18,
            // padding: { bottom: 400 },
            padding: { top: 250 },
          });
        });

        // //for lat/long display
        map.on("click", "pins", onPointClick);
        //
        map.on("click", "pins", (e) => {
          let popup = new mapboxgl.Popup({ maxWidth: "310px" });
          let data = e.features[0].properties;

          // Copy coordinates array.
          const coordinates = [
            e.features[0].properties.map_lon_dd,
            e.features[0].properties.map_lat_dd,
          ];

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          const html =
            '<div class="' +
            classes.popupWrap +
            '"><h3>Properties</h3><table class="' +
            classes.propTable +
            '"><tbody>' +
            `<tr><td><strong>Enter Data</strong></td><td><a href="/models/list-measurement-stations-ups/${data.id}">Link</a></td></tr>` +
            Object.entries(data)
              .map(([k, v]) => {
                if (
                  ["map_lon_dd", "map_lat_dd", "station_ndx", "id"].includes(k)
                )
                  return null;
                return `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`;
              })
              .join("") +
            "</tbody></table></div>";

          popup.setLngLat(coordinates).setHTML(html).addTo(map);

          // map.on("closeAllPopups", () => {
          //   popup.remove();
          //   coordinatesRef.current.style.display = "none";
          //   map.setFeatureState(
          //     {
          //       source: "pins",
          //       id: currentlyPaintedPointRef.current,
          //     },
          //     { clicked: false }
          //   );
          // });
        });

        longRef.current.addEventListener("click", (e) =>
          handleCopyCoords(e.target.innerHTML)
        );
        latRef.current.addEventListener("click", (e) =>
          handleCopyCoords(e.target.innerHTML)
        );

        // map.on("click", "clusters", (e) => {
        //   const features = map.queryRenderedFeatures(e.point, {
        //     layers: ["clusters"],
        //   });
        //   const clusterId = features[0].properties.cluster_id;
        //   map
        //     .getSource("locations")
        //     .getClusterExpansionZoom(clusterId, (err, zoom) => {
        //       if (err) return;
        //
        //       map.flyTo({
        //         center: features[0].geometry.coordinates,
        //         zoom: zoom,
        //       });
        //     });
        // });

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on("mouseenter", "pins", () => {
          map.getCanvas().style.cursor = "pointer";

          map.on("mouseleave", "pins", () => {
            map.getCanvas().style.cursor = "";
          });
        });
        // Change it back to a pointer when it leaves.
      }
    }
  }, [isLoading, mapIsLoaded, map, data]); // eslint-disable-line

  // useEffect(() => {
  //   if (map !== undefined) {
  //     if (!currentGraphType) {
  //       map.setFilter("locations", null);
  //       map.setFilter("locations-labels", null);
  //     } else {
  //       map.setFilter("locations", [
  //         "==",
  //         ["get", "Measure Type"],
  //         currentGraphType,
  //       ]);
  //       map.setFilter("locations-labels", [
  //         "==",
  //         ["get", "Measure Type"],
  //         currentGraphType,
  //       ]);
  //     }
  //   }
  // }, [currentGraphType]); // eslint-disable-line

  const handleSearchSelect = (result) => {
    map.fire("closeAllPopups");
    map.flyTo({
      center: [result?.map_lon_dd, result?.map_lat_dd],
      zoom: 18,
      padding: { top: 250 },
    });
  };

  if (error) return "An error has occurred: " + error.message;

  return (
    <React.Fragment>
      <Helmet title="Mobile Map" />

      <MapContainer ref={mapContainerRef} id="map">
        <Search onSelect={handleSearchSelect} />
        <Coordinates ref={coordinatesRef}>
          <strong>
            <WellName ref={wellNameRef} />
          </strong>
          Longitude:{" "}
          <Tooltip title="Copy Longitude to Clipboard">
            <Coord ref={longRef} />
          </Tooltip>
          <br />
          Latitude:{" "}
          <Tooltip title="Copy Latitude to Clipboard" placement="bottom-start">
            <Coord ref={latRef} />
          </Tooltip>
        </Coordinates>
        {/*<Tooltip title="Water Level Points and Graph">*/}
        {/*  <BottomLeftIconContainer>*/}
        {/*    <div*/}
        {/*      className="mapboxgl-ctrl mapboxgl-ctrl-group "*/}
        {/*      onClick={handleWaterLevelClick}*/}
        {/*    >*/}
        {/*      <Icon className="material-icons">straighten</Icon>*/}
        {/*    </div>*/}
        {/*  </BottomLeftIconContainer>*/}
        {/*</Tooltip>*/}
        {/*<Tooltip title="Flow Points and Graph">*/}
        {/*  <BottomRightIconContainer>*/}
        {/*    <div*/}
        {/*      className="mapboxgl-ctrl mapboxgl-ctrl-group "*/}
        {/*      onClick={handleFlowClick}*/}
        {/*    >*/}
        {/*      <Icon className="material-icons">waves</Icon>*/}
        {/*    </div>*/}
        {/*  </BottomRightIconContainer>*/}
        {/*</Tooltip>*/}
      </MapContainer>
      {/*<GraphContainer>*/}
      {/*  <GraphHeader>*/}
      {/*    THIS IS THE {currentGraphType ?? "HEADER AND ALL POINTS"}*/}
      {/*  </GraphHeader>*/}
      {/*  <DefaultContainer>DEFAULT</DefaultContainer>*/}
      {/*  <FlowContainer flowTransition={flowTransition}>*/}
      {/*    <LineChart />*/}
      {/*  </FlowContainer>*/}
      {/*  <WaterLevelContainer waterLevelTransition={waterLevelTransition}>*/}
      {/*    <LineChart />*/}
      {/*  </WaterLevelContainer>*/}
      {/*</GraphContainer>*/}
    </React.Fragment>
  );
}

export default MobileMap;
