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
import { useNavigate } from "react-router-dom";
import { set } from "draft-js/lib/DefaultDraftBlockRenderMap";

// eslint-disable-next-line react/prop-types
function Dashboard({ globalFunc }) {
  const [mysales, setSales] = useState({ lastweek: 0, thisweek: 0 });
  const [myRepairs, setRepairs] = useState(0);
  const [myRepairsPickup, setRepairsPickup] = useState(0);
  const [myRepairsPaused, setRepairsPaused] = useState(0);
  const [myRepairsParts, setRepairsParts] = useState(0);
  const [repairChange, setRepairChange] = useState(0);
  const [salesChange, setSalesChange] = useState(0);
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
      setRepairs(res.repairsTotal);
      setRepairsPickup(res.repairsPickup);
      setRepairsPaused(res.repairsPaused);
      setRepairsParts(res.repairsParts);
      setRepairChange(
        ((res.repairs.find((x) => x._id == -30).count -
          res.repairs.find((x) => x._id == -60).count) /
          res.repairs.find((x) => x._id == -60).count) *
          100
      );
      let monthlySales = [];
      let saleMonths = [];
      let mysalesVolume = [];
      res.monthlySales.map((month) => {
        saleMonths.push(month.Month);
        mysalesVolume.push(month.totalsales);
        monthlySales.push(month.sum / 100);
      });
      let salesItemsAll = [];
      let salesItemAllVol = [];
      res.topSellersAll.map((item, i) => {
        if (item._id != "Labor" || item._id != "Gen Merch" || i < 10) {
          salesItemsAll.push(item._id);
          salesItemAllVol.push(item.sales);
        }
      });
      let salesItemsSixty = [];
      let salesItemAllSixty = [];
      res.topSellersSixty.map((item, i) => {
        if (item._id != "Labor" || item._id != "Gen Merch" || i < 10) {
          salesItemsSixty.push(item._id);
          salesItemAllSixty.push(item.sales);
        }
      });
      settoptopSellersSixty({ labels: salesItemsSixty, datasets: { data: salesItemAllSixty } });
      settopSellersAll({ labels: salesItemsAll, datasets: { data: salesItemAllVol } });
      setSalesData({ labels: saleMonths, datasets: { data: monthlySales } });
      setSalesVolume({ labels: saleMonths, datasets: { data: mysalesVolume } });
    } else if (res.res === 401) {
      globalFunc.logoutUser();
      globalFunc.showAlert("Session expired. Please log in again.", "error");
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
          {globalFunc.user.isAdmin ? (
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
          {globalFunc.user.isAdmin || globalFunc.user.isTech ? (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="handyman"
                  title="Current Repairs"
                  onClick={() => redirect(`/repairs`, { replace: false })}
                  count={myRepairs}
                />
              </MDBox>
            </Grid>
          ) : (
            ""
          )}
          {globalFunc.user.isAdmin || globalFunc.user.isTech ? (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="check_box"
                  title="Repairs Ready for Pickup"
                  onClick={() => redirect(`/repairs/5`, { replace: false })}
                  count={myRepairsPickup}
                />
              </MDBox>
            </Grid>
          ) : (
            ""
          )}
          {globalFunc.user.isAdmin || globalFunc.user.isTech ? (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="pause_circle"
                  title="Repairs paused"
                  onClick={() => redirect(`/repairs/3`, { replace: false })}
                  count={myRepairsPaused}
                />
              </MDBox>
            </Grid>
          ) : (
            ""
          )}
          {globalFunc.user.isAdmin || globalFunc.user.isTech ? (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="secondary"
                  icon="alarm_pause"
                  title="Repairs awaiting parts"
                  onClick={() => redirect(`/repairs/11`, { replace: false })}
                  count={myRepairsParts}
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
                {globalFunc.user.isAdmin ? (
                  <Grid item xs={12} md={6}>
                    <MDBox mb={3}>
                      <ReportsLineChart
                        color="success"
                        title="monthly sales"
                        description={
                          <>
                            {(
                              ((sales.datasets.data[sales.datasets.data.length - 1] -
                                sales.datasets.data[sales.datasets.data.length - 2]) /
                                sales.datasets.data[sales.datasets.data.length - 2]) *
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
                {globalFunc.user.isAdmin ? (
                  <Grid item xs={12} md={6}>
                    <MDBox mb={3}>
                      <ReportsLineChart
                        color="dark"
                        title="Sales Volume"
                        description={
                          <>
                            {(
                              ((salesVolume.datasets.data[salesVolume.datasets.data.length - 1] -
                                salesVolume.datasets.data[salesVolume.datasets.data.length - 2]) /
                                salesVolume.datasets.data[salesVolume.datasets.data.length - 2]) *
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
                {globalFunc.user.isAdmin ? (
                  <Grid item xs={12} md={6}>
                    <MDBox mb={3}>
                      <ReportsBarChart
                        color="info"
                        title="top sellers"
                        description="All time top selling items"
                        chart={topSellersAll}
                      />
                    </MDBox>
                  </Grid>
                ) : (
                  ""
                )}
                {globalFunc.user.isAdmin ? (
                  <Grid item xs={12} md={6}>
                    <MDBox mb={3}>
                      <ReportsBarChart
                        color="info"
                        title="top sellers"
                        description="Top selling items last 60 days"
                        chart={topSellersSixty}
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
            <OrdersOverview globalFunc={globalFunc} />
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
