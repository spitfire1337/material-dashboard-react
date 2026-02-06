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
// React components
import { useState, React, useEffect } from "react";
// Vars
import vars from "../../config";

//Global
import { globalFuncs } from "../../context/global";
import { useLoginState } from "../../context/loginContext";

import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDButton from "components/MDButton";
// eslint-disable-next-line react/prop-types
const WhatsNew = () => {
  const { setSnackBar } = globalFuncs();
  const { setLoggedIn } = useLoginState();
  const [value, setValue] = useState({ editorState: EditorState.createEmpty() });

  const onEditorStateChange = (editorState) => {
    setValue({ editorState });
  };

  const saveWhatsNew = async () => {
    const response = await fetch(`${vars.serverUrl}/api/updateWhatsNew`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whatsnew: draftToHtml(convertToRaw(value.editorState.getCurrentContent())),
      }),
      credentials: "include",
    });
    const res = await response.json();
    if (res.res === 401) {
      setLoggedIn(false);
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: "Unauthorized, redirecting to login",
        show: true,
        icon: "error",
      });
    } else if (res.res === 500) {
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: "An unexpected error occurred",
        show: true,
        icon: "error",
      });
    } else {
      setValue({ editorState: EditorState.createEmpty() });
      setSnackBar({
        type: "success",
        title: "Whats new updated",
        message: "Whats new content has been updated successfully",
        show: true,
        icon: "check",
      });
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={1}>
              {/* Customer info */}
              <Grid item xs={12}>
                <Card>
                  <MDBox p={6} pl={3} pr={3} pb={3}>
                    <Editor
                      editorState={value.editorState}
                      wrapperClassName="demo-wrapper"
                      editorClassName="demo-editor"
                      toolbarClassName="toolbar-class"
                      onEditorStateChange={onEditorStateChange}
                      toolbar={{
                        inline: { inDropdown: true },
                        list: { inDropdown: true },
                        textAlign: { inDropdown: true },
                        link: { inDropdown: true },
                        history: { inDropdown: true },
                      }}
                    />
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <MDButton color="success" onClick={() => saveWhatsNew()}>
                  Save Changes
                </MDButton>
              </Grid>
            </Grid>
          </Grid>
          {/* Repair Actions & History */}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default WhatsNew;
