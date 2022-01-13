import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components/macro";
import { NavLink } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import {
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Grid as MuiGrid,
  Input,
  Typography as MuiTypography,
} from "@material-ui/core";

import { spacing } from "@material-ui/system";

import { useQuery } from "react-query";
import { findRawRecords } from "../../../services/crudService";
import useService from "../../../hooks/useService";
import Link from "@material-ui/core/Link";
import DataAdminTable from "../../../components/DataAdminTable";
import Loader from "../../../components/Loader";
import Panel from "../../../components/panels/Panel";
import { dateFormatter, threeMonthsAgo } from "../../../utils";
import DatePicker from "../../../components/pickers/DatePicker";
import { add } from "date-fns";

const Divider = styled(MuiDivider)(spacing);

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

const Typography = styled(MuiTypography)(spacing);

const TableWrapper = styled.div`
  overflow-y: auto;
  max-width: calc(100vw - ${(props) => props.theme.spacing(12)}px);
  height: 100%;
  width: 100%;
`;

const Grid = styled(MuiGrid)(spacing);

function StaffGageReadings() {
  const service = useService({ toast: false });

  //date filter defaults
  const defaultFilterValues = {
    // startDate: lastOfJanuary,
    startDate: threeMonthsAgo,
    endDate: new Date(),
  };
  const [filterValues, setFilterValues] = useState(defaultFilterValues);
  const changeFilterValues = (name, value) => {
    setFilterValues((prevState) => {
      let newFilterValues = { ...prevState };
      newFilterValues[name] = value;
      return newFilterValues;
    });
  };

  const filterDataByDateFilters = (data) => {
    return data?.filter(
      (item) =>
        new Date(item.collect_timestamp) > filterValues.startDate &&
        new Date(item.collect_timestamp) <
          add(filterValues.endDate, { days: 1 })
    );
  };

  const [filteredData, setFilteredData] = useState(null);
  const {
    data: unfilteredData,
    isLoading,
    // error,
  } = useQuery(
    ["DataStaffGageReadings"],
    async () => {
      try {
        const response = await service([
          findRawRecords,
          ["DataStaffGageReadings"],
        ]);
        return response;
      } catch (err) {
        console.error(err);
      }
    },
    { keepPreviousData: true }
  );

  useEffect(() => {
    console.log("filter");
    const filterData = filterDataByDateFilters(unfilteredData);
    setFilteredData(filterData);
  }, [filterValues, unfilteredData]); //eslint-disable-line

  const { data: Stations } = useQuery(
    ["ListMeasurementStationsUps"],
    async () => {
      try {
        return await service([findRawRecords, ["ListMeasurementStationsUps"]]);
      } catch (err) {
        console.error(err);
      }
    },
    { keepPreviousData: true }
  );

  const formattedStructures = useMemo(() => {
    let converted = {};
    if (Stations?.length > 0) {
      Stations.forEach((d) => {
        converted[d.station_ndx] = d.map_display_name;
      });
    }
    return converted;
  }, [Stations]);

  const columns = [
    {
      title: "Station",
      field: "station_ndx",
      lookup: formattedStructures,
    },
    {
      title: "Collected",
      field: "collect_timestamp",
      initialEditValue: new Date(),
      type: "datetime",
      render: (rowData) => {
        return dateFormatter(rowData.collect_timestamp, "MM/DD/YYYY, h:mm A");
      },
      // cellStyle: { maxWidth: "100%" },
    },
    {
      title: "Measurement",
      field: "measured_value",
      type: "numeric",
      initialEditValue: 0,
      validate: (rowData) =>
        isNaN(rowData.measured_value)
          ? {
              isValid: false,
              helperText: "A measured value is required",
            }
          : rowData.measured_value < 0
          ? {
              isValid: false,
              helperText: "The measured value cannot be negative",
            }
          : true,
      width: "0%",
    },
    {
      title: "Notes",
      field: "notes",
      editComponent: (props) => (
        <Input
          defaultValue={props.value ?? ""}
          onChange={(e) => props.onChange(e.target.value)}
          type="text"
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      <Helmet title="Well Production" />
      <Typography variant="h3" gutterBottom display="inline">
        Staff Gage Readings
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} exact to="/dashboard">
          Dashboard
        </Link>
        <Typography>Staff Gage Readings</Typography>
      </Breadcrumbs>

      <Divider my={6} />
      <Panel>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Start Date"
              name="startDate"
              selectedDate={filterValues.startDate}
              setSelectedDate={changeFilterValues}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="End Date"
              name="endDate"
              selectedDate={filterValues.endDate}
              setSelectedDate={changeFilterValues}
            />
          </Grid>
        </Grid>
        {filteredData ? (
          <TableWrapper>
            <DataAdminTable
              pageSize={10}
              isLoading={isLoading}
              label="Staff Gage Readings"
              columns={columns}
              data={filteredData}
              height="350px"
              updateHandler={setFilteredData}
              endpoint="data-staff-gage-readings"
            />
          </TableWrapper>
        ) : (
          <Loader />
        )}
      </Panel>
    </React.Fragment>
  );
}

export default StaffGageReadings;
