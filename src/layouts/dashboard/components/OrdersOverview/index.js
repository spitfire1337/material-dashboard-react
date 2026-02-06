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

// @mui material components
import Card from "@mui/material/Card";
//Global
import { globalFuncs } from "../../../../context/global";
import { useLoginState } from "../../../../context/loginContext";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import TimelineItem from "examples/Timeline/TimelineItem";
import { useState, useEffect } from "react";
import vars from "../../../../config";
import moment from "moment";

function OrdersOverview() {
  const { setLoggedIn } = useLoginState();
  const { setSnackBar } = globalFuncs();
  const [history, setHistory] = useState([]);

  const fetchData = async () => {
    const response = await fetch(`${vars.serverUrl}/square/getHistory`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        setHistory(res.data);
      } else if (res.res === 401) {
        setLoggedIn(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Unauthorized, redirecting to login",
          show: true,
          icon: "warning",
        });
      }
    } else if (response.status == 401) {
      setLoggedIn(false);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Unauthorized, redirecting to login",
        show: true,
        icon: "warning",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          History
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        {history.map((item) => {
          return (
            <TimelineItem
              key={item._id}
              color={item.color}
              icon={item.icon}
              title={item.Event}
              user={item.user}
              dateTime={moment(item.createdAt).format("MM/DD/yyyy hh:mm a")}
            />
          );
        })}
      </MDBox>
    </Card>
  );
}

export default OrdersOverview;
