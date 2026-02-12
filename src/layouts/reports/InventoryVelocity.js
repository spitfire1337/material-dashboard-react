import React, { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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

function InventoryVelocity() {
  const [inventoryData, setInventoryData] = useState([]);
  const { setShowLoad } = globalFuncs();
  const [startDate, setStartDate] = useState(dayjs().subtract(90, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const [repairType, setRepairType] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const repairTypes = ["Tire Change", "Tube Change", "Power issue", "Mechanical Repair", "Other"];
  const deviceTypes = ["EUC", "Scooter", "OneWheel", "Ebike", "Emoto", "Eskate"];

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async (start, end) => {
    setShowLoad(true);
    try {
      let url = `${vars.serverUrl}/reports/partsVelocity`;
      const params = new URLSearchParams();
      const s = start && start.toISOString ? start : startDate;
      const e = end && end.toISOString ? end : endDate;
      if (s) params.append("startDate", s.toISOString());
      if (e) params.append("endDate", e.toISOString());
      if (repairType) params.append("repairType", repairType);
      if (deviceType) params.append("deviceType", deviceType);

      if ([...params].length > 0) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setInventoryData(res.data);
      } else {
        console.error("Failed to fetch inventory velocity data");
      }
    } catch (error) {
      console.error("Error fetching inventory velocity data:", error);
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
                    <Grid item xs={12} md={3}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Repair Type</InputLabel>
                        <Select
                          value={repairType}
                          label="Repair Type"
                          onChange={(e) => setRepairType(e.target.value)}
                          sx={{ height: "44px" }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {repairTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Device Type</InputLabel>
                        <Select
                          value={deviceType}
                          label="Device Type"
                          onChange={(e) => setDeviceType(e.target.value)}
                          sx={{ height: "44px" }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {deviceTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <MDButton
                        variant="contained"
                        color="info"
                        onClick={() => fetchInventoryData()}
                      >
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
                          fetchInventoryData(start, end);
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
                          fetchInventoryData(start, end);
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
                          fetchInventoryData(start, end);
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
                          fetchInventoryData(start, end);
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
                          fetchInventoryData(start, end);
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
                          fetchInventoryData(start, end);
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
                <MDTypography variant="h6">Inventory Velocity (Top Items Used)</MDTypography>
                {inventoryData.length > 0 ? (
                  <Chart data={inventoryData}>
                    <ArgumentAxis showLabels={false} />
                    <ValueAxis />
                    <BarSeries
                      valueField="totalQuantity"
                      argumentField="partName"
                      name="Quantity Used"
                    />
                    <Title text="Most Used Inventory Items" />
                    <Animation />
                    <EventTracker />
                    <Tooltip
                      contentComponent={(props) => {
                        const item = inventoryData[props.targetItem.point];
                        return (
                          <Tooltip.Content {...props} text={`${item.partName}: ${props.text}`} />
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

export default InventoryVelocity;
