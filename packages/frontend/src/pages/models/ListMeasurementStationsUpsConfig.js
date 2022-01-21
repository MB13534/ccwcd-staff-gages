import React from "react";
import { Renderers } from "../../components/crud/ResultsRenderers";
import { CRUD_FIELD_TYPES } from "../../constants";

import { Grid, Typography } from "@material-ui/core";
import LatLongMap from "../../components/map/LatLongMap";

export const displayName = (row) => {
  return `${row.map_display_name}`;
};

export const crudModelNameLabels = {
  standard: "Measurement Stations",
};

export const sortBy = {
  field: "map_display_name",
  sort: "asc",
};

export function columns(modelName) {
  return [
    {
      field: "",
      headerName: "",
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      disableReorder: true,
      filterable: false,
      resizeable: false,
      align: "center",
      renderCell: (params) => {
        return Renderers.ActionsRenderer(params, modelName);
      },
    },
    {
      field: "structure_name",
      headerName: "Structure",
      width: 150,
    },
    {
      field: "map_display_name",
      headerName: "Measurement Site",
      width: 220,
    },
    {
      field: "measure_units",
      headerName: "Staff Gage Units",
      width: 220,
    },
    {
      field: "last_value",
      headerName: "Last Value",
      width: 150,
    },
    {
      field: "last_report",
      headerName: "Last Report",
      width: 200,
      renderCell: Renderers.DateRenderer,
    },
  ];
}

export const fields = [
  {
    name: "Structure",
    key: "structure_name",
    required: true,
    type: CRUD_FIELD_TYPES.TEXT,
    typeConfig: {
      disabled: true,
    },
    cols: 12,
    isOpen: true,
  },
  {
    name: "Measurement Site",
    key: "map_display_name",
    required: true,
    type: CRUD_FIELD_TYPES.TEXT,
    typeConfig: {
      disabled: true,
    },
    cols: 12,
    isOpen: true,
  },
  {
    name: "Staff Gage Units",
    key: "measure_units",
    required: true,
    type: CRUD_FIELD_TYPES.TEXT,
    typeConfig: {
      disabled: true,
    },
    cols: 12,
    isOpen: true,
  },
  {
    name: "Staff Gage Reading",
    key: "de_new_value",
    required: true,
    type: CRUD_FIELD_TYPES.NUMBER,
    typeConfig: {
      decimalScale: 4,
    },
    cols: 12,
    isOpen: true,
  },
  {
    name: "Notes",
    key: "de_new_value_comments",
    required: false,
    type: CRUD_FIELD_TYPES.TEXT,
    cols: 12,
    isOpen: true,
  },
  {
    name: "Reading Date/Time",
    key: "entry_timestamp",
    required: false,
    type: CRUD_FIELD_TYPES.DATETIME,
    cols: 12,
    isOpen: true,
    defaultValue: new Date(),
  },
  {
    type: CRUD_FIELD_TYPES.SECTION_HEADER,
    title: "Location",
  },
  {
    type: CRUD_FIELD_TYPES.CUSTOM,
    component: (config) => {
      return config.data.map_lon_dd && config.data.map_lat_dd ? (
        <Grid item xs={12} style={{ paddingTop: "0" }}>
          <LatLongMap config={config} />
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Typography align="center" variant={"h4"}>
            **This Well is Missing Coordinates**
          </Typography>
          <Typography
            variant={"subtitle2"}
            color={"textSecondary"}
            align="center"
          >
            -Assign coordinates, if available-
          </Typography>

          <Grid item xs={12} style={{ paddingTop: "0" }}>
            <LatLongMap config={config} />
          </Grid>
        </Grid>
      );
    },
  },
  {
    name: "Latitude",
    key: "map_lat_dd",
    required: false,
    type: CRUD_FIELD_TYPES.NUMBER,
    typeConfig: {
      decimalScale: 15,
      min: -90,
      max: 90,
      disabled: true,
    },
    cols: 6,
    isOpen: false,
  },
  {
    name: "Longitude",
    key: "map_lon_dd",
    required: false,
    type: CRUD_FIELD_TYPES.NUMBER,
    typeConfig: {
      decimalScale: 15,
      min: -180,
      max: 180,
      disabled: true,
    },
    cols: 6,
    isOpen: false,
  },
];

const config = {
  displayName,
  columns,
  fields,
};

export default config;
