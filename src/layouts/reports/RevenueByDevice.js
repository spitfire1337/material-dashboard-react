import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid, Menu, MenuItem } from "@mui/material";
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
import { useSocket } from "context/socket";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function RevenueByDevice() {
  const socket = useSocket();
  const chartRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [revenueData, setRevenueData] = useState({});
  const { setShowLoad } = globalFuncs();
  const [startDate, setStartDate] = useState(dayjs().subtract(90, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    if (socket) {
      fetchRevenueData();
    }
  }, [socket]);

  const fetchRevenueData = (start, end) => {
    if (!socket) return;
    setShowLoad(true);
    const s = start && start.toISOString ? start : startDate;
    const e = end && end.toISOString ? end : endDate;
    const query = {
      startDate: s ? s.toISOString() : null,
      endDate: e ? e.toISOString() : null,
    };
    socket.emit("getRevenueByDevice", query, (res) => {
      if (res.res === 200) {
        setRevenueData(res);
      } else {
        console.error("Failed to fetch revenue data");
      }
      setShowLoad(false);
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToPDF = async () => {
    handleExportClose();
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const html2canvas = (await import("html2canvas")).default;
      const doc = new jsPDF();

      doc.text("Revenue By Device Report", 14, 15);
      doc.setFontSize(10);
      doc.text(
        `Date Range: ${startDate.format("MM/DD/YYYY")} - ${endDate.format("MM/DD/YYYY")}`,
        14,
        22
      );

      let finalY = 30;

      const addTable = (title, headers, data) => {
        if (finalY > 250) {
          doc.addPage();
          finalY = 20;
        }
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

      if (revenueData.brand && revenueData.brand.length > 0) {
        addTable(
          "Revenue by Brand",
          ["Brand", "Revenue"],
          revenueData.brand.map((item) => [item.brand, formatCurrency(item.revenue)])
        );
      }

      if (revenueData.model && revenueData.model.length > 0) {
        addTable(
          "Revenue by Model",
          ["Model", "Revenue"],
          revenueData.model.map((item) => [item.model, formatCurrency(item.revenue)])
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

      doc.save(`Revenue_By_Device_${dayjs().format("YYYY-MM-DD")}.pdf`);
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

      if (revenueData.brand && revenueData.brand.length > 0) {
        const ws = wb.addWorksheet("Revenue by Brand");
        ws.columns = [
          { header: "Brand", key: "brand", width: 30 },
          { header: "Revenue", key: "revenue", width: 20 },
        ];
        revenueData.brand.forEach((item) =>
          ws.addRow({ brand: item.brand, revenue: item.revenue })
        );
      }

      if (revenueData.model && revenueData.model.length > 0) {
        const ws = wb.addWorksheet("Revenue by Model");
        ws.columns = [
          { header: "Model", key: "model", width: 30 },
          { header: "Revenue", key: "revenue", width: 20 },
        ];
        revenueData.model.forEach((item) =>
          ws.addRow({ model: item.model, revenue: item.revenue })
        );
      }

      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL("image/png");
        const wsCharts = wb.addWorksheet("Charts");
        const imageId = wb.addImage({ base64: imgData, extension: "png" });
        wsCharts.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 800, height: 600 } });
      }

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Revenue_By_Device_${dayjs().format("YYYY-MM-DD")}.xlsx`);
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
                      <MDButton variant="contained" color="info" onClick={() => fetchRevenueData()}>
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
                          fetchRevenueData(start, end);
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
                          fetchRevenueData(start, end);
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
                          fetchRevenueData(start, end);
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
                          fetchRevenueData(start, end);
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
                          fetchRevenueData(start, end);
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
                          fetchRevenueData(start, end);
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
                  </Grid>
                </LocalizationProvider>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
        <MDBox ref={chartRef}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6">Revenue by Brand</MDTypography>
                  {revenueData.brand && revenueData.brand.length > 0 ? (
                    <Chart data={revenueData.brand}>
                      <ArgumentAxis />
                      <ValueAxis tickFormat={() => formatCurrency} />
                      <BarSeries valueField="revenue" argumentField="brand" name="Revenue" />
                      <Title text="Revenue by Brand" />
                      <Animation />
                      <Legend />
                      <EventTracker />
                      <Tooltip
                        contentComponent={(props) => {
                          const item = revenueData.brand[props.targetItem.point];
                          return (
                            <Tooltip.Content
                              {...props}
                              text={`${item.brand}: ${formatCurrency(props.text)}`}
                            />
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
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6">Revenue by Model</MDTypography>
                  {revenueData.model && revenueData.model.length > 0 ? (
                    <Chart data={revenueData.model}>
                      <ArgumentAxis />
                      <ValueAxis tickFormat={() => formatCurrency} />
                      <BarSeries valueField="revenue" argumentField="model" name="Revenue" />
                      <Title text="Revenue by Model" />
                      <Animation />
                      <Legend />
                      <EventTracker />
                      <Tooltip
                        contentComponent={(props) => {
                          const item = revenueData.model[props.targetItem.point];
                          return (
                            <Tooltip.Content
                              {...props}
                              text={`${item.model}: ${formatCurrency(props.text)}`}
                            />
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
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default RevenueByDevice;
