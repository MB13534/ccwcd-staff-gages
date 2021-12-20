module.exports = (sequelize, DataTypes) => {
  const {INTEGER, TEXT, UUID, REAL, DATE, NUMBER, BOOLEAN} = DataTypes;
  const ListMeasurementStationsUps = sequelize.define(
    'list_measurement_stations_ups',
    {
      station_ndx: {
        type: INTEGER,
      },
      map_display_name: {
        type: TEXT,
      },
      measure_type: {
        type: TEXT,
      },
      measure_units: {
        type: TEXT,
      },
      last_value: {
        type: REAL,
      },
      last_report: {
        type: DATE,
      },
      map_lon_dd: {
        type: NUMBER,
      },
      map_lat_dd: {
        type: NUMBER,
      },
      order_by: {
        type: INTEGER,
      },
      inactive: {
        type: BOOLEAN,
      },
      removed: {
        type: BOOLEAN,
      },
      applies_to: {
        type: TEXT,
      },
      de_new_value: {
        type: REAL,
      },
      de_new_value_comments: {
        type: TEXT,
      },
      id: {
        type: UUID,
        primaryKey: true,
      },
      parent_id: {
        type: UUID,
      },
      former_parent_id: {
        type: UUID,
      },
      status_id: {
        type: INTEGER,
      },
      created_by: {
        type: UUID,
      },
      updated_by: {
        type: UUID,
      },
      deleted_by: {
        type: UUID,
      },
    },
    {
      defaultScope: {
        order: [['created_at', 'asc']],
      },
      schema: 'data',
      paranoid: true,
    }
  );

  ListMeasurementStationsUps.associate = function (models) {
    /* Core Associations */
    ListMeasurementStationsUps.belongsTo(models.content_node_statuses, {
      foreignKey: 'status_id',
      as: 'content_node_statuses',
    });
    ListMeasurementStationsUps.hasMany(models.list_measurement_stations_ups, {
      foreignKey: 'parent_id',
      as: 'versions',
    });
    ListMeasurementStationsUps.belongsTo(models.list_measurement_stations_ups, {
      foreignKey: 'parent_id',
      as: 'parent',
    });
    /* App Associations */
  };

  return ListMeasurementStationsUps;
};
