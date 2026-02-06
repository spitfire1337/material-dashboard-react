import React from "react";
import MDBox from "components/MDBox";
import MDBadge from "components/MDBadge";

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
  if (repairStatus == 4) {
    return (
      <MDBox ml={-1}>
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

export default Status;
