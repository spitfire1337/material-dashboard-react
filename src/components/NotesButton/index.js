import { useState } from "react";
import { Modal, Grid, Icon, Tooltip, FormControlLabel, Checkbox } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import { globalFuncs } from "../../context/global";
import { useLoginState } from "../../context/loginContext";
import { useSocket } from "context/socket";

import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
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

const AddNotes = ({ callback, repairId, size = "full" }) => {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const { setLoginState } = useLoginState();
  const socket = useSocket();
  const [newRepairNotes, setnewRepairNotes] = useState(false);
  const [value, setValue] = useState({ editorState: EditorState.createEmpty() });
  const [customerVisible, setCustomerVisible] = useState(false);

  const onEditorStateChange = (editorState) => {
    console.log("Editor state changed");
    setValue({ editorState });
  };

  const saveNotes = () => {
    if (!value.editorState.getCurrentContent().hasText()) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Please enter notes",
        show: true,
        icon: "warning",
      });
      return;
    }
    setShowLoad(true);
    if (socket) {
      socket.emit(
        "repairNotes",
        {
          repairId: repairId,
          notes: draftToHtml(convertToRaw(value.editorState.getCurrentContent())),
          customerVisible: customerVisible,
        },
        (res) => {
          if (res.res === 401) {
            setLoginState(false);
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
            setCustomerVisible(false);
            if (callback) callback();
            setSnackBar({
              type: "success",
              title: "Notes saved",
              message: "Your notes have been saved successfully",
              show: true,
              icon: "check",
            });
          }
          setShowLoad(false);
        }
      );
    }
  };

  const notesModal = (
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
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={customerVisible}
                  onChange={(e) => setCustomerVisible(e.target.checked)}
                />
              }
              label="Visible to Customer"
            />
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

  if (size == "full") {
    return (
      <>
        <MDButton color="success" size="small" onClick={() => setnewRepairNotes(true)}>
          Add Notes
        </MDButton>
        {notesModal}
      </>
    );
  } else if (size == "icon") {
    return (
      <>
        <Tooltip title="Add Notes">
          <MDButton
            fullwidth
            color="dark"
            variant="contained"
            onClick={() => setnewRepairNotes(true)}
          >
            <Icon>note_add</Icon>
          </MDButton>
        </Tooltip>
        {notesModal}
      </>
    );
  }
};

export default AddNotes;
