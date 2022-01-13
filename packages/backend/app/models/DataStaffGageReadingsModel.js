module.exports = (sequelize, DataTypes) => {
  const {INTEGER, TEXT, REAL, BIGINT, DATE} = DataTypes;
  const DataStaffGageReadings = sequelize.define(
    'data_staff_gage_readings',
    {
      data_ndx: {
        type: BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      station_ndx: {
        type: INTEGER,
      },
      collect_timestamp: {
        type: DATE,
      },
      measured_value: {
        type: REAL,
      },
      notes: {
        type: TEXT,
      },
    },
    {
      defaultScope: {
        order: [['collect_timestamp', 'desc']],
      },
      schema: 'data',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
    }
  );

  return DataStaffGageReadings;
};
