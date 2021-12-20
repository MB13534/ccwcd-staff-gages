import { Renderers } from "../../components/crud/ResultsRenderers";
import { CRUD_FIELD_TYPES } from "../../constants";

export const displayName = (row) => {
  return `${row.map_display_name}`;
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
      field: "content_node_statuses.name",
      renderHeader: Renderers.StatusHelpIconRenderer,
      width: 20,
      sortable: false,
      disableColumnMenu: true,
      disableReorder: true,
      filterable: false,
      resizeable: false,
      align: "center",
      renderCell: Renderers.StatusDotRenderer,
    },
    {
      field: "station_ndx",
      headerName: "Station Index",
      width: 150,
    },
    {
      field: "map_display_name",
      headerName: "Map Display Name",
      width: 150,
    },
    {
      field: "measure_type",
      headerName: "Measure Type",
      width: 150,
    },
    {
      field: "measure_units",
      headerName: "Measure Units",
      width: 150,
    },
    {
      field: "last_value",
      headerName: "Last Value",
      width: 150,
    },
    {
      field: "last_report",
      headerName: "Last Report",
      width: 150,
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
      headerName: "New Value",
      width: 150,
    },
    {
      field: "de_new_value_comments",
      headerName: "New Value Comments",
      width: 150,
    },
    {
      field: "id",
      headerName: "ID",
      width: 100,
      renderCell: Renderers.IdRenderer,
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 250,
      renderCell: Renderers.DateRenderer,
    },
    {
      field: "updated_at",
      headerName: "Updated At",
      width: 200,
      renderCell: Renderers.DateRenderer,
    },
  ];
}

export const fields = [
  {
    name: "Map Display Name",
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
    name: "Measure Units",
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
    name: "New Value",
    key: "de_new_value",
    required: true,
    type: CRUD_FIELD_TYPES.TEXT,
    cols: 12,
    isOpen: true,
  },
  {
    name: "New Value Comments",
    key: "de_new_value_comments",
    required: true,
    type: CRUD_FIELD_TYPES.TEXT,
    cols: 12,
    isOpen: true,
  },
];

const config = {
  displayName,
  columns,
  fields,
};

export default config;
