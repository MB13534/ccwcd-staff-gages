alter table data.list_measurement_stations_ups
  add column id uuid default uuid_generate_v4() not null;
--     constraint list_measurement_stations_up_pkey
--       primary key;
-- SPLITTER: DO NOT REMOVE --
alter table data.list_measurement_stations_ups
  add column parent_id uuid;
-- SPLITTER: DO NOT REMOVE --
alter table data.list_measurement_stations_ups
  add column former_parent_id uuid;
-- SPLITTER: DO NOT REMOVE --
alter table data.list_measurement_stations_ups
  add column status_id integer default 1
    constraint list_measurement_stations_up_content_node_statuses_id_fk
      references core.content_node_statuses;
-- SPLITTER: DO NOT REMOVE --
alter table data.list_measurement_stations_ups
  add column created_at timestamp default CURRENT_TIMESTAMP;
-- SPLITTER: DO NOT REMOVE --
alter table data.list_measurement_stations_ups
  add column created_by uuid;
-- SPLITTER: DO NOT REMOVE --
alter table data.list_measurement_stations_ups
  add column updated_at timestamp;
-- SPLITTER: DO NOT REMOVE --
alter table data.list_measurement_stations_ups
  add column updated_by uuid;
-- SPLITTER: DO NOT REMOVE --
alter table data.list_measurement_stations_ups
  add column deleted_at timestamp;
-- SPLITTER: DO NOT REMOVE --
alter table data.list_measurement_stations_ups
  add column deleted_by uuid;
-- SPLITTER: DO NOT REMOVE --
-- alter table data.list_measurement_stations_up
--   owner to web_admin;
-- SPLITTER: DO NOT REMOVE --
create unique index if not exists list_measurement_stations_up_id_cindex
  on data.list_measurement_stations_ups (id);
