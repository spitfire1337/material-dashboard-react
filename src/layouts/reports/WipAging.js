import React, { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid } from "@mui/material";
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  Title,
  Tooltip,
} from "@devexpress/dx-react-chart-material-ui";
import { Animation, BarSeries, EventTracker } from "@devexpress/dx-react-chart";
import { globalFuncs } from "../../context/global";
import { useSocket } from "context/socket";

function WipAging() {
  const socket = useSocket();
  const { setShowLoad } = globalFuncs();
  const [agingData, setAgingData] = useState([]);

  useEffect(() => {
    if (socket) {
      fetchData();
    }
  }, [socket]);

  const fetchData = () => {
    setShowLoad(true);
    socket.emit("getWipAging", {}, (res) => {
      if (res.res === 200) {
        const mappedData = res.data.map((bucket) => {
          let label = "";
          if (bucket._id === 0) label = "0-3 Days";
          else if (bucket._id === 4) label = "4-7 Days";
          else if (bucket._id === 8) label = "8-14 Days";
          else if (bucket._id === 15) label = "15-30 Days";
          else label = "31+ Days";
          return {
            range: label,
            count: bucket.count,
            repairs: bucket.repairs,
          };
        });
        setAgingData(mappedData);
      } else {
        console.error("Failed to fetch WIP aging data");
      }
      setShowLoad(false);
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">WIP Aging Report</MDTypography>
                {agingData.length > 0 ? (
                  <Chart data={agingData}>
                    <ArgumentAxis />
                    <ValueAxis />
                    <BarSeries valueField="count" argumentField="range" name="Repairs" />
                    <Title text="Active Repairs by Age" />
                    <Animation />
                    <EventTracker />
                    <Tooltip />
                  </Chart>
                ) : (
                  <MDTypography>No data available</MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default WipAging;
