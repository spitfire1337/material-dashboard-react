import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { DateTimePickerComponent } from "@syncfusion/ej2-react-calendars";
import { useState, useEffect, useMemo, createContext, useContext, useRef } from "react";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import MDTypography from "components/MDTypography";
import { isNullOrUndefined } from "@syncfusion/ej2-base";

import {
  Modal,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Divider,
  Grid,
  FormControlLabel,
  FormGroup,
  Checkbox,
  NativeSelect,
} from "@mui/material";
import vars from "../../../config";

const editorTemplate = (props) => {
  return props !== undefined ? (
    <table className="custom-event-editor">
      <tbody>
        <tr>
          <td className="e-textlabel">Availabilty</td>
          <td colSpan={4}>
            <DropDownListComponent
              id="EventType"
              placeholder="Choose Availabilty"
              data-name="EventType"
              className="e-field"
              dataSource={["Available", "Unavailable"]}
              value={props.EventType || null}
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
              value={new Date(props.start || props.start)}
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
              value={new Date(props.end || props.end)}
              className="e-field"
            ></DateTimePickerComponent>
          </td>
        </tr>
      </tbody>
    </table>
  ) : (
    <div></div>
  );
};

const onPopupClose = (args) => {
  console.log("Args:", args);
  if (args.type === "Editor" && !isNullOrUndefined(args.data)) {
    console.log("Editor Data: ", args.data);
    //   let subjectElement = args.element.querySelector("#Summary");
    //   if (subjectElement) {
    //     args.data.Subject = subjectElement.value;
    //   }
    //   let statusElement = args.element.querySelector("#EventType");
    //   if (statusElement) {
    //     args.data.EventType = statusElement.value;
    //   }
    //   args.data.StartTime = startObj.current.value;
    //   args.data.EndTime = endObj.current.value;
    //   let descriptionElement = args.element.querySelector("#Description");
    //   if (descriptionElement) {
    //     args.data.Description = descriptionElement.value;
    //   }
  }
};

export { editorTemplate, onPopupClose };
