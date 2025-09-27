/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import { useState, React, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import vars from "../../../config";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import moment from "moment";

export default function data(globalFunc, updateLocation, setShowLoad) {
  let redirect = useNavigate();
  const [inventoryOrig, setInventoryOrig] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setsearchTerm] = useState(null);

  const fetchData = async (globalFunc) => {
    const response = await fetch(`${vars.serverUrl}/square/getInventory`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();
      setShowLoad(false);
      if (res.res === 200) {
        setInventoryOrig(res.data);
        setInventory(res.data);
      } else if (res.res === 401) {
        globalFunc.setLoggedIn(false);
        globalFunc.setErrorSBText("Unauthorized, redirecting to login");
        globalFunc.setErrorSB(true);
      }
    } else if (response.status == 401) {
      globalFunc.setLoggedIn(false);
      globalFunc.setErrorSBText("Unauthorized, redirecting to login");
      globalFunc.setErrorSB(true);
    }
  };
  useEffect(() => {
    setShowLoad(true);
    fetchData(globalFunc);
  }, []);

  const reRender = () => {
    setShowLoad(true);
    fetchData(globalFunc);
  };
  useEffect(() => {
    doSearch();
  }, [searchTerm, inventoryOrig]);

  const doSearch = () => {
    let filterData = [...inventory];
    if (searchTerm == "" || searchTerm == null) {
      setInventory(inventoryOrig);
      return;
    }
    let filtered = filterData.filter((item) => {
      if (searchTerm == "" || searchTerm == null) {
        return true;
      }
      // eslint-disable-next-line prettier/prettier
      if (
        item.variant.itemVariationData.name
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
        return true;
      if (item.itemData.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      return false;
    });
    setInventory(filtered);
  };

  const Actions = ({ item }) => {
    return (
      <MDTypography
        component="a"
        href="#"
        variant="caption"
        color="text"
        fontWeight="medium"
        onClick={() => {
          updateLocation(item);
        }}
      >
        Update Location
      </MDTypography>
    );
  };

  return {
    reRender: reRender,
    setsearchTerm: setsearchTerm,
    searchTerm: searchTerm,
    columns: [
      { Header: "Item", accessor: "item", align: "left" },
      { Header: "Quantity", accessor: "quantity", align: "left" },
      { Header: "Location", accessor: "location", align: "center" },
      { Header: "Actions", accessor: "actions", align: "center" },
    ],

    rows:
      inventory.length > 0
        ? inventory.map((item) => {
            return {
              item: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.itemData.name} - {item.variant.itemVariationData.name}
                </MDTypography>
              ),
              quantity: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.quantity}
                </MDTypography>
              ),
              location: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.storage_loc || "--"}
                </MDTypography>
              ),
              actions: <Actions item={item} />,
            };
          })
        : [],
  };
}
