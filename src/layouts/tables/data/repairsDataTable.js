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
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import moment from "moment";
// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

export default function data(globalFunc, contIntake) {
  let redirect = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const fetchData = async (globalFunc) => {
    const response = await fetch(`${vars.serverUrl}/square/getMyData?action=getRepairs`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        setRepairs(res.data);
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
    reRender: reRender,
    columns: [
      { Header: "customer", accessor: "customer", width: "25%", align: "left" },
      { Header: "pev", accessor: "pev", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      {
        Header: "received",
        accessor: "received",
        align: "center",
        isSorted: true,
        isSortedDesc: false,
      },
      { Header: "updated", accessor: "updated", align: "center" },
    ],

    rows:
      repairs.length > 0
        ? repairs.map((repair) => {
            return {
              customer: (
                <Customer
                  id={repair._id}
                  name={
                    repair.Customer.given_name + " " + repair.Customer.family_name != undefined
                      ? repair.Customer.family_name
                      : ""
                  }
                  email={repair.Customer.phone_number || repair.Customer.email_address}
                />
              ),
              pev: (
                <Pev id={repair._id} title={repair.pev.Brand.name} description={repair.pev.Model} />
              ),
              status: <Status repairStatus={repair.status} id={repair._id} />,
              received: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                  sx={{ cursor: "pointer" }}
                  onClick={() => redirect(`/repairs/${repair._id}`, { replace: false })}
                >
                  {moment(repair.createdAt).format("MM/DD/yyyy hh:mm a")}
                </MDTypography>
              ),
              updated: (
                <MDTypography
                  component="a"
                  href={"/repairs/" + repair._id}
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {moment(repair.updatedAt).format("MM/DD/yyyy hh:mm a")}
                </MDTypography>
              ),
            };
          })
        : [],
    // [
    //   {
    //     author: <Author image={team2} name="John Michael" email="john@creative-tim.com" />,
    //     function: <Job title="Manager" description="Organization" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         23/04/18
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    //   {
    //     author: <Author image={team3} name="Alexa Liras" email="alexa@creative-tim.com" />,
    //     function: <Job title="Programator" description="Developer" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="offline" color="dark" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         11/01/19
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    //   {
    //     author: <Author image={team4} name="Laurent Perrier" email="laurent@creative-tim.com" />,
    //     function: <Job title="Executive" description="Projects" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         19/09/17
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    //   {
    //     author: <Author image={team3} name="Michael Levi" email="michael@creative-tim.com" />,
    //     function: <Job title="Programator" description="Developer" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         24/12/08
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    //   {
    //     author: <Author image={team3} name="Richard Gran" email="richard@creative-tim.com" />,
    //     function: <Job title="Manager" description="Executive" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="offline" color="dark" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         04/10/21
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    //   {
    //     author: <Author image={team4} name="Miriam Eric" email="miriam@creative-tim.com" />,
    //     function: <Job title="Programator" description="Developer" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="offline" color="dark" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         14/09/20
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    // ],
  };
}
