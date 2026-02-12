import React, { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid } from "@mui/material";
import { Chart, Title, Legend, Tooltip } from "@devexpress/dx-react-chart-material-ui";
import { Animation, PieSeries, EventTracker } from "@devexpress/dx-react-chart";
import vars from "../../config";
import { globalFuncs } from "../../context/global";
import MDButton from "components/MDButton";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function RepairReport() {
  const [repairData, setRepairData] = useState({
    repairType: [],
    deviceType: [],
    brand: [],
    model: [],
  });
  const { setShowLoad } = globalFuncs();
  const [startDate, setStartDate] = useState(dayjs().subtract(90, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    fetchRepairData();
  }, []);

  const fetchRepairData = async () => {
    setShowLoad(true);
    try {
      let url = `${vars.serverUrl}/reports/repairFrequency`;
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      if ([...params].length > 0) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setRepairData(res.data || res);
      } else {
        console.error("Failed to fetch repair frequency data");
      }
    } catch (error) {
      console.error("Error fetching repair frequency data:", error);
    }
    setShowLoad(false);
  };

  const processChartData = (data, nameKey) => {
    if (!data || data.length === 0) return [];
    const total = data.reduce((acc, item) => acc + item.count, 0);
    return data.map((item) => ({
      ...item,
      [nameKey]: `${item[nameKey]} - ${total > 0 ? Math.round((item.count / total) * 100) : 0}%`,
    }));
  };

  const groupData = (data, limit, nameKey) => {
    if (!data || data.length === 0) return [];
    const sorted = [...data].sort((a, b) => b.count - a.count);
    if (sorted.length <= limit) return sorted;

    const top = sorted.slice(0, limit);
    const other = sorted.slice(limit);
    const otherCount = other.reduce((acc, curr) => acc + curr.count, 0);

    return [...top, { [nameKey]: "Other", count: otherCount }];
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
                      <MDButton variant="contained" color="info" onClick={fetchRepairData}>
                        Apply Filters
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          setStartDate(dayjs().subtract(30, "day"));
                          setEndDate(dayjs());
                          fetchRepairData();
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
                          setStartDate(dayjs().subtract(60, "day"));
                          setEndDate(dayjs());
                          fetchRepairData();
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
                          setStartDate(dayjs().subtract(90, "day"));
                          setEndDate(dayjs());
                          fetchRepairData();
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
                          setStartDate(dayjs().subtract(6, "month"));
                          setEndDate(dayjs());
                          fetchRepairData();
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
                          setStartDate(dayjs().subtract(1, "year"));
                          setEndDate(dayjs());
                          fetchRepairData();
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
                          setStartDate(dayjs().subtract(2, "year"));
                          setEndDate(dayjs().subtract(1, "year"));
                          fetchRepairData();
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
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Repair Type Frequency</MDTypography>
                {repairData.repairType && repairData.repairType.length > 0 ? (
                  <Chart data={processChartData(repairData.repairType, "repairType")}>
                    <PieSeries valueField="count" argumentField="repairType" name="Repair Types" />
                    <Title text="Repair Type Frequency" />
                    <Animation />
                    <Legend />
                    <EventTracker />
                    <Tooltip
                      contentComponent={(props) => {
                        const data = processChartData(repairData.repairType, "repairType");
                        return (
                          <Tooltip.Content
                            {...props}
                            text={`${data[props.targetItem.point].repairType}: ${props.text}`}
                          />
                        );
                      }}
                    />
                  </Chart>
                ) : (
                  <MDTypography>No repair type data available</MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Device Type Frequency</MDTypography>
                {repairData.deviceType && repairData.deviceType.length > 0 ? (
                  <Chart data={processChartData(repairData.deviceType, "deviceType")}>
                    <PieSeries valueField="count" argumentField="deviceType" name="Device Types" />
                    <Title text="Device Type Frequency" />
                    <Animation />
                    <Legend />
                    <EventTracker />
                    <Tooltip
                      contentComponent={(props) => {
                        const data = processChartData(repairData.deviceType, "deviceType");
                        return (
                          <Tooltip.Content
                            {...props}
                            text={`${data[props.targetItem.point].deviceType}: ${props.text}`}
                          />
                        );
                      }}
                    />
                  </Chart>
                ) : (
                  <MDTypography>No device type data available</MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Brand Frequency</MDTypography>
                {repairData.brand && repairData.brand.length > 0 ? (
                  <Chart data={processChartData(groupData(repairData.brand, 8, "brand"), "brand")}>
                    <PieSeries valueField="count" argumentField="brand" name="Brands" />
                    <Title text="Brand Frequency" />
                    <Animation />
                    <Legend />
                    <EventTracker />
                    <Tooltip
                      contentComponent={(props) => {
                        const data = processChartData(
                          groupData(repairData.brand, 8, "brand"),
                          "brand"
                        );
                        return (
                          <Tooltip.Content
                            {...props}
                            text={`${data[props.targetItem.point].brand}: ${props.text}`}
                          />
                        );
                      }}
                    />
                  </Chart>
                ) : (
                  <MDTypography>No brand data available</MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Model Frequency</MDTypography>
                {repairData.model && repairData.model.length > 0 ? (
                  <Chart data={processChartData(groupData(repairData.model, 8, "model"), "model")}>
                    <PieSeries valueField="count" argumentField="model" name="Models" />
                    <Title text="Model Frequency" />
                    <Animation />
                    <Legend />
                    <EventTracker />
                    <Tooltip
                      contentComponent={(props) => {
                        const data = processChartData(
                          groupData(repairData.model, 8, "model"),
                          "model"
                        );
                        return (
                          <Tooltip.Content
                            {...props}
                            text={`${data[props.targetItem.point].model}: ${props.text}`}
                          />
                        );
                      }}
                    />
                  </Chart>
                ) : (
                  <MDTypography>No model data available</MDTypography>
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

export default RepairReport;
