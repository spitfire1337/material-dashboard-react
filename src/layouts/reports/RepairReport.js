import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid, Menu, MenuItem, Icon } from "@mui/material";
import { Chart, Title, Legend, Tooltip } from "@devexpress/dx-react-chart-material-ui";
import { Animation, PieSeries, EventTracker } from "@devexpress/dx-react-chart";
import vars from "../../config";
import { globalFuncs } from "../../context/global";
import MDButton from "components/MDButton";
import { useSocket } from "context/socket";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function RepairReport() {
  const socket = useSocket();
  const chartRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [repairData, setRepairData] = useState({
    repairType: [],
    deviceType: [],
    brand: [],
    model: [],
  });
  const { setShowLoad, setAiChatOpen, setAiLoading, setSnackBar } = globalFuncs();
  const [startDate, setStartDate] = useState(dayjs().subtract(90, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    if (socket) {
      fetchRepairData();
    }
  }, [socket]);

  const fetchRepairData = () => {
    if (!socket) return;
    setShowLoad(true);
    const query = {
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    };
    socket.emit("getRepairFrequency", query, (res) => {
      if (res.res === 200) {
        setRepairData(res.data || res);
      } else {
        console.error("Failed to fetch repair frequency data");
      }
      setShowLoad(false);
    });
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

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const handleAiAnalysis = () => {
    if (!socket) return;
    setAiChatOpen(true);
    setAiLoading(true);
    const query = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    socket.emit("analyzeReport", { reportType: "repairFrequency", query: query }, (res) => {
      if (res.res !== 200) {
        setAiChatOpen(false);
        setAiLoading(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: res.message || "Error analyzing report",
          show: true,
          icon: "warning",
        });
      }
    });
  };

  const exportToPDF = async () => {
    handleExportClose();
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const html2canvas = (await import("html2canvas")).default;
      const doc = new jsPDF();

      doc.text("Repair Frequency Report", 14, 15);
      doc.setFontSize(10);
      doc.text(
        `Date Range: ${startDate.format("MM/DD/YYYY")} - ${endDate.format("MM/DD/YYYY")}`,
        14,
        22
      );

      let finalY = 30;

      const addTable = (title, headers, data) => {
        doc.text(title, 14, finalY);
        autoTable(doc, {
          startY: finalY + 5,
          head: [headers],
          body: data,
          theme: "striped",
          headStyles: { fillColor: [50, 50, 50] },
        });
        finalY = doc.lastAutoTable.finalY + 10;
      };

      if (repairData.repairType.length > 0) {
        addTable(
          "Repair Types",
          ["Type", "Count"],
          repairData.repairType.map((i) => [i.repairType, i.count])
        );
      }
      if (repairData.deviceType.length > 0) {
        addTable(
          "Device Types",
          ["Type", "Count"],
          repairData.deviceType.map((i) => [i.deviceType, i.count])
        );
      }
      if (repairData.brand.length > 0) {
        addTable(
          "Brands",
          ["Brand", "Count"],
          repairData.brand.map((i) => [i.brand, i.count])
        );
      }
      if (repairData.model.length > 0) {
        addTable(
          "Models",
          ["Model", "Count"],
          repairData.model.map((i) => [i.model, i.count])
        );
      }

      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (finalY + imgHeight > doc.internal.pageSize.getHeight()) {
          doc.addPage();
          finalY = 10;
        }

        doc.addImage(imgData, "PNG", 15, finalY, imgWidth, imgHeight);
      }

      doc.save(`Repair_Frequency_${dayjs().format("YYYY-MM-DD")}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    }
  };

  const exportToExcel = async () => {
    handleExportClose();
    try {
      const ExcelJS = (await import("exceljs")).default;
      const fileSaver = await import("file-saver");
      const saveAs = fileSaver.saveAs || fileSaver.default;
      const html2canvas = (await import("html2canvas")).default;

      const wb = new ExcelJS.Workbook();

      if (repairData.repairType.length > 0) {
        const ws = wb.addWorksheet("Repair Types");
        ws.columns = [
          { header: "Type", key: "type", width: 30 },
          { header: "Count", key: "count", width: 15 },
        ];
        repairData.repairType.forEach((i) => ws.addRow({ type: i.repairType, count: i.count }));
      }
      if (repairData.deviceType.length > 0) {
        const ws = wb.addWorksheet("Device Types");
        ws.columns = [
          { header: "Type", key: "type", width: 30 },
          { header: "Count", key: "count", width: 15 },
        ];
        repairData.deviceType.forEach((i) => ws.addRow({ type: i.deviceType, count: i.count }));
      }
      if (repairData.brand.length > 0) {
        const ws = wb.addWorksheet("Brands");
        ws.columns = [
          { header: "Brand", key: "brand", width: 30 },
          { header: "Count", key: "count", width: 15 },
        ];
        repairData.brand.forEach((i) => ws.addRow({ brand: i.brand, count: i.count }));
      }
      if (repairData.model.length > 0) {
        const ws = wb.addWorksheet("Models");
        ws.columns = [
          { header: "Model", key: "model", width: 30 },
          { header: "Count", key: "count", width: 15 },
        ];
        repairData.model.forEach((i) => ws.addRow({ model: i.model, count: i.count }));
      }

      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL("image/png");
        const wsCharts = wb.addWorksheet("Charts");
        const imageId = wb.addImage({ base64: imgData, extension: "png" });
        wsCharts.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 800, height: 600 } });
      }

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Repair_Frequency_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3} mb={3}>
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
                    <Grid item xs={12} md={2}>
                      <MDButton variant="contained" color="secondary" onClick={handleExportClick}>
                        Export
                      </MDButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleExportClose}
                      >
                        <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
                        <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
                      </Menu>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton variant="gradient" color="info" onClick={handleAiAnalysis}>
                        <Icon>auto_awesome</Icon>&nbsp;AI Analysis
                      </MDButton>
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
        <MDBox ref={chartRef}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6">Repair Type Frequency</MDTypography>
                  {repairData.repairType && repairData.repairType.length > 0 ? (
                    <Chart data={processChartData(repairData.repairType, "repairType")}>
                      <PieSeries
                        valueField="count"
                        argumentField="repairType"
                        name="Repair Types"
                      />
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
                      <PieSeries
                        valueField="count"
                        argumentField="deviceType"
                        name="Device Types"
                      />
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
                    <Chart
                      data={processChartData(groupData(repairData.brand, 8, "brand"), "brand")}
                    >
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
                    <Chart
                      data={processChartData(groupData(repairData.model, 8, "model"), "model")}
                    >
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
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default RepairReport;
