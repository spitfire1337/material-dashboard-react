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
  const [repairsOrig, setrepairsOrig] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [searchTerm, setsearchTerm] = useState(null);

  const defaultFilter = {
    status: [0, 1, 2, 3, 4, 5],
  };
  const fetchData = async (globalFunc) => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/api/categories`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        setrepairsOrig(res.data);
        setRepairs(res.data);
        setShowLoad(false);
      } else if (res.res === 401) {
        globalFunc.setLoggedIn(false);
        globalFunc.setErrorSBText("Unauthorized, redirecting to login");
        globalFunc.setErrorSB(true);
        setShowLoad(false);
      }
    } else if (response.status == 401) {
      globalFunc.setLoggedIn(false);
      globalFunc.setErrorSBText("Unauthorized, redirecting to login");
      globalFunc.setErrorSB(true);
      setShowLoad(false);
    }
  };
  useEffect(() => {
    fetchData(globalFunc);
  }, []);

  const reRender = () => {
    fetchData(globalFunc);
  };

  useEffect(() => {
    doSearch();
  }, [searchTerm, repairsOrig]);

  const doSearch = () => {
    let filterData = [...repairs];
    if (searchTerm == "" || searchTerm == null) {
      setRepairs(repairsOrig);
      return;
    }
    let filtered = filterData.filter((item) => {
      if (searchTerm == "" || searchTerm == null) {
        return true;
      }
      // eslint-disable-next-line prettier/prettier
      if (
        item.categoryData.name.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
        return true;

      return false;
    });
    setRepairs(filtered);
  };

  const resetFilter = () => {
    setRepairs(repairsOrig);
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
        Update Sku Code
      </MDTypography>
    );
  };

  return {
    repairs: repairsOrig,
    reRender: reRender,
    setsearchTerm: setsearchTerm,
    searchTerm: searchTerm,
    columns: [
      { Header: "Category", accessor: "category", align: "left" },
      { Header: "Root Category", accessor: "rootCategory", align: "left" },
      { Header: "SKU Code", accessor: "sku", align: "left" },
      { Header: "Actions", accessor: "actions", align: "left" },
    ],

    rows:
      repairs.length > 0
        ? repairs.map((repair) => {
            return {
              category: repair.categoryData.name,
              rootCategory:
                repair.categoryData.pathToRoot.length > 0
                  ? repair.categoryData.pathToRoot
                      .map((cat) => cat.categoryName)
                      .reverse()
                      .join(" -> ")
                  : "N/A",
              sku: repair.categoryData.sku || "N/A",
              actions: <Actions item={repair} />,
            };
          })
        : [],
  };
}
