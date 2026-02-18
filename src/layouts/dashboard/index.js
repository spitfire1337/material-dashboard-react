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
import { useState } from "react";
import { useLoginState } from "../../context/loginContext";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Dashboard components
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import QuickActions from "layouts/dashboard/components/QuickActions";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
function Dashboard({ stats }) {
  const { loginState } = useLoginState();

  const [sales, setSalesData] = useState({
    labels: [],
    datasets: { label: "Total Sales", data: [] },
  });
  const [salesVolume, setSalesVolume] = useState({
    labels: [],
    datasets: { label: "Sales Volume", data: [] },
  });
  const [topSellersAll, settopSellersAll] = useState({
    labels: [],
    datasets: { label: "Sales", data: [] },
  });
  const [topSellersSixty, settoptopSellersSixty] = useState({
    labels: [],
    datasets: { label: "Sales", data: [] },
  });
  let redirect = useNavigate();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <QuickActions />
            </Grid>
          </Grid>
        </MDBox>
        <Grid container spacing={3}>
          {loginState.user.isAdmin ? (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="leaderboard"
                  title="Sales"
                  count={`$${(stats.mysales / 100)
                    .toFixed(2)
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  percentage={{
                    color: stats.salesChange > 0 ? "success" : "error",
                    amount: `${stats.salesChange > 0 ? "+" : ""}${stats.salesChange}%`,
                    label: "than last week",
                  }}
                />
              </MDBox>
            </Grid>
          ) : (
            ""
          )}
          {loginState.user.isAdmin ? (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="shopping_bag"
                  title="Open Orders"
                  count={stats.openOrders}
                />
              </MDBox>
            </Grid>
          ) : (
            ""
          )}
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
          {loginState.user.isAdmin || loginState.user.isTech ? (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="handyman"
                  title="Current Repairs"
                  onClick={() => redirect(`/repairs`, { replace: false })}
                  count={stats.repairs}
                />
              </MDBox>
            </Grid>
          ) : (
            ""
          )}
          {loginState.user.isAdmin || loginState.user.isTech ? (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="check_box"
                  title="Repairs Ready for Pickup"
                  onClick={() => redirect(`/repairs/5`, { replace: false })}
                  count={stats.repairsPickup}
                />
              </MDBox>
            </Grid>
          ) : (
            ""
          )}
          {loginState.user.isAdmin || loginState.user.isTech ? (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="pause_circle"
                  title="Repairs paused"
                  onClick={() => redirect(`/repairs/3`, { replace: false })}
                  count={stats.repairsPaused}
                />
              </MDBox>
            </Grid>
          ) : (
            ""
          )}
          {loginState.user.isAdmin || loginState.user.isTech ? (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="secondary"
                  icon="alarm_pause"
                  title="Repairs awaiting parts"
                  onClick={() => redirect(`/repairs/11`, { replace: false })}
                  count={stats.repairsParts}
                />
              </MDBox>
            </Grid>
          ) : (
            ""
          )}
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <MDBox mt={4.5}>
              <Grid container spacing={3}>
                {loginState.user.isAdmin ? (
                  <Grid item xs={12} md={6}>
                    <MDBox mb={3}>
                      <ReportsLineChart
                        color="success"
                        title="monthly sales"
                        description={
                          <>
                            {(
                              ((stats.sales.datasets.data[stats.sales.datasets.data.length - 1] -
                                stats.sales.datasets.data[stats.sales.datasets.data.length - 2]) /
                                stats.sales.datasets.data[stats.sales.datasets.data.length - 2]) *
                              100
                            ).toFixed(2)}
                            {"% "}
                            vs last month
                          </>
                        }
                        chart={sales}
                      />
                    </MDBox>
                  </Grid>
                ) : (
                  ""
                )}
                {loginState.user.isAdmin ? (
                  <Grid item xs={12} md={6}>
                    <MDBox mb={3}>
                      <ReportsLineChart
                        color="dark"
                        title="Sales Volume"
                        description={
                          <>
                            {(
                              ((stats.salesVolume.datasets.data[
                                stats.salesVolume.datasets.data.length - 1
                              ] -
                                stats.salesVolume.datasets.data[
                                  stats.salesVolume.datasets.data.length - 2
                                ]) /
                                stats.salesVolume.datasets.data[
                                  stats.salesVolume.datasets.data.length - 2
                                ]) *
                              100
                            ).toFixed(2)}
                            {"% "}
                            vs last month
                          </>
                        }
                        chart={salesVolume}
                      />
                    </MDBox>
                  </Grid>
                ) : (
                  ""
                )}
                {loginState.user.isAdmin ? (
                  <Grid item xs={12} md={6}>
                    <MDBox mb={3}>
                      <ReportsBarChart
                        color="info"
                        title="top sellers"
                        description="All time top selling items"
                        chart={stats.topSellersAll}
                      />
                    </MDBox>
                  </Grid>
                ) : (
                  ""
                )}
                {loginState.user.isAdmin ? (
                  <Grid item xs={12} md={6}>
                    <MDBox mb={3}>
                      <ReportsBarChart
                        color="info"
                        title="top sellers"
                        description="Top selling items last 60 days"
                        chart={stats.topSellersSixty}
                      />
                    </MDBox>
                  </Grid>
                ) : (
                  ""
                )}
              </Grid>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={4}>
            <OrdersOverview />
          </Grid>
        </Grid>
        {/* <MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={8}>
            <Projects />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <OrdersOverview />
          </Grid>
        </Grid>
      </MDBox> */}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
