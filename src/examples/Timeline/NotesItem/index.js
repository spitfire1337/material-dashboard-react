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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";
import parse from "html-react-parser";

// @mui material components
import Icon from "@mui/material/Icon";
import moment from "moment";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Timeline context
import { useTimeline } from "examples/Timeline/context";

// Custom styles for the TimelineItem
import timelineItem from "examples/Timeline/TimelineItem/styles";

function NotesItem({ color, icon, notes, dateTime, description, lastItem, user }) {
  const isDark = useTimeline();

  return (
    <MDBox position="relative" mb={3} sx={(theme) => timelineItem(theme, { lastItem, isDark })}>
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgColor={color}
        color="white"
        width="2rem"
        height="2rem"
        borderRadius="50%"
        position="absolute"
        top="8%"
        left="2px"
        zIndex={2}
        sx={{ fontSize: ({ typography: { size } }) => size.sm }}
      >
        <Icon fontSize="inherit">text_snippet</Icon>
      </MDBox>
      <MDBox ml={7.75} pt={description || user ? 0.7 : 0.5} lineHeight={0} maxWidth="30rem">
        <MDTypography variant="button" fontWeight="medium" color={isDark ? "white" : "dark"}>
          {parse(notes)}
        </MDTypography>
        <MDBox mt={0} mb={0.5}>
          <MDTypography variant="caption" color={isDark ? "secondary" : "text"}>
            {user}
          </MDTypography>
        </MDBox>
        <MDBox mt={0}>
          <MDTypography variant="caption" color={isDark ? "secondary" : "text"}>
            {moment(dateTime).format("MM/DD/yyyy hh:mm a")}
          </MDTypography>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

// Setting default values for the props of TimelineItem
NotesItem.defaultProps = {
  color: "info",
  lastItem: false,
  description: "",
};

// Typechecking props for the TimelineItem
NotesItem.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
    "light",
  ]),
  icon: PropTypes.node.isRequired,
  notes: PropTypes.string.isRequired,
  dateTime: PropTypes.string.isRequired,
  description: PropTypes.string,
  lastItem: PropTypes.bool,
};

export default NotesItem;
