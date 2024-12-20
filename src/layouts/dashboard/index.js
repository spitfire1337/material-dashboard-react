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
import { useState, useEffect, useMemo } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import vars from "../../config";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// eslint-disable-next-line react/prop-types
function Dashboard({ globalFunc }) {
  const [mysales, setSales] = useState({ lastweek: 0, thisweek: 0 });
  const [myRepairs, setRepairs] = useState(0);
  const [repairChange, setRepairChange] = useState(0);
  const [salesChange, setSalesChange] = useState(0);
  const { sales, tasks } = reportsLineChartData;

  const getSales = async () => {
    const response = await fetch(`${vars.serverUrl}/square/getsales`, {
      credentials: "include",
    });
    const res = await response.json();
    if (res.res === 200) {
      setSales(
        res.sales.find((x) => x._id == -7) != undefined ? res.sales.find((x) => x._id == -7).sum : 0
      );
      setSalesChange(
        res.sales.find((x) => x._id == -7) != undefined
          ? Math.round(
              ((res.sales.find((x) => x._id == -7).sum - res.sales.find((x) => x._id == -14).sum) /
                res.sales.find((x) => x._id == -14).sum) *
                100
            )
          : -(res.sales.find((x) => x._id == -14).sum / 100)
      );
      setRepairs(res.repairs.find((x) => x._id == -30).count);
      setRepairChange(
        ((res.repairs.find((x) => x._id == -30).count -
          res.repairs.find((x) => x._id == -60).count) /
          res.repairs.find((x) => x._id == -60).count) *
          100
      );
      console.log(repairChange);
    }
  };

  useEffect(() => {
    getSales();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar globalFunc={globalFunc} />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="leaderboard"
                title="Sales"
                count={`$${(mysales / 100)
                  .toFixed(2)
                  .toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                percentage={{
                  color: salesChange > 0 ? "success" : "error",
                  amount: `${salesChange > 0 ? "+" : ""}${salesChange}%`,
                  label: "than lask week",
                }}
              />
            </MDBox>
          </Grid>
          {/* <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Today's Users"
                count="2,300"
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Revenue"
                count="34k"
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "than yesterday",
                }}
              />
            </MDBox>
          </Grid> */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="handyman"
                title="Repairs"
                count={myRepairs}
                percentage={{
                  color: "success",
                  amount: `${repairChange.toFixed(2)}%`,
                  label: "vs last 30 days",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="website views"
                  description="Last Campaign Performance"
                  date="campaign sent 2 days ago"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="daily sales"
                  description={
                    <>
                      (<strong>+15%</strong>) increase in today sales.
                    </>
                  }
                  date="updated 4 min ago"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="completed tasks"
                  description="Last Campaign Performance"
                  date="just updated"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
