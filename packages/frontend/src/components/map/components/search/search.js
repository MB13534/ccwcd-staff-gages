import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ClickAwayListener,
  Divider,
  InputAdornment,
  List,
  ListItem,
  Paper,
  Popper,
  TextField,
  Typography,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import Fuse from "fuse.js";
import axios from "axios";
import { useQuery } from "react-query";
import useDebounce from "../../../../hooks/useDebounce";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components/macro";

const CustomSearch = styled(TextField)`
  fieldset {
    border-radius: 15px;
  }
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 1);
  position: absolute;
  top: 10px;
  left: 50px;
  width: calc(100% - 100px);
  z-index: 1;
  &:hover {
    background-color: white;
  }
`;

const SearchResults = ({
  anchorEl,
  open,
  onClose,
  onSelect,
  searchResults,
}) => {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      style={{ zIndex: 2 }}
      transition
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper style={{ width: 200, maxHeight: 165, overflowY: "auto" }}>
          <List dense component="nav" aria-label="main mailbox folders">
            {searchResults?.slice(0, 49)?.map((result) => (
              <React.Fragment key={result?.item?.station_ndx}>
                <ListItem
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                  button
                  onClick={() => {
                    onSelect(result?.item);
                  }}
                >
                  {/* <Typography variant="caption">CUWCD Well Number</Typography> */}
                  <Typography variant="subtitle1">
                    {result?.item?.map_display_name}
                  </Typography>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div>
                      <Typography variant="caption">Structure</Typography>
                      <Typography variant="body1">
                        {result?.item?.structure_name || "N/A"}
                      </Typography>
                    </div>
                    {/*<div>*/}
                    {/*  <Typography variant="caption">Measure Type</Typography>*/}
                    {/*  <Typography variant="body1">*/}
                    {/*    {result?.item?.measure_type || "N/A"}*/}
                    {/*  </Typography>*/}
                    {/*</div>*/}
                  </div>
                  {/* <ListItemText primary={result?.item?.cuwcd_well_number} /> */}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

const Search = ({ onSelect }) => {
  const searchRef = useRef(null);
  const { getAccessTokenSilently } = useAuth0();
  const { data: options } = useQuery(["Search Options"], async () => {
    try {
      const token = await getAccessTokenSilently();

      // Create request headers with token authorization
      const headers = { Authorization: `Bearer ${token}` };
      const { data: response } = await axios.get(
        `${process.env.REACT_APP_ENDPOINT}/api/list-measurement-stations-ups`,
        { headers }
      );
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
  });
  const [value, setValue] = useState("");
  const debouncedSearchValue = useDebounce(value, 200);
  const [searchResults, setSearchResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!searchResults?.length);
  }, [searchResults]);

  const fuzzySearcher = useMemo(() => {
    if (options) {
      return new Fuse(options, {
        ignoreLocation: true,
        keys: ["map_display_name", "structure_name"],
      });
    }
  }, [options]);

  const handleClose = (event) => {
    if (searchRef.current && searchRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleChange = (event) => {
    setValue(event?.target?.value);
  };

  useEffect(() => {
    const results = fuzzySearcher && fuzzySearcher.search(debouncedSearchValue);
    setSearchResults(results);
  }, [debouncedSearchValue, fuzzySearcher]);

  return (
    <>
      <CustomSearch
        id="outlined-basic"
        // label="Well Search"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        autoComplete="off"
        onChange={handleChange}
        onFocus={() => !!value && setOpen(true)}
        placeholder="Search by well attributes"
        ref={searchRef}
        style={{ width: "calc(100% - 100px)" }}
        type="search"
        value={value}
        variant="outlined"
        size="small"
      />
      <SearchResults
        anchorEl={searchRef?.current}
        onClose={handleClose}
        onSelect={onSelect}
        open={open}
        searchResults={searchResults}
      />
    </>
  );
};

export default Search;
