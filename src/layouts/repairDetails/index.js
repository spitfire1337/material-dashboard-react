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
import { useParams } from "react-router-dom";
import RepairHistory from "./components/history";
import Actions from "./components/actions";
import moment from "moment";
import NotesItem from "examples/Timeline/NotesItem";
import RepairImages from "./components/images";
// Vars
import vars from "../../config";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import {
  Modal,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Autocomplete,
  TextField,
  Divider,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import PartsAdd from "./components/addParts";
import Loading from "../../components/Loading_Dialog";
import AddPhotos from "./components/addPhoto";
const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
  color: () => {
    let colorValue = dark.main;

    // if (transparentNavbar) {
    //   colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
    // }

    return colorValue;
  },
});
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
// eslint-disable-next-line react/prop-types
const RepairDetails = ({ globalFunc }) => {
  const { id } = useParams();
  const [repairID, setrepairID] = useState(id);
  const [loading, setLoading] = useState(true);
  const [repairDetails, setrepairDetails] = useState({});
  const [repairHistory, setrepairHistory] = useState({});
  const [repairImages, setrepairImages] = useState([]);
  const [newRepairNotes, setnewRepairNotes] = useState(false);
  const [RepairNotes, setRepairNotes] = useState();
  const [AllRepairNotes, setAllRepairNotes] = useState();
  const [allparts, setAllParts] = useState();
  const [newRepairPart, setnewRepairPart] = useState(false);
  const [dialogOpen, toggleDialogOpen] = useState(false);
  const [repairOrder, setRepairOrder] = useState();
  const [repairOrderReady, setRepairOrderReady] = useState(false);
  const [confirmOpen, toggleconfirmOpen] = useState({ removePart: false, editTime: false });
  const [partId, setPartid] = useState();
  const [partName, setPartName] = useState();
  const [newMinutes, setnewMinutes] = useState();

  const { setShowLoad, LoadBox } = Loading();
  const getRepair = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/repairDetails`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
      credentials: "include",
    });
    const res = await response.json();
    if (res.res === 401) {
      globalFunc.setLoggedIn(false);
      globalFunc.setErrorSBText("Unauthorized, redirecting to login");
      globalFunc.setErrorSB(true);
    } else if (res.res === 500) {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    } else {
      setLoading(false);
      setnewMinutes(Math.round(res.data.repairTime * 60));
      setrepairDetails(res.data);
      setrepairHistory(res.history);
      setrepairImages(res.images);
      setAllRepairNotes(res.notes);
      setAllParts(res.parts);
    }
    setShowLoad(false);
  };

  const createInvoice = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/getRepairOrder`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id: repairID }),
    });
    const json = await response.json();
    if (json.res == 200) {
      setRepairOrder(json.data[0]);
      setRepairOrderReady(true);
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
    setShowLoad(false);
  };

  const saveNotes = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/repairNotes`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repairId: id, notes: RepairNotes }),
      credentials: "include",
    });
    const res = await response.json();
    if (res.res === 401) {
      globalFunc.setLoggedIn(false);
      globalFunc.setErrorSBText("Unauthorized, redirecting to login");
      globalFunc.setErrorSB(true);
    } else if (res.res === 500) {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    } else {
      setnewRepairNotes(false);
      getRepair();
      globalFunc.setSuccessSBText("Notes saved");
      globalFunc.setSuccessSB(true);
    }
    setShowLoad(false);
  };
  const ConfirmActionDialog = ({ title, content, action, openState, closeState }) => {
    return (
      <Dialog open={openState}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <MDButton onClick={closeState}>No</MDButton>
          <MDButton onClick={action} autoFocus>
            Yes
          </MDButton>
        </DialogActions>
      </Dialog>
    );
  };

  const PartsItem = ({ part, status }) => {
    return (
      <>
        <Grid item xs={status == 6 || status == 5 ? 8 : 6}>
          <MDTypography variant="body2" mb={-2}>
            {part.name}
          </MDTypography>
          <MDTypography variant="caption" mt={-2}>
            {part.note || ""}
          </MDTypography>
        </Grid>
        <Grid item xs={2}>
          <MDTypography variant="body2">{part.quantity}</MDTypography>
        </Grid>
        <Grid item xs={2}>
          <MDTypography variant="body2">
            ${(part.basePriceMoney.amount / 100).toFixed(2)}
          </MDTypography>
        </Grid>
        <Grid item xs={2}>
          {status == 6 || status == 5 ? (
            ""
          ) : (
            <IconButton
              size="small"
              disableRipple
              color="red"
              onClick={() => {
                setPartid(part._id);
                toggleconfirmOpen({ removePart: true });
                setPartName(part.name);
              }}
            >
              <Icon sx={iconsStyle}>clear</Icon>
            </IconButton>
          )}
        </Grid>
        <Grid item xs={12} mb={-2} mt={-2}>
          <Divider fullWidth></Divider>
        </Grid>
      </>
    );
  };

  const removeParts = async (id, status) => {
    toggleconfirmOpen({ removePart: false });
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/removeParts`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: repairID,
        partId: id,
        name: partName,
        status: status,
      }),
    });
    const json = await response.json();
    setShowLoad(false);
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Part removed from repair");
      globalFunc.setSuccessSB(true);
      getRepair();
      if (status == 4) {
        createInvoice();
      }
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
  };

  const saveTime = async (id, status) => {
    toggleconfirmOpen({ editTime: false });
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/removeParts`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: repairID,
        time: (newMinutes / 60).toFixed(2),
      }),
    });
    const json = await response.json();
    setShowLoad(false);
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Repair time adjusted");
      globalFunc.setSuccessSB(true);
      getRepair();
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
  };

  const editTime = () => {
    return (
      <Dialog open={confirmOpen.editTime}>
        <DialogTitle>Enter adjusted hours</DialogTitle>
        <DialogContent>
          <TextField
            value={Math.round(60 * repairTime)}
            label="Minutes"
            onChange={(e) => {
              setnewMinutes(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <MDButton onClick={closeState}>No</MDButton>
          <MDButton onClick={() => saveTime()} autoFocus>
            Yes
          </MDButton>
        </DialogActions>
      </Dialog>
    );
  };
  useEffect(() => {
    setrepairID(repairID);
    getRepair();
  }, []);

  const { showUploadFunc, AddPhotoModal, setRepairId } = AddPhotos({
    getRepair,
    globalFunc,
  });
  console.log("Details Render");
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar globalFunc={globalFunc} />
        <LoadBox />
      </DashboardLayout>
    );
  }

  const Status = ({ repairStatus }) => {
    if (repairStatus == 0) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Created"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #FFFF00, #989845)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 1) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Not started"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #ffae00, #B38D4C)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 2) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="In Progress"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #00BEFF, #4C99B3)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 3) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Paused"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #3D8E8C, #00FFF9)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 4) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Repair Complete"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #3C9041, #00FF0F)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 5) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Invoice Created"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #8E833E, #FFDE03)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 6) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Complete"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #329858, #00FF60)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 998) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Cancelled"
            sx={{
              "& .MuiBadge-badge": {
                color: "#fff",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #984742, #FB0F00)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 999) {
      return (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent="Unrepairable"
            sx={{
              "& .MuiBadge-badge": {
                color: "#fff",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #9E3755, #F70048)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
  };
  return (
    <DashboardLayout>
      <DashboardNavbar globalFunc={globalFunc} />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={1}>
              {/* Customer info */}
              <Grid item xs={12}>
                <Card>
                  <MDBox
                    mx={1}
                    mt={-3}
                    py={2}
                    px={1}
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                  >
                    <MDTypography variant="h6" color="white">
                      Customer Details
                    </MDTypography>
                  </MDBox>
                  <MDBox mx={2} py={3} px={2}>
                    <MDTypography variant="subtitle2">
                      {repairDetails.Customer.given_name} {repairDetails.Customer.family_name}
                      {repairDetails.Customer.address != undefined
                        ? [<br key="" />, repairDetails.Customer.address.address_line_1]
                        : ""}
                      {repairDetails.Customer.address != undefined
                        ? repairDetails.Customer.address.address_line_2 != undefined
                          ? [<br key="" />, repairDetails.Customer.address.address_line_2]
                          : ""
                        : ""}
                      {repairDetails.Customer.address != undefined
                        ? [
                            <br key="" />,
                            repairDetails.Customer.address.locality || "",
                            ",",
                            repairDetails.Customer.address.administrative_district_level_1 || "",
                            repairDetails.Customer.address.postal_code || "",
                          ]
                        : ""}
                      {repairDetails.Customer.email_address != undefined
                        ? [<br key="" />, repairDetails.Customer.email_address]
                        : ""}
                      {repairDetails.Customer.phone_number != undefined
                        ? [<br key="" />, repairDetails.Customer.phone_number]
                        : ""}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>

              {/* Repair Details */}
              <Grid item xs={12}>
                <Card>
                  <MDBox
                    mx={1}
                    mt={-3}
                    py={2}
                    px={1}
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                  >
                    <Grid container>
                      <Grid item xs={6} alignItems="center">
                        <MDTypography variant="h6" color="white">
                          Repair Details
                        </MDTypography>
                      </Grid>
                      <Grid item xs={6} alignItems="center" textAlign="right">
                        <Status repairStatus={repairDetails.status} />
                      </Grid>
                    </Grid>
                  </MDBox>
                  <MDBox mx={2} py={3} px={2}>
                    <MDTypography variant="body1">
                      {repairDetails.pev.Brand.name} {repairDetails.pev.Model}
                    </MDTypography>
                    <MDTypography variant="body1">Repair Type:</MDTypography>
                    <MDTypography variant="body2">
                      {repairDetails.RepairType.map((type) => {
                        return ` ${type}, `;
                      })}
                    </MDTypography>
                    <MDTypography variant="body1">Details:</MDTypography>
                    <MDTypography variant="body2">{repairDetails.Details}</MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              {/* Repair notes */}
              <Grid item xs={12}>
                <Card>
                  <MDBox
                    mx={1}
                    mt={-3}
                    py={2}
                    px={1}
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                  >
                    <Grid container>
                      <Grid item xs={6} alignItems="center">
                        <MDTypography variant="h6" color="white">
                          Notes
                        </MDTypography>
                      </Grid>
                      <Grid item xs={6} alignItems="center" textAlign="right">
                        <MDButton
                          color="success"
                          size="small"
                          onClick={() => setnewRepairNotes(true)}
                        >
                          Add notes
                        </MDButton>
                      </Grid>
                    </Grid>
                  </MDBox>
                  <MDBox mx={2} py={3} px={2}>
                    {AllRepairNotes.map((note) => {
                      return (
                        <NotesItem
                          key={note._id}
                          user={note.user}
                          notes={note.notes}
                          dateTime={note.createdAt}
                        />
                      );
                    })}
                    <MDTypography variant="subtitle2"></MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <MDBox
                    mx={1}
                    mt={-3}
                    py={2}
                    px={1}
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                  >
                    <Grid container>
                      <Grid item xs={6} alignItems="center">
                        <MDTypography variant="h6" color="white">
                          Images
                        </MDTypography>
                      </Grid>
                    </Grid>
                  </MDBox>
                  <MDBox mx={2} py={3} px={2}>
                    <RepairImages itemData={repairImages} />
                  </MDBox>
                </Card>
              </Grid>
              {/* Repair parts */}
              <Grid item xs={12}>
                <Card>
                  <MDBox
                    mx={1}
                    mt={-3}
                    py={2}
                    px={1}
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                  >
                    <Grid container>
                      <Grid item xs={6} alignItems="center">
                        <MDTypography variant="h6" color="white">
                          Invoice summary
                        </MDTypography>
                      </Grid>
                      <Grid item xs={6} alignItems="center" textAlign="right">
                        {repairDetails.status == 2 ||
                        repairDetails.status == 3 ||
                        repairDetails.status == 4 ? (
                          <MDButton
                            color="success"
                            size="small"
                            onClick={() => setnewRepairPart(true)}
                          >
                            Add parts
                          </MDButton>
                        ) : (
                          ""
                        )}
                      </Grid>
                    </Grid>
                  </MDBox>
                  <MDBox mx={2} py={3} px={2}>
                    <Grid container spacing={1}>
                      <Grid
                        item
                        xs={repairDetails.status == 6 || repairDetails.status == 5 ? 8 : 6}
                      >
                        <MDTypography variant="h6">Item:</MDTypography>
                      </Grid>
                      <Grid item xs={2}>
                        <MDTypography variant="h6">Qty:</MDTypography>
                      </Grid>
                      <Grid item xs={2}>
                        <MDTypography variant="h6">Cost (each):</MDTypography>
                      </Grid>
                      {repairDetails.status == 6 || repairDetails.status == 5 ? (
                        ""
                      ) : (
                        <Grid item xs={2}>
                          <MDTypography variant="h6">Remove:</MDTypography>
                        </Grid>
                      )}
                      <Grid item xs={12} mb={-2} mt={-2}>
                        <Divider fullWidth></Divider>
                      </Grid>
                      {allparts.lineItems.map((part) => {
                        console.log("Part: ", part);
                        return (
                          <PartsItem part={part} key={part.name} status={repairDetails.status} />
                        );
                      })}
                    </Grid>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          {/* Repair Actions & History */}
          <Grid item xs={12} md={4}>
            {/* Repair Actions */}
            {repairDetails.status !== 6 ||
            repairDetails.status !== 998 ||
            repairDetails.status !== 999 ? (
              <Grid item xs={12}>
                <Card>
                  <MDBox
                    mx={1}
                    mt={-3}
                    py={2}
                    px={1}
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                  >
                    <MDTypography variant="h6" color="white">
                      Actions
                    </MDTypography>
                  </MDBox>
                  <MDBox mx={2} py={3} px={2}>
                    <Actions
                      repairTime={repairDetails.repairTime}
                      status={repairDetails.status}
                      globalFunc={globalFunc}
                      getRepair={getRepair}
                      repairID={repairDetails._id}
                      repairOrder={repairOrder}
                      repairOrderReady={repairOrderReady}
                      setRepairOrder={setRepairOrder}
                      setRepairOrderReady={setRepairOrderReady}
                      createInvoice={createInvoice}
                      showUploadFunc={showUploadFunc}
                    />
                  </MDBox>
                </Card>
              </Grid>
            ) : null}
            {/* Repair History */}
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={1}
                  mt={-3}
                  py={2}
                  px={1}
                  variant="gradient"
                  bgColor="info"
                  borderRadius="lg"
                  coloredShadow="info"
                >
                  <MDTypography variant="h6" color="white">
                    History
                  </MDTypography>
                </MDBox>
                <MDBox mx={2} py={3} px={2}>
                  <RepairHistory
                    repairTime={repairDetails.repairTime}
                    data={repairHistory}
                    getRepair={getRepair}
                    repairID={repairDetails._id}
                    globalFunc={globalFunc}
                    setShowLoad={setShowLoad}
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
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
          <MDTypography id="modal-modal-title" variant="h6" component="h2">
            Add notes
          </MDTypography>
          <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <TextField
                id="outlined-multiline-static"
                label="Notes"
                multiline
                rows={4}
                fullWidth
                onChange={(e) => {
                  setRepairNotes(e.target.value);
                }}
              />
            </FormControl>
          </MDTypography>
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
        </MDBox>
      </Modal>
      <PartsAdd
        status={repairDetails.status}
        globalFunc={globalFunc}
        showPartsModal={newRepairPart}
        setshowPartsModal={setnewRepairPart}
        toggleloadingOpen={setShowLoad}
        createInvoice={createInvoice}
        dialogOpen={dialogOpen}
        toggleDialogOpen={toggleDialogOpen}
        repairID={repairID}
        getRepair={getRepair}
      />
      <LoadBox />
      <AddPhotoModal />
      <ConfirmActionDialog
        title="Are you sure?"
        content="Do you wish to remove this item?"
        action={() => removeParts(partId, repairDetails.status)}
        openState={confirmOpen.removePart}
        closeState={() => toggleconfirmOpen({ removePart: false })}
      />
      <Footer />
    </DashboardLayout>
  );
};

export default RepairDetails;
