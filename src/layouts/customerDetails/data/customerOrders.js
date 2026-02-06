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

export default function data() {
  let redirect = useNavigate();
  const [repairsOrig, setrepairsOrig] = useState([]);
  const [data, setmyData] = useState([]);
  const [searchTerm, setsearchTerm] = useState(null);

  const setOrderData = (mydata) => {
    setmyData(mydata);
  };

  const Pev = ({ title, description, id }) => (
    <MDBox
      lineHeight={1}
      textAlign="left"
      sx={{ cursor: "pointer" }}
      onClick={() => redirect(`/repairs/${id}`, { replace: false })}
    >
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {title}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
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

  const Status = ({ repairStatus }) => {
    if (repairStatus == 0) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Created"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #FFFF00, #989845)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 1) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Not started"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #ffae00, #B38D4C)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 2) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="In Progress"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #00BEFF, #4C99B3)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 3) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Paused"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #3D8E8C, #00FFF9)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == "COMPLETED") {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Complete"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #3C9041, #00FF0F)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 5) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Invoice Created"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #8E833E, #FFDE03)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 6) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Complete"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #329858, #00FF60)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 998) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Cancelled"
            sx={{
              "& .MuiBadge-badge": {
                color: "#fff",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #984742, #FB0F00)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 999) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Unrepairable"
            sx={{
              "& .MuiBadge-badge": {
                color: "#fff",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #9E3755, #F70048)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
  };
  return {
    setOrderData: setOrderData,
    orderColumns: [
      { Header: "date", accessor: "date", align: "left" },
      { Header: "items", accessor: "items", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      {
        Header: "amount",
        accessor: "amount",
        align: "center",
        isSorted: true,
        isSortedDesc: false,
      },
    ],

    orderRows:
      data.length > 0
        ? data.map((order) => {
            return {
              date: moment(order.updated_at).format("MM/DD/yyyy hh:mm a"),
              items: order.line_items.length,
              status: <Status repairStatus={order.state} />,
              amount: `$${order.total_money.amount / 100}`,
            };
          })
        : [],
  };
}
