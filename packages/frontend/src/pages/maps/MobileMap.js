import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import styled from "styled-components/macro";
import { Helmet } from "react-helmet-async";

import { STARTING_LOCATION } from "../../constants";
import ResetZoomControl from "../../components/map/ResetZoomControl";
import LayersControl from "../../components/map/LayersControl";
import { Search as SearchIcon } from "react-feather";
import { InputBase, Tooltip } from "@material-ui/core";
import LineChart from "../dashboards/Default/LineChart";
import { findRawRecords } from "../../services/crudService";
import { useQuery } from "react-query";
import useService from "../../hooks/useService";
import { makeStyles } from "@material-ui/core/styles";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MainContainer = styled.div`
  height: 100vh;
  width: 100vw;
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

const Search = styled.div`
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.5);
  position: absolute;
  top: 7px;
  left: 50px;
  width: calc(100% - 100px);
  z-index: 10000;
  &:hover {
    background-color: white;
  }
`;

const SearchIconWrapper = styled.div`
  width: 50px;
  height: 100%;
  position: absolute;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 22px;
    height: 22px;
    stroke: ${(props) => props.theme.header.search.color};
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }
`;

const Input = styled(InputBase)`
  color: inherit;
  width: 100%;
  > input {
    color: ${(props) => props.theme.header.search.color};
    padding-top: ${(props) => props.theme.spacing(2.5)}px;
    padding-right: ${(props) => props.theme.spacing(2.5)}px;
    padding-bottom: ${(props) => props.theme.spacing(2.5)}px;
    padding-left: ${(props) => props.theme.spacing(12)}px;
    width: 100%;
  }
`;

const GraphContainer = styled.div`
  height: 40%;
  width: 100vw;
  background-color: red;
  position: relative;
`;

const FlowContainer = styled.div`
  height: 75%;
  width: 100vw;
  background-color: green;
  position: absolute;
  bottom: 0;
  left: ${({ flowTransition }) => flowTransition || "100%"};
  transition: 1s;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const WaterLevelContainer = styled.div`
  height: 75%;
  width: 100vw;
  background-color: yellow;
  position: absolute;
  bottom: 0;
  right: ${({ waterLevelTransition }) => waterLevelTransition || "100%"};
  transition: 1s;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const GraphHeader = styled.div`
  height: 25%;
  width: 100vw;
  bottom: 0;
  right: 0;
  background-color: blue;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
`;

const DefaultContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin: auto;
  padding: auto;
`;

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 60%;
`;

const BottomLeftIconContainer = styled.div`
  position: absolute;
  pointer-events: none;
  z-index: 2;
  bottom: 40px;
  left: 10px;
`;

const BottomRightIconContainer = styled.div`
  position: absolute;
  pointer-events: none;
  z-index: 2;
  bottom: 40px;
  right: 10px;
`;

const Icon = styled.button`
  vertical-align: middle;
  cursor: pointer;
