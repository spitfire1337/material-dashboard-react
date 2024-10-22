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
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import moment from "moment";

// Material Dashboard 2 React example components
import TimelineItem from "examples/Timeline/TimelineItem";

function RepairHistory({ data, repairTime }) {
  console.log("History", data);
  return (
    <>
      <MDBox p={2}>
        <MDTypography variant="h6">
          Current repair time: <br />
          {Math.round(60 * repairTime)} minutes
        </MDTypography>
        {data.map((item) => {
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
    </>
  );
  // return (
  //   <>
  //     <MDBox p={2}>
  //       <TimelineItem
  //         color="success"
  //         icon="notifications"
  //         title="$2400, Design changes"
  //         dateTime="22 DEC 7:20 PM"
  //       />
  //       <TimelineItem
  //         color="error"
  //         icon="inventory_2"
  //         title="New order #1832412"
  //         dateTime="21 DEC 11 PM"
  //       />
  //       <TimelineItem
  //         color="info"
  //         icon="shopping_cart"
  //         title="Server payments for April"
  //         dateTime="21 DEC 9:34 PM"
  //       />
  //       <TimelineItem
  //         color="warning"
  //         icon="payment"
  //         title="New card added for order #4395133"
  //         dateTime="20 DEC 2:20 AM"
  //       />
  //       <TimelineItem
  //         color="primary"
  //         icon="calendar_month"
  //         title="New card added for order #4395133"
  //         dateTime="18 DEC 4:54 AM"
  //         lastItem
  //       />
  //     </MDBox>
  //   </>
  // );
}

export default RepairHistory;
