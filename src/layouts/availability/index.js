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
import { useState, useEffect, useMemo, useRef } from "react";

// @mui material components
import vars from "../../config";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { DateTimePickerComponent } from "@syncfusion/ej2-react-calendars";

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
import MDButton from "components/MDButton";
import { Grid } from "@mui/material";
import { isNullOrUndefined } from "@syncfusion/ej2-base";

import { Internationalization } from "@syncfusion/ej2-base";
const localizer = momentLocalizer(moment);
// eslint-disable-next-line react/prop-types
function Availability({ globalFunc }) {
  const scheduleObj = useRef(null);
  const [techs, setTechs] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedTechText, setSelectedTechText] = useState(null);
  const [available, setAvailable] = useState(null);
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [apptId, setApptid] = useState(null);
  const [canDelete, setCanDelete] = useState(true);
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
    const response = await fetch(`${vars.serverUrl}/api/myavailability`, {
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
          title: appointments.title,
          start: new Date(appointments.start),
          end: new Date(appointments.end),
          id: appointments._id,
          PrimaryColor: appointments.PrimaryColor,
          techId: appointments.techid,
          techName: appointments.techName,
          available: appointments.available,
          canDelete: appointments.canDelete,
        };
        myappts.push(appt);
      });
      setAppointments(myappts);
      return null;
    } else if (res.res == 401) {
      globalFunc.setLoggedIn(false);
      globalFunc.setErrorSBText("Unauthorized");
      globalFunc.setErrorSB(true);
    }
  };

  const deleteAvailability = async () => {
    const response = await fetch(`${vars.serverUrl}/api/deleteAvailability`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: apptId }),
      credentials: "include",
    });
    const res = await response.json();
    let techs = [];
    if (res.res == 200) {
      globalFunc.setSuccessSBText("Availability deleted");
      globalFunc.setSuccessSB(true);
      scheduleObj.current.closeEditor();
      getAppointments();
      return null;
    } else if (res.res == 401) {
      globalFunc.setLoggedIn(false);
      globalFunc.setErrorSBText("Unauthorized");
      globalFunc.setErrorSB(true);
    } else if (res.res == 500) {
      globalFunc.setErrorSBText(res.message || "Error deleting availability");
      globalFunc.setErrorSB(true);
    }
  };

  const getTechs = async () => {
    const response = await fetch(`${vars.serverUrl}/api/getTechs`, {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const res = await response.json();
    let techs = [];
    if (res.res == 200) {
      res.data.map((tech) => {
        let appt = {
          name: tech.displayName,
          selected: tech.selected,
          id: tech.id,
        };
        if (tech.selected) {
          setSelectedTech(tech.id);
        }
        techs.push(appt);
      });
      setTechs(techs);
      return null;
    } else if (res.res == 401) {
      globalFunc.setLoggedIn(false);
      showSnackBar("error", "Unauthorized");
    }
  };

  useEffect(() => {
    getAppointments();
    getTechs();
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
  const onPopupClose = (args) => {
    if (args.type === "Editor" && !isNullOrUndefined(args.data)) {
    }
    getTechs();
  };
  const techChange = (value) => {
    let tech = techs.find((tech) => tech.id === value);
    console.log("Tech: ", tech);
    if (tech) {
      setSelectedTech(tech.id);
      setSelectedTechText(tech.name);
    } else {
      setSelectedTech(null);
      setSelectedTechText(null);
    }
  };
  const fields = { text: "name", value: "id" };
  const editorTemplate = (props) => {
    console.log("Props: ", props);
    return props !== undefined ? (
      <div>
        <table className="custom-event-editor">
          <tbody>
            <tr>
              <td className="e-textlabel">Tech</td>
              <td colSpan={4}>
                <DropDownListComponent
                  id="Techs"
                  placeholder="Select tech"
                  data-name="Techs"
                  className="e-field"
                  dataSource={techs}
                  fields={fields}
                  onChange={(e) => techChange(e.value)}
                  value={selectedTech}
                  disabled={!globalFunc.user.isAdmin}
                ></DropDownListComponent>
              </td>
            </tr>
            <tr>
              <td className="e-textlabel">Availabilty</td>
              <td colSpan={4}>
                <DropDownListComponent
                  id="EventType"
                  placeholder="Choose Availabilty"
                  data-name="EventType"
                  className="e-field"
                  dataSource={["Available", "Unavailable"]}
                  onChange={(e) => {
                    setAvailable(e.value);
                  }}
                  value={available || null}
                ></DropDownListComponent>
              </td>
            </tr>
            <tr>
              <td className="e-textlabel">From</td>
              <td colSpan={4}>
                <DateTimePickerComponent
                  format="dd/MM/yy hh:mm a"
                  id="StartTime"
                  data-name="StartTime"
                  onChange={(e) => {
                    setStartTime(e.value);
                  }}
                  value={startTime}
                  className="e-field"
                ></DateTimePickerComponent>
              </td>
            </tr>
            <tr>
              <td className="e-textlabel">To</td>
              <td colSpan={4}>
                <DateTimePickerComponent
                  format="dd/MM/yy hh:mm a"
                  id="EndTime"
                  data-name="EndTime"
                  onChange={(e) => {
                    setEndTime(e.value);
                  }}
                  value={endTime}
                  className="e-field"
                ></DateTimePickerComponent>
              </td>
            </tr>
          </tbody>
        </table>
        <Grid container spacing={1} marginTop={1}>
          <Grid item md={4}>
            <MDButton onClick={() => deleteAvailability()} color="error" disabled={canDelete}>
              Delete
            </MDButton>
          </Grid>
          <Grid item md={6}>
            <MDButton onClick={() => onSaveButtonClick()} color="success">
              Save
            </MDButton>
            <MDButton onClick={() => scheduleObj.current.closeEditor()} color="error">
              Cancel
            </MDButton>
          </Grid>
        </Grid>
      </div>
    ) : (
      <div></div>
    );
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
  const eventSettings = {
    dataSource: appointments,
    fields: fieldsData,
    template: eventTemplate,
    allowAdding: globalFunc.user.isAdmin,
  };

  const onSaveButtonClick = async (props) => {
    let color = "#Ff0000";
    if (available == "Available" && globalFunc.user.account.localAccountId == selectedTech) {
      color = "#47bb76";
    } else {
      color = "#Ff0000";
    }
    let Data = {
      title: available + " - " + selectedTechText,
      id: apptId || null,
      available: available,
      start: new Date(startTime),
      end: new Date(endTime),
      IsAllDay: false,
      PrimaryColor: color,
      tech: selectedTech,
      techName: selectedTechText,
      canDelete: true,
    };
    const response = await fetch(`${vars.serverUrl}/api/myavailability`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Data),
      credentials: "include",
    });
    const json = await response.json();
    if (json.res == 200) {
      if (apptId == null) {
        scheduleObj.current.addEvent(Data);
      } else {
        scheduleObj.current.saveEvent(Data);
      }
      scheduleObj.current.closeEditor();
    } else if (json.res == 500) {
      globalFunc.setErrorSBText(json.message || "Error saving availability");
      globalFunc.setErrorSB(true);
    } else {
      globalFunc.setLoggedIn(false);
      globalFunc.setErrorSBText("Unauthorized, redirecting to login");
      globalFunc.setErrorSB(true);
    }
  };

  const onPopupOpen = (args) => {
    if (args.type === "Editor") {
      console.log(args);
      setCanDelete(!args.data.canDelete);
      setApptid(args.data.id || null);
      setAvailable(args.data.available);
      setSelectedTechText(args.data.techName || globalFunc.user.account.name);
      setSelectedTech(args.data.techId || globalFunc.user.account.localAccountId);
      setStartTime(args.data.start);
      setEndTime(args.data.end);
    }
  };
  const editorFooterTemplate = () => {
    return <div id="event-footer"></div>;
  };

  return (
    <DashboardLayout>
      <DashboardNavbar globalFunc={globalFunc} />
      <ScheduleComponent
        width="100%"
        height="85vh"
        ref={scheduleObj}
        eventSettings={eventSettings}
        popupClose={onPopupClose.bind(this)}
        popupOpen={onPopupOpen.bind(this)}
        editorTemplate={editorTemplate.bind(this)}
        editorFooterTemplate={editorFooterTemplate.bind(this)}
        showQuickInfo={false}
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
