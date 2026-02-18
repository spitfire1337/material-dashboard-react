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

// @mui material components

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import moment from "moment";
import EditTime from "./editTime";

// Material Dashboard 2 React example components
import TimelineItem from "examples/Timeline/TimelineItem";
import { Grid } from "@mui/material";
import { useState } from "react";
function RepairHistory({ data, repairTime, getRepair, repairID }) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <MDBox p={2}>
        <Grid container>
          <Grid item>
            <MDTypography variant="h6">
              Current repair time: <br />
              {Math.round(60 * repairTime)} minutes
            </MDTypography>
          </Grid>
          <Grid item>
            <MDButton onClick={() => setShowDialog(true)}>Edit</MDButton>
          </Grid>
        </Grid>
        {data.map((item) => {
          return (
            <TimelineItem
              key={item._id}
              color={item.color}
              icon={item.icon}
              title={item.Event}
              user={item.user}
              dateTime={moment(item.createdAt).format("MM/DD/yyyy hh:mm a")}
            />
          );
        })}
      </MDBox>
      <EditTime
        openVar={showDialog}
        hide={setShowDialog}
        repairTime={repairTime}
        getRepair={getRepair}
        repairID={repairID}
      />
    </>
  );
}

export default RepairHistory;
