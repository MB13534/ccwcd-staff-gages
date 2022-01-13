import { Renderers } from "../../components/crud/ResultsRenderers";
import { CRUD_FIELD_TYPES } from "../../constants";

export const displayName = (row) => {
  return `${row.map_display_name}`;
};

export const crudModelNameLabels = {
  standard: "Measurement Station",
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
      field: "station_ndx",
      headerName: "Station Index",
      width: 180,
    },
    {
      field: "map_display_name",
      headerName: "Measurement Site",
      width: 220,
    },
    {
      field: "measure_type",
      headerName: "Measure Type",
      width: 200,
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
      width: 160,
    },
    {
      field: "map_lon_dd",
      headerName: "Longitude",
      width: 150,
    },
    {
      field: "map_lat_dd",
      headerName: "Latitude",
      width: 150,
    },
    {
      field: "order_by",
      headerName: "Order By",
      width: 150,
    },
    {
      field: "inactive",
      headerName: "Inactive?",
      width: 150,
    },
    {
      field: "removed",
      headerName: "Removed?",
      width: 150,
    },
    {
      field: "applies_to",
      headerName: "Applies to",
      width: 150,
    },
    {
      field: "de_new_value",
      headerName: "Staff Gage Reading",
      width: 240,
    },
    {
      field: "de_new_value_comments",
      headerName: "Notes",
      width: 150,
    },
    {
      field: "entry_timestamp",
      headerName: "Reading Date/Time",
      width: 240,
      renderCell: Renderers.DateRenderer,
    },
    {
      field: "structure_name",
      headerName: "Structure",
      width: 150,
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
];

const config = {
  displayName,
  columns,
  fields,
};

export default config;
