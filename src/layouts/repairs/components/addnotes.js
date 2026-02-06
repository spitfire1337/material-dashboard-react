import { useState } from "react";
import { Modal, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import vars from "../../../config";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import { globalFuncs } from "../../../context/global";
import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};
const AddNotes = ({ setShowLoad, getRepair, newRepairNotes, setnewRepairNotes, repairId }) => {
  const { setSnackBar } = globalFuncs();
  const saveNotes = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/repairNotes`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repairId: repairId,
        notes: draftToHtml(convertToRaw(value.editorState.getCurrentContent())),
      }),
      credentials: "include",
    });
    const res = await response.json();
    if (res.res === 401) {
      //globalFunc.setLoggedIn(false);
      setSnackBar({
        type: "error",
        title: "Unauthorized",
        message: "redirecting to login",
        show: true,
        icon: "warning",
      });
    } else if (res.res === 500) {
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: "Please try again later",
        show: true,
        icon: "error",
      });
    } else {
      setnewRepairNotes(false);
      setValue({ editorState: EditorState.createEmpty() });
      getRepair();
      setSnackBar({
        type: "success",
        title: "Notes saved",
        message: "Your notes have been saved successfully",
        show: true,
        icon: "check",
      });
    }
    setShowLoad(false);
  };

  const [value, setValue] = useState({ editorState: EditorState.createEmpty() });

  const onEditorStateChange = (editorState) => {
    setValue({ editorState });
  };

  return (
    <Modal
      open={newRepairNotes}
      onClose={() => null}
      // onClose={() => {
      //   setNewRepair(false);
      // }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <MDBox sx={style}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDTypography id="modal-modal-title" variant="h6" component="h2">
              Add notes
            </MDTypography>
          </Grid>
          <Grid item xs={12}>
            <div>
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
            </div>
          </Grid>
          <Grid item xs={6}>
            <MDButton
              sx={{ marginTop: "2px" }}
              fullWidth
              color="success"
              onClick={() => {
                saveNotes();
              }}
            >
              Save
            </MDButton>
          </Grid>
          <Grid item xs={6}>
            <MDButton
              sx={{ marginTop: "2px" }}
              fullWidth
              color="secondary"
              onClick={() => {
                setnewRepairNotes(false);
              }}
            >
              Cancel
            </MDButton>
          </Grid>
        </Grid>
      </MDBox>
    </Modal>
  );
};

export default AddNotes;
