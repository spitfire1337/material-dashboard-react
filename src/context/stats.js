import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSocket } from "./socket";
import { useLoginState } from "./loginContext";
import { globalFuncs } from "./global";

const StatsContext = createContext();

export const StatsProvider = ({ children }) => {
  const socket = useSocket();
  const { setLoginState } = useLoginState();
  const { setSnackBar } = globalFuncs();

  const [stats, setStats] = useState({
    repairs: 0,
    repairsPickup: 0,
    repairsPaused: 0,
    repairsParts: 0,
    openOrders: 0,
    repairChange: 0,
    sales: {
      labels: [],
      datasets: { label: "Total Sales", data: [] },
    },
    salesChange: 0,
    salesVolume: {
      labels: [],
      datasets: { label: "Total Sales", data: [] },
    },
    topSellersAll: {
      labels: [],
      datasets: { label: "Sales", data: [] },
    },
    topSellersSixty: {
      labels: [],
      datasets: { label: "Sales", data: [] },
    },
    mysales: { lastweek: 0, thisweek: 0 },
    partsonorder: 0,
    unreadSMS: 0,
  });

  const getSales = (res) => {
    if (res.res === 200) {
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

      setStats({
        partsonorder: res.partsOnOrder,
        repairs: res.repairsTotal,
        unreadSMS: res.unreadSMS,
        repairsPickup: res.repairsPickup,
        repairsPaused: res.repairsPaused,
        repairsParts: res.repairsParts,
        openOrders: res.openOrders,
        repairChange:
          ((res.repairs.find((x) => x._id == -30).count -
            res.repairs.find((x) => x._id == -60).count) /
            res.repairs.find((x) => x._id == -60).count) *
          100,
        sales: { labels: saleMonths, datasets: { data: monthlySales } },
        salesVolume: { labels: saleMonths, datasets: { data: mysalesVolume } },
        salesChange:
          res.sales.find((x) => x._id == -7) != undefined
            ? Math.round(
                ((res.sales.find((x) => x._id == -7).sum -
                  res.sales.find((x) => x._id == -14).sum) /
                  res.sales.find((x) => x._id == -14).sum) *
                  100
              )
            : -(res.sales.find((x) => x._id == -14).sum / 100),
        topSellersAll: { labels: salesItemsAll, datasets: { data: salesItemAllVol } },
        topSellersSixty: { labels: salesItemsSixty, datasets: { data: salesItemAllSixty } },
        mysales:
          res.sales.find((x) => x._id == -7) != undefined
            ? res.sales.find((x) => x._id == -7).sum
            : 0,
      });
    } else if (res.res === 401) {
      setLoginState((s) => ({ ...s, loggedin: false }));
      setSnackBar({
        type: "error",
        title: "Session expired",
        message: "Please log in again.",
        show: true,
        icon: "error",
      });
    }
  };

  useEffect(() => {
    if (socket) {
      const handleStats = (data) => {
        getSales(data);
      };
      socket.on("stats", handleStats);
      return () => {
        socket.off("stats", handleStats);
      };
    }
  }, [socket]);

  return <StatsContext.Provider value={{ stats, setStats }}>{children}</StatsContext.Provider>;
};

StatsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useStats = () => useContext(StatsContext);
