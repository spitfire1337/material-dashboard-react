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

export default function data(globalFunc, contIntake, filters) {
  let redirect = useNavigate();
  const [repairsOrig, setrepairsOrig] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [myFilters, setmyFilters] = useState({});
  const defaultFilter = {
    status: [0, 1, 2, 3, 4, 5],
  };
  const fetchData = async (globalFunc) => {
    const response = await fetch(`${vars.serverUrl}/square/getcustomers`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        setrepairsOrig(res.data);
        setRepairs(res.data);
        doFilter();
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
    fetchData(globalFunc);
  }, []);

  const reRender = () => {
    fetchData(globalFunc);
  };

  const doFilter = () => {
    console.log("Requested filter: ", filter);
    let filterData = [...repairsOrig];
    let filtered = filterData.filter((item) => {
      for (var key in myFilters) {
        console.log("Filter options:", myFilters[key]);
        console.log("Item value", item[key].constructor.name == "Array" ? item[key][0] : item[key]);
        console.log(myFilters[key].indexOf(item[key]));
        if (
          item[key] === undefined ||
          myFilters[key].indexOf(item[key].constructor.name == "Array" ? item[key][0] : item[key]) <
            0
        )
          return false;
      }
      return true;
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
