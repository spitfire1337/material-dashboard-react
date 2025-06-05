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
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Title } from "@mui/icons-material";
const localizer = momentLocalizer(moment);
// eslint-disable-next-line react/prop-types
function Appointments({ globalFunc }) {
  let redirect = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const { defaultDate } = useMemo(
    () => ({
      defaultDate: new Date(),
    }),
    []
  );
  const getAppointments = async () => {
    const response = await fetch(`${vars.serverUrl}/api/appointments`, {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const res = await response.json();
    let myappts = [];
    if (res.res == 200) {
      res.data.map((appointments) => {
        let appt = {
          Title: appointments.title,
          start: new Date(appointments.start),
          end: new Date(appointments.end),
        };
        myappts.push(appt);
      });
      console.log("Appointments: ", myappts);
      setAppointments(myappts);
      return null;
    } else if (res.res == 401) {
      globalFunc.setLoggedIn(false);
      showSnackBar("error", "Unauthorized");
    }
  };

  useEffect(() => {
    getAppointments();
    console.log("User: ", globalFunc.user);
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar globalFunc={globalFunc} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Calendar
            localizer={localizer}
            events={appointments}
            startAccessor="start"
            endAccessor="end"
            defaultDate={defaultDate}
            style={{ height: 500, margin: "50px" }}
            onSelectEvent={(event) => {
              console.log("Selected event: ", event);
              //redirect(`/appointments/${event.id}`);
            }}
          />
        </Grid>
      </Grid>
      <Footer />
    </DashboardLayout>
  );
}

export default Appointments;
