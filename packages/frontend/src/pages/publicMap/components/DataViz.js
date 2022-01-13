import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import styled from "styled-components/macro";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import MaterialTable from "material-table";

const OuterContainer = styled(Box)`
  margin-left: 49px;
  bottom: 30px;
  z-index: 10000;
  position: absolute;
  height: ${({ open }) => (open ? "auto" : "0")};
  max-height: 400px;
  width: calc(100% - 49px - 49px);
  display: ${({ open }) => (open ? "block" : "none")};
`;

const Viz = styled.div`
  height: 400px;
  max-width: 100%;
  overflow-y: auto;
`;

const DataViz = ({ open = false, dataVizWellNumber, dataVizGraphType }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [currentSelectedTimeseriesData, setCurrentSelectedTimeseriesData] =
    useState(null);
  useEffect(() => {
    if (dataVizWellNumber && dataVizGraphType) {
      async function send() {
        try {
          const token = await getAccessTokenSilently();
          const headers = { Authorization: `Bearer ${token}` };

          const endpoint = {
            count_production: "graph-wellproductions",
            count_waterlevels: "graph-depthtowater",
            count_wqdata: "graph-waterquality",
          };

          const { data: results } = await axios.post(
            `${process.env.REACT_APP_ENDPOINT}/api/${endpoint[dataVizGraphType]}/${dataVizWellNumber}`,
            {
              cuwcd_well_number: dataVizWellNumber,
            },
            { headers }
          );

          if (results.length) {
            setCurrentSelectedTimeseriesData(results);
          } else {
            setCurrentSelectedTimeseriesData(null);
          }
        } catch (err) {
          // Is this error because we cancelled it ourselves?
          if (axios.isCancel(err)) {
            console.log(`call was cancelled`);
          } else {
            console.error(err);
          }
        }
      }
      send();
    }
  }, [dataVizWellNumber, dataVizGraphType]); // eslint-disable-line

  useEffect(() => {
    if (currentSelectedTimeseriesData) {
      console.log(dataVizWellNumber, dataVizGraphType);
      console.log(currentSelectedTimeseriesData);
    }
  }, [currentSelectedTimeseriesData]); // eslint-disable-line

  const columns = [{ title: "Allocation", field: "allocation_af" }];

  return (
    <OuterContainer
      bgcolor="#ffffff"
      boxShadow="0 0 0 2px rgba(0,0,0,.1)"
      borderRadius={4}
      open={open}
    >
      <Viz>
        {currentSelectedTimeseriesData && (
          <MaterialTable
            data={currentSelectedTimeseriesData}
            columns={columns}
          ></MaterialTable>
        )}
      </Viz>
    </OuterContainer>
  );
};

export default DataViz;
