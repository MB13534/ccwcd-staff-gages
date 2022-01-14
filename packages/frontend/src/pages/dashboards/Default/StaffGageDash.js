import React, { useMemo, useState } from "react";

import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  Divider as MuiDivider,
  Grid as MuiGrid,
  Typography as MuiTypography,
} from "@material-ui/core";
import styled from "styled-components/macro";
import { spacing } from "@material-ui/system";
import DashMobileMap from "../../../components/map/DashMobileMap";
import { useQuery } from "react-query";
import { findRawRecords } from "../../../services/crudService";
import Loader from "../../../components/Loader";
import useService from "../../../hooks/useService";
import { Helmet } from "react-helmet-async";
import DashStaffGageReadings from "../data entry/DashStaffGageReadings";
import { useAuth0 } from "@auth0/auth0-react";

const Grid = styled(MuiGrid)(spacing);

const Divider = styled(MuiDivider)(spacing);

const Typography = styled(MuiTypography)(spacing);

const MapContainer = styled.div`
  height: calc(400px);
  width: 100%;
`;

const TableWrapper = styled.div`
  overflow-y: auto;
  max-width: calc(100vw - ${(props) => props.theme.spacing(12)}px);
  height: 100%;
  width: 100%;
`;

const StaffGageDash = () => {
  const [map, setMap] = useState();
  const { user } = useAuth0();
  const service = useService({ toast: false });

  const {
    data: mapData,
    isLoading,
    error,
  } = useQuery(
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

  const formattedCoords = useMemo(() => {
    let converted = {};
    if (mapData?.length > 0) {
      mapData.forEach((d) => {
        converted[d.station_ndx] = [d.map_lon_dd, d.map_lat_dd];
      });
    }
    return converted;
  }, [mapData]);

  return (
    <>
      <Helmet title="Dashboard" />
      <Grid justify="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="subtitle1">
            Welcome back, {user?.name}!
          </Typography>
        </Grid>
      </Grid>

      <Divider my={6} />
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="mobile-map"
              id="mobile-map"
            >
              <Typography variant="h4" ml={2}>
                Map
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <MapContainer>
                {mapData ? (
                  <DashMobileMap
                    map={map}
                    setMap={setMap}
                    data={mapData}
                    isLoading={isLoading}
                    error={error}
                  />
                ) : (
                  <Loader />
                )}
              </MapContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="staff-gage-readings"
              id="staff-gage-readings"
            >
              <Typography variant="h4" ml={2}>
                Staff Gage Readings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableWrapper>
                <DashStaffGageReadings
                  actions={[
                    () => ({
                      icon: "near_me",
                      tooltip: "Fly to on Map",
                      onClick: (event, rowData) => {
                        // handlePointInteractions(rowData);
                        if (
                          formattedCoords[rowData.station_ndx][0] === null ||
                          formattedCoords[rowData.station_ndx][1] === null
                        ) {
                          window.alert("No Coordinates Available");
                          return null;
                        }
                        map.flyTo({
                          center: formattedCoords[rowData.station_ndx],
                          zoom: 18,
                          // padding: { bottom: 400 },
                          padding: { top: 250 },
                        });
                      },
                    }),
                  ]}
                />
              </TableWrapper>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </>
  );
};

export default StaffGageDash;