`;

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
}));

function MobileMap() {
  const classes = useStyles();
  const service = useService({ toast: false });
  const [map, setMap] = useState();
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const [currentGraphType, setCurrentGraphType] = useState(null);
  const [currentSelectedPoint, setCurrentSelectedPoint] = useState(null);
  const mapContainerRef = useRef(null); // create a reference to the map container
  const coordinatesRef = useRef(null);
  const currentlyPaintedPointRef = useRef(null);
  const longRef = useRef(null);
  const latRef = useRef(null);
  const wellNameRef = useRef(null);

  const [flowTransition, setFlowTransition] = useState("100%");
  const handleFlowClick = () => {
    setFlowTransition((state) => (state === "100%" ? "0%" : "100%"));
    setWaterLevelTransition("100%");
    setCurrentGraphType((state) => (state !== "Flow" ? "Flow" : null));
    setCurrentSelectedPoint(null);
    map.fire("closeAllPopups");
  };

  const [waterLevelTransition, setWaterLevelTransition] = useState("100%");
  const handleWaterLevelClick = () => {
    setWaterLevelTransition((state) => (state === "100%" ? "0%" : "100%"));
    setFlowTransition("100%");
    setCurrentGraphType((state) =>
      state !== "Water Level" ? "Water Level" : null
    );
    setCurrentSelectedPoint(null);
    map.fire("closeAllPopups");
  };

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
    { keepPreviousData: true }
  );

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: STARTING_LOCATION,
      zoom: 10,
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

    // Add locate control to the map.
    map.addControl(new ResetZoomControl(), "top-right");
    map.addControl(new LayersControl(), "top-left");

    map.on("render", () => {
      map.resize();
    });
    map.on("load", () => {
      setMapIsLoaded(true);
      map.resize();
      setMap(map);
    });
  }, []);

  useEffect(() => {
    if (mapIsLoaded && data?.length > 0 && typeof map != "undefined") {
      if (!map.getSource("locations")) {
        map.addSource("locations", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: data.map((location) => {
              return {
                type: "Feature",
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

        // Add a layer showing the places.
        if (!map.getLayer("locations")) {
          map.addLayer({
            id: "locations",
            type: "circle",
            source: "locations",
            paint: {
              "circle-radius": {
                base: 2,
                stops: [
                  [10, 6],
                  [14, 12],
                ],
              },
              "circle-color": [
                "case",
                ["boolean", ["to-boolean", ["get", "Last Value"]], false],
                "#74E0FF",
                "#8D9093",
              ],
              "circle-stroke-width": [
                "case",
                ["boolean", ["feature-state", "clicked"], false],
                4,
                1,
              ],
              "circle-stroke-color": [
                "case",
                ["boolean", ["feature-state", "clicked"], false],
                "yellow",
                "black",
              ],
            },
          });

          map.addLayer({
            id: "locations-labels",
            type: "symbol",
            source: "locations",
            minzoom: 12,
            layout: {
              "text-field": ["get", "Well Name"],
              "text-offset": [0, -2],
              "text-size": 14,
            },
            paint: {
              "text-halo-color": "#ffffff",
              "text-halo-width": 0.5,
            },
          });
        }

        //makes currently selected point yellow
        //removes previously yellow colored point
        map.on("click", "locations", (e) => {
          if (e.features.length > 0) {
            if (currentlyPaintedPointRef.current) {
              map.setFeatureState(
                { source: "locations", id: currentlyPaintedPointRef.current },
                { clicked: false }
              );
            }
            currentlyPaintedPointRef.current = e.features[0].id;
            map.setFeatureState(
              { source: "locations", id: e.features[0].id },
              { clicked: true }
            );
          }
        });

        // //set well number used to fetch data for graph
        // //fly to graph
        map.on("click", "locations", (e) => {
          setCurrentSelectedPoint(e.features[0].properties["station_ndx"]);
          map.flyTo({
            center: [
              e.features[0].properties.map_lon_dd,
              e.features[0].properties.map_lat_dd,
            ],
            zoom: 14,
            padding: { bottom: 200 },
          });
        });
        //
        // //for lat/long display
        map.on("click", "locations", onPointClick);
        //
        map.on("click", "locations", (e) => {
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

          map.on("closeAllPopups", () => {
            popup.remove();
            coordinatesRef.current.style.display = "none";
            map.setFeatureState(
              {
                source: "locations",
                id: currentlyPaintedPointRef.current,
              },
              { clicked: false }
            );
          });
        });

        longRef.current.addEventListener("click", (e) =>
          handleCopyCoords(e.target.innerHTML)
        );
        latRef.current.addEventListener("click", (e) =>
          handleCopyCoords(e.target.innerHTML)
        );

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on("mouseenter", "locations", () => {
          map.getCanvas().style.cursor = "pointer";

          map.on("mouseleave", "locations", () => {
            map.getCanvas().style.cursor = "";
          });
        });

        let hoverID = null;

        map.on("mousemove", "locations", (e) => {
          if (e.features.length === 0) return;

          if (hoverID) {
            map.setFeatureState(
              {
                source: "locations",
                id: hoverID,
              },
              {
                hover: false,
              }
            );
          }

          hoverID = e.features[0].id;

          map.setFeatureState(
            {
              source: "locations",
              id: hoverID,
            },
            {
              hover: true,
            }
          );
        });

        // When the mouse leaves the earthquakes-viz layer, update the
        // feature state of the previously hovered feature
        map.on("mouseleave", "locations", () => {
          if (hoverID) {
            map.setFeatureState(
              {
                source: "locations",
                id: hoverID,
              },
              {
                hover: false,
              }
            );
          }
          hoverID = null;
        });

        // Change it back to a pointer when it leaves.
      }
    }
  }, [isLoading, mapIsLoaded, map, data]); // eslint-disable-line

  useEffect(() => {
    if (map !== undefined) {
      if (!currentGraphType) {
        map.setFilter("locations", null);
        map.setFilter("locations-labels", null);
      } else {
        map.setFilter("locations", [
          "==",
          ["get", "Measure Type"],
          currentGraphType,
        ]);
        map.setFilter("locations-labels", [
          "==",
          ["get", "Measure Type"],
          currentGraphType,
        ]);
      }
    }
  }, [currentGraphType]); // eslint-disable-line

  useEffect(() => {
    if (currentSelectedPoint) {
      console.log(currentSelectedPoint);
    }
  }, [currentSelectedPoint]);

  if (error) return "An error has occurred: " + error.message;

  return (
    <React.Fragment>
      <Helmet title="Mobile Map" />
      <MainContainer>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <Input fullWidth placeholder="Search" />
        </Search>
        <MapContainer ref={mapContainerRef}>
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
            <Tooltip
              title="Copy Latitude to Clipboard"
              placement="bottom-start"
            >
              <Coord ref={latRef} />
            </Tooltip>
          </Coordinates>
          <Tooltip title="Water Level Points and Graph">
            <BottomLeftIconContainer>
              <div
                className="mapboxgl-ctrl mapboxgl-ctrl-group "
                onClick={handleWaterLevelClick}
              >
                <Icon className="material-icons">straighten</Icon>
              </div>
            </BottomLeftIconContainer>
          </Tooltip>
          <Tooltip title="Flow Points and Graph">
            <BottomRightIconContainer>
              <div
                className="mapboxgl-ctrl mapboxgl-ctrl-group "
                onClick={handleFlowClick}
              >
                <Icon className="material-icons">waves</Icon>
              </div>
            </BottomRightIconContainer>
          </Tooltip>
        </MapContainer>
        <GraphContainer>
          <GraphHeader>
            THIS IS THE {currentGraphType ?? "HEADER AND ALL POINTS"}
          </GraphHeader>
          <DefaultContainer>DEFAULT</DefaultContainer>
          <FlowContainer flowTransition={flowTransition}>
            <LineChart />
          </FlowContainer>
          <WaterLevelContainer waterLevelTransition={waterLevelTransition}>
            <LineChart />
          </WaterLevelContainer>
        </GraphContainer>
      </MainContainer>
    </React.Fragment>
  );
}

export default MobileMap;
