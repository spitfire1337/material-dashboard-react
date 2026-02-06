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
//Global
import { globalFuncs } from "../../../context/global";

import vars from "../../../config";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { set } from "draft-js/lib/DefaultDraftBlockRenderMap";

export default function data(globalFunc, contIntake, filters) {
  const { setSnackBar, setShowLoad } = globalFuncs();
  let redirect = useNavigate();
  const [repairsOrig, setrepairsOrig] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [myFilters, setmyFilters] = useState(null);
  const defaultFilter = {
    status: [0, 1, 2, 3, 4, 5],
  };
  const fetchData = async (globalFunc) => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/square/getcustomers`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        setShowLoad(false);
        setrepairsOrig(res.data);
        setRepairs(res.data);
        doFilter();
      } else if (res.res === 401) {
        setShowLoad(false);
        globalFunc.setLoggedIn(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Unauthorized, redirecting to login",
          show: true,
          icon: "check",
        });
      }
    } else if (response.status == 401) {
      setShowLoad(false);
      globalFunc.setLoggedIn(false);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Unauthorized, redirecting to login",
        show: true,
        icon: "check",
      });
    }
  };
  useEffect(() => {
    fetchData(globalFunc);
  }, []);

  const reRender = () => {
    fetchData(globalFunc);
  };

  const doFilter = (data = null) => {
    let filterData = [...repairsOrig];
    if (myFilters == "" || myFilters == null) {
      setRepairs(filterData);
      return;
    }
    let filtered = filterData.filter((item) => {
      if (myFilters == "" || myFilters == null) {
        return true;
      }
      if (
        item.given_name != undefined &&
        item.given_name.toLowerCase().includes(myFilters.toLowerCase())
      )
        return true;
      if (
        item.family_name != undefined &&
        item.family_name.toLowerCase().includes(myFilters.toLowerCase())
      )
        return true;
      if (
        item.email_address != undefined &&
        item.email_address.toLowerCase().includes(myFilters.toLowerCase())
      )
        return true;
      if (
        item.phone_number != undefined &&
        item.phone_number.toLowerCase().includes(myFilters.toLowerCase())
      )
        return true;
      return false;
    });
    setRepairs(filtered);
  };
  useEffect(() => {
    doFilter();
  }, [myFilters, repairsOrig]);
  const filter = (filter) => {
    setmyFilters(filter);
  };

  const resetFilter = () => {
    setRepairs(repairsOrig);
  };
  const Customer = ({ image, name, email, id }) => (
    <MDBox
      display="flex"
      alignItems="center"
      lineHeight={1}
      sx={{ cursor: "pointer" }}
      onClick={() => redirect(`/customer/${id}`, { replace: false })}
    >
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
      </MDBox>
    </MDBox>
  );

  const Actions = ({ repairStatus, repair }) => {
    if (repairStatus == 0) {
      return (
        <MDTypography
          component="a"
          href="#"
          variant="caption"
          color="text"
          fontWeight="medium"
          onClick={() => {
            contIntake(repair);
          }}
        >
          Continue intake
        </MDTypography>
      );
    }
  };

  return {
    repairs: repairsOrig,
    resetFilter: resetFilter,
    filter: filter,
    filtered: myFilters,
    reRender: reRender,
    columns: [
      { Header: "customer", accessor: "customer", width: "25%", align: "left" },
      { Header: "phone", accessor: "phone", align: "left" },
      { Header: "email", accessor: "email", align: "left" },
      { Header: "orders", accessor: "orders", align: "left" },
      { Header: "repairs", accessor: "repairs", align: "center" },
    ],

    rows:
      repairs.length > 0
        ? repairs.map((customer) => {
            return {
              customer: (
                <Customer
                  id={customer._id}
                  name={
                    (customer.given_name != undefined ? customer.given_name : "") +
                    " " +
                    (customer.family_name != undefined ? customer.family_name : "")
                  }
                  email={customer.phone_number || customer.email_address}
                />
              ),
              phone: (
                <MDTypography
                  component="a"
                  href={`/customer/${customer._id}`}
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                  sx={{ cursor: "pointer" }}
                  onClick={() => redirect(`/customer/${customer._id}`, { replace: false })}
                >
                  {customer.phone_number || ""}
                </MDTypography>
              ),
              email: (
                <MDTypography
                  component="a"
                  href={`/customer/${customer._id}`}
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                  sx={{ cursor: "pointer" }}
                  onClick={() => redirect(`/customer/${customer._id}`, { replace: false })}
                >
                  {customer.email_address || ""}
                </MDTypography>
              ),
              orders: (
                <MDTypography
                  component="a"
                  href={`/customer/${customer._id}`}
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                  sx={{ cursor: "pointer" }}
                  onClick={() => redirect(`/customer/${customer._id}`, { replace: false })}
                >
                  {customer.orders.length}
                </MDTypography>
              ),
              repairs: (
                <MDTypography
                  component="a"
                  href={`/customer/${customer._id}`}
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                  sx={{ cursor: "pointer" }}
                  onClick={() => redirect(`/customer/${customer._id}`, { replace: false })}
                >
                  {customer.repairs.length}
                </MDTypography>
              ),
            };
          })
        : [],
  };
}
