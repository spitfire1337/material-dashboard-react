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
import vars from "../../config";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { editorTemplate, onPopupClose } from "./components/editAppt";
import moment from "moment";
import "../../schedule.css";

// /import "@zach.codes/react-calendar/dist/calendar-tailwind.css";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-calendars/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-lists/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-react-schedule/styles/material.css";
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
const localizer = momentLocalizer(moment);
// eslint-disable-next-line react/prop-types
function Availability({ globalFunc }) {
  //  const [customersSelection, setCustomersSelection] = useState([]);
  const [showCustForm, setShowCustForm] = useState(false);
  const [apptid, setApptId] = useState(0);
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [customers, setCustomers] = useState([]);
  const [pevSelection, setPEVSelection] = useState([]);
  const [allowContinue, setAllowContinue] = useState(false);
  const [pevBrand, setPEVBrand] = useState([]);
  const [showNewPev, setShowNewPev] = useState(false);
  const [brandDisable, setBrandDisable] = useState(true);
  const [newPev, setNewPev] = useState({ Brand: { name: "" }, Model: "", PevType: "EUC" });
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const instance = new Internationalization();
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
      setAppointments(res.data);
      return null;
    } else if (res.res == 401) {
      globalFunc.setLoggedIn(false);
      showSnackBar("error", "Unauthorized");
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);
  const fieldsData = {
    id: "_id",
    subject: { name: "title" },
    startTime: { name: "start" },
    endTime: { name: "end" },
    SecondaryColor: { name: "SecondaryColor" },
  };
  const getTimeString = (value) => {
    return instance.formatDate(value, { skeleton: "hm" });
  };
  const eventTemplate = (props) => {
    const secondaryColor = { background: props.PrimaryColor };
    const primaryColor_1 = { background: props.PrimaryColor };
    const primaryColor_2 = { background: props.PrimaryColor };
    return (
      <div className="template-wrap" style={secondaryColor}>
        <div className="subject" style={primaryColor_1}>
          {props.title}
        </div>
        <div className="time" style={primaryColor_2}>
          Time: {moment(props.start).format("hh:mm A")} - {moment(props.end).format("hh:mm A")}
        </div>
      </div>
    );
  };
  const onPopupOpen = (args) => {
    if (args.type === "Editor") {
      let statusElement = args.element.querySelector("#EventType");
      if (statusElement) {
        statusElement.setAttribute("name", "EventType");
      }
    }
  };

  const eventSettings = { dataSource: appointments, fields: fieldsData, template: eventTemplate };
  const editorHeaderTemplate = (props) => {
    return (
      <div id="event-header">
        {props !== undefined ? (
          props.Subject ? (
            <div>{props.Subject}</div>
          ) : (
            <div>Create Appointment</div>
          )
        ) : (
          <div></div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar globalFunc={globalFunc} />
      <ScheduleComponent
        width="100%"
        height="85vh"
        eventSettings={eventSettings}
        editorTemplate={editorTemplate.bind(this)}
        popupOpen={onPopupOpen.bind(this)}
        popupClose={onPopupClose.bind(this)}
      >
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

export default Availability;
