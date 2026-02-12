import React, { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import colors from "assets/theme/base/colors";
import { Card, Grid } from "@mui/material";
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  Title,
  Legend,
  Tooltip,
} from "@devexpress/dx-react-chart-material-ui";
import { Animation, EventTracker, BarSeries } from "@devexpress/dx-react-chart";
import vars from "../../config";
import { globalFuncs } from "../../context/global";
import MDButton from "components/MDButton";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function RepairTimeAnalysis() {
  const [timeData, setTimeData] = useState({});
  const { setShowLoad } = globalFuncs();
  const { gradients } = colors;
  const [startDate, setStartDate] = useState(dayjs().subtract(90, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    fetchTimeData();
  }, []);

  const fetchTimeData = async (start, end) => {
    setShowLoad(true);
    try {
      let url = `${vars.serverUrl}/reports/repairTimeStats`;
      const params = new URLSearchParams();
      const s = start && start.toISOString ? start : startDate;
      const e = end && end.toISOString ? end : endDate;
      if (s) params.append("startDate", s.toISOString());
      if (e) params.append("endDate", e.toISOString());

      if ([...params].length > 0) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setTimeData(res);
      } else {
        console.error("Failed to fetch repair time analysis data");
      }
    } catch (error) {
      console.error("Error fetching repair time analysis data:", error);
    }
    setShowLoad(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" gutterBottom>
                  Filters
                </MDTypography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <MDButton variant="contained" color="info" onClick={() => fetchTimeData()}>
                        Apply Filters
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(30, "day");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchTimeData(start, end);
                        }}
                      >
                        Last 30 Days
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(60, "day");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchTimeData(start, end);
                        }}
                      >
                        Last 60 Days
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(90, "day");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchTimeData(start, end);
                        }}
                      >
                        Last 90 Days
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(6, "month");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchTimeData(start, end);
                        }}
                      >
                        Last 6 Months
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(1, "year");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchTimeData(start, end);
                        }}
                      >
                        Last Year
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(2, "year");
                          const end = dayjs().subtract(1, "year");
                          setStartDate(start);
                          setEndDate(end);
                          fetchTimeData(start, end);
                        }}
                      >
                        Previous Year
                      </MDButton>
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Repair Time Analysis (By Device Type)</MDTypography>
                {timeData.byDeviceType && timeData.byDeviceType.length > 0 ? (
                  <Chart data={timeData.byDeviceType}>
                    <ArgumentAxis />
                    <ValueAxis />
                    <BarSeries
                      valueField="avgTurnaroundHours"
                      argumentField="deviceType"
                      name="Average Turnaround Time"
                    />
                    <BarSeries
                      valueField="avgDwellHours"
                      argumentField="deviceType"
                      name="Average Dwell Time"
                    />
                    <Title text="Average Repair Turnaround and Dwell Time (Hours)" />
                    <Animation />
                    <Legend />
                    <EventTracker />
                    <Tooltip
                      contentComponent={(props) => {
                        const item = timeData.byDeviceType[props.targetItem.point];
                        return (
                          <MDBox p={2} bgcolor="white" border="1px solid #ccc">
                            <MDTypography variant="button" fontWeight="bold">
                              {item.deviceType}
                            </MDTypography>
                            <MDTypography variant="body2">
                              Avg Turnaround: {item.avgTurnaroundHours} hrs
                            </MDTypography>
                            <MDTypography variant="body2">
                              Avg Dwell: {item.avgDwellHours} hrs
                            </MDTypography>
                          </MDBox>
                        );
                      }}
                    />
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

export default RepairTimeAnalysis;
