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
import Loading from "components/loading";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import PartsAdd from "./components/addParts";

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
  const [newRepairNotes, setnewRepairNotes] = useState(false);
  const [RepairNotes, setRepairNotes] = useState();
  const [AllRepairNotes, setAllRepairNotes] = useState();
  const [allparts, setAllParts] = useState();
  const [loadingOpen, setloadingOpen] = useState(false);
  const [newRepairPart, setnewRepairPart] = useState(false);
  const [dialogOpen, toggleDialogOpen] = useState(false);
  const [repairOrder, setRepairOrder] = useState();
  const [repairOrderReady, setRepairOrderReady] = useState(false);

  const getRepair = async () => {
    setloadingOpen(true);
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
      setrepairDetails(res.data);
      setrepairHistory(res.history);
      setAllRepairNotes(res.notes);
      setAllParts(res.parts);
    }
    setloadingOpen(false);
  };

  const createInvoice = async () => {
    setloadingOpen(true);
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
    setloadingOpen(false);
  };

  const LoadDialog = () => {
    return (
      <Dialog open={loadingOpen || loading}>
        <DialogTitle>Loading</DialogTitle>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  };
  const saveNotes = async () => {
    setloadingOpen(true);
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
    setloadingOpen(false);
  };

  const PartsItem = ({ part, status }) => {
    return (
      <>
        <Grid item xs={6}>
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
          {status == 5 || status == 6 ? (
            ""
          ) : (
            <IconButton
              size="small"
              disableRipple
              color="red"
              onClick={() => removeParts(part._id)}
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

  const removeParts = async (id) => {
    setloadingOpen(true);
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
      }),
    });
    const json = await response.json();
    setloadingOpen(false);
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
  useEffect(() => {
    getRepair();
  }, [repairID]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar globalFunc={globalFunc} />
        <LoadDialog />
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
                      <Grid item xs={6}>
                        <MDTypography variant="h6">Item:</MDTypography>
                      </Grid>
                      <Grid item xs={2}>
                        <MDTypography variant="h6">Qty:</MDTypography>
                      </Grid>
                      <Grid item xs={2}>
                        <MDTypography variant="h6">Cost (each):</MDTypography>
                      </Grid>
                      <Grid item xs={2}>
                        <MDTypography variant="h6">Remove:</MDTypography>
                      </Grid>
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
            {repairDetails.status !== 998 || repairDetails !== 999 ? (
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
        globalFunc={globalFunc}
        showPartsModal={newRepairPart}
        setshowPartsModal={setnewRepairPart}
        toggleloadingOpen={setloadingOpen}
        createInvoice={createInvoice}
        dialogOpen={dialogOpen}
        toggleDialogOpen={toggleDialogOpen}
        repairID={repairID}
        getRepair={getRepair}
      />
      <LoadDialog />
      <Footer />
    </DashboardLayout>
  );
};

export default RepairDetails;
