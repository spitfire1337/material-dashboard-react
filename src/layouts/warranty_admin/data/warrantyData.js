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
import { useLoginState } from "../../../context/loginContext";

import vars from "../../../config";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import moment from "moment";

export default function data(contIntake, filters) {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const { setLoginState } = useLoginState();

  let redirect = useNavigate();
  const [repairsOrig, setrepairsOrig] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [searchTerm, setsearchTerm] = useState(null);

  const defaultFilter = {
    status: [0, 1, 2, 3, 4, 5],
  };
  const fetchData = async () => {
    const response = await fetch(`${vars.serverUrl}/warranty_admin/getWarrantyWheels`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        setrepairsOrig(res.data);
        setRepairs(res.data);
      } else if (res.res === 401) {
        setLoginState(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Unauthorized, redirecting to login",
          show: true,
          icon: "warning",
        });
      }
    } else if (response.status == 401) {
      setLoginState(false);
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

  const doFilter = (data = null) => {
    let filterData;
    if (data == null || data == "") {
      filterData = [...repairsOrig];
    } else {
      filterData = [...data];
    }
    let filtered = filterData.filter((item) => {
      for (var key in myFilters) {
        if (
          item[key] === undefined ||
          myFilters[key].indexOf(item[key].constructor.name == "Array" ? item[key][0] : item[key]) <
            0
        )
          return false;
      }
      return true;
    });
    if (data == null) {
      doSearch(filtered);
    } else {
      setRepairs(filtered);
    }
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
        item.serialNumber.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
        return true;
      if (item.pev.Brand.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      if (item.pev.Model.toLowerCase().includes(searchTerm.toLowerCase())) return true;

      return false;
    });
    setRepairs(filtered);
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
      onClick={() => redirect(`/repairs/${id}`, { replace: false })}
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

  const Status = ({ repairStatus, id }) => {
    if (repairStatus == 0) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
    if (repairStatus == 4) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Repair Complete"
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
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
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
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
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
    if (repairStatus == 998) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
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
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
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
    reRender: reRender,
    setsearchTerm: setsearchTerm,
    searchTerm: searchTerm,
    columns: [
      { Header: "Serial Number", accessor: "serialnumber", align: "left" },
      { Header: "pev", accessor: "pev", align: "left" },
      { Header: "Registered to", accessor: "customer", align: "center" },
      { Header: "warranty start", accessor: "warrantystart", align: "center" },
      { Header: "Battery warranty expires", accessor: "warrantyLengthBattery", align: "center" },
      { Header: "basic warranty expires", accessor: "warrantyLengthOther", align: "center" },
    ],

    rows:
      repairs.length > 0
        ? repairs.map((repair) => {
            return {
              serialnumber: repair.serialNumber,
              pev: (
                <Pev id={repair._id} title={repair.pev.Brand.name} description={repair.pev.Model} />
              ),
              warrantystart: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {!repair.startonpurchase
                    ? moment(repair.warrantyStart).format("MM/DD/yyyy hh:mm a")
                    : "Not started"}
                </MDTypography>
              ),
              warrantyLengthBattery: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {!repair.startonpurchase
                    ? moment(repair.warrantyStart)
                        .add(repair.warrantyLengthBattery, "years")
                        .format("MM/DD/yyyy hh:mm a")
                    : "-"}
                </MDTypography>
              ),
              warrantyLengthOther: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {!repair.startonpurchase
                    ? moment(repair.warrantyStart)
                        .add(repair.warrantyLengthOther, "years")
                        .format("MM/DD/yyyy hh:mm a")
                    : "-"}
                </MDTypography>
              ),
              customer:
                repair.Customer != undefined ? (
                  <Customer
                    id={repair._id}
                    name={
                      (repair.Customer.given_name != undefined ? repair.Customer.given_name : "") +
                      " " +
                      (repair.Customer.family_name != undefined ? repair.Customer.family_name : "")
                    }
                    email={repair.Customer.phone_number || repair.Customer.email_address}
                  />
                ) : (
                  ""
                ),
            };
          })
        : [],
  };
}
