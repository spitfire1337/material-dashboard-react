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
import "../../schedule.css";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  ViewsDirective,
  ViewDirective,
} from "@syncfusion/ej2-react-schedule";
import { Internationalization } from "@syncfusion/ej2-base";
// eslint-disable-next-line react/prop-types
function Appointments({ globalFunc }) {
  const instance = new Internationalization();
  let redirect = useNavigate();
  const [appointments, setAppointments] = useState([]);

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
      console.log("Appointments: ", res.data);
      setAppointments(res.data);
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
  const fieldsData = {
    id: "_id",
    subject: { name: "title" },
    startTime: { name: "start" },
    endTime: { name: "end" },
    SecondaryColor: { name: "SecondaryColor" },
  };
  const getTimeString = (value) => {
    return moment(value).format("hh:mm A");
  };
  const eventTemplate = (props) => {
    const secondaryColor = { background: props.SecondaryColor };
    const primaryColor_1 = { background: props.PrimaryColor };
    const primaryColor_2 = { background: props.PrimaryColor };
    console.log("Event Template Props: ", props);
    return (
      <div className="template-wrap" style={secondaryColor}>
        <div className="subject" style={primaryColor_1}>
          {props.Subject}
        </div>
        <div className="time" style={primaryColor_2}>
          Time: {getTimeString(props.start)} - {getTimeString(props.end)}
        </div>
      </div>
    );
  };
  const eventSettings = { dataSource: appointments, fields: fieldsData, template: eventTemplate };

  return (
    <DashboardLayout>
      <DashboardNavbar globalFunc={globalFunc} />
      {/* <Grid container spacing={3}>
        <Grid item xs={12}> */}
      {/* <Calendar
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
          /> */}
      {/* <WeeklyCalendar week={new Date()}>
            <WeeklyContainer>
              <WeeklyDays />
              <WeeklyBody
                events={[{ title: "Jane doe", date: new Date() }]}
                renderItem={({ item, showingFullWeek }) => (
                  <DefaultWeeklyEventItem
                    key={item.date.toISOString()}
                    title={item.title}
                    date={
                      showingFullWeek ? format(item.date, "MMM do k:mm") : format(item.date, "k:mm")
                    }
                  />
                )}
              />
            </WeeklyContainer>
          </WeeklyCalendar> */}
      <ScheduleComponent width="100%" eventSettings={eventSettings}>
        <ViewsDirective>
          <ViewDirective option="Day" startHour="10:00" endHour="18:00" />
          <ViewDirective option="Week" startHour="10:00" endHour="18:00" />
          <ViewDirective option="Month" showWeekend={true} />
        </ViewsDirective>
        <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
      </ScheduleComponent>
      {/* </Grid>
      </Grid> */}
      <Footer />
    </DashboardLayout>
  );
}

export default Appointments;
