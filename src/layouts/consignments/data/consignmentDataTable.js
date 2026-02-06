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
import { useLoginState } from "context/loginContext";
import vars from "../../../config";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import moment from "moment";

export default function data(contIntake, status) {
  const { setLoggedIn } = useLoginState();
  const { setShowLoad, setSnackBar } = globalFuncs();
  let redirect = useNavigate();
  const [repairsOrig, setrepairsOrig] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [searchTerm, setsearchTerm] = useState(null);
  const [myFilters, setmyFilters] = useState({
    status: status,
    RepairType: [undefined],
  });
  const fetchData = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/api/getConsignments`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        setShowLoad(false);
        setrepairsOrig(res.data);
        setRepairs(res.data);
        // doFilter();
      } else if (res.res === 401) {
        setShowLoad(false);
        setLoggedIn(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Unauthorized, redirecting to login",
          show: true,
          icon: "warning",
        });
      }
    } else if (response.status == 401) {
      setShowLoad(false);
      setLoggedIn(false);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Unauthorized, redirecting to login",
        show: true,
        icon: "warning",
      });
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const reRender = () => {
    fetchData();
  };

  // useEffect(() => {
  //   doFilter();
  // }, [myFilters, repairsOrig]);
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
      onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
    >
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">{email}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const Pev = ({ title, description, id }) => (
    <MDBox
      lineHeight={1}
      textAlign="left"
      sx={{ cursor: "pointer" }}
      onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
    >
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {title}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
    </MDBox>
  );

  const Status = ({ repairStatus, id }) => {
    if (repairStatus == 0) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Received"
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
    if (repairStatus == 1) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Available"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #19c14cff, #48ac7cff)",
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="SOLD, Payout pending"
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
    if (repairStatus == 3) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
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
    if (repairStatus == 11) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Paused - Awaiting parts"
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
    if (repairStatus == 997) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Cancelled - Return to customer"
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
    if (repairStatus == 998) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
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
    repairs: repairsOrig,
    resetFilter: resetFilter,
    filter: filter,
    reRender: reRender,
    setsearchTerm: setsearchTerm,
    searchTerm: searchTerm,
    columns: [
      { Header: "PEV", accessor: "pev", align: "left" },
      { Header: "customer", accessor: "customer", width: "25%", align: "left" },
      { Header: "Sale price", accessor: "price", align: "center" },
      { Header: "status", accessor: "status", align: "center" },
      {
        Header: "received",
        accessor: "received",
        align: "center",
        isSorted: true,
        isSortedDesc: false,
      },
    ],

    rows:
      repairs.length > 0
        ? repairs.map((repair) => {
            console.log(repair.itemData.variations[0].itemVariationData.priceMoney.amount);
            return {
              id: repair.repairID,
              customer: (
                <Customer
                  id={repair._id}
                  name={
                    (repair.customer != undefined && repair.customer.given_name != undefined
                      ? repair.customer.given_name
                      : "") +
                    " " +
                    (repair.customer != undefined && repair.customer.family_name != undefined
                      ? repair.customer.family_name
                      : "")
                  }
                  email={
                    repair.customer != undefined
                      ? repair.customer.phone_number
                      : "" || repair.customer != undefined
                      ? repair.customer.email_address
                      : ""
                  }
                />
              ),
              pev: (
                <Pev id={repair._id} title={repair.pev.Brand.name} description={repair.pev.Model} />
              ),
              price: `$${(
                repair.itemData.variations[0].itemVariationData.priceMoney.amount / 100
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
              status: <Status repairStatus={repair.status} id={repair._id} />,
              received: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                  sx={{ cursor: "pointer" }}
                  onClick={() => redirect(`/repairdetails/${repair._id}`, { replace: false })}
                >
                  {moment(repair.createdAt).format("MM/DD/yyyy hh:mm a")}
                </MDTypography>
              ),
            };
          })
        : [],
  };
}
