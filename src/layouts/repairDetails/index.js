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
import NotesItem from "examples/Timeline/NotesItem";
import RepairImages from "./components/images";
import AddNotes from "layouts/repairs/components/addnotes";
import parse from "html-react-parser";
import { globalFuncs } from "../../context/global";
import { useLoginState } from "../../context/loginContext";
// Vars
import vars from "../../config";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Divider } from "@mui/material";

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
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import PartsAdd from "./components/addParts";
import AddPhotos from "./components/addPhoto";
import { useTableState } from "../../context/tableState";
import PartsButton from "components/PartsButton";

const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
  color: () => {
    let colorValue = dark.main;

    // if (transparentNavbar) {
    //   colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
    // }

    return colorValue;
  },
});

// eslint-disable-next-line react/prop-types
const RepairDetails = () => {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const { setLoggedIn } = useLoginState();
  const { RepairRerender } = useTableState();
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
  const getRepair = async () => {
    setShowLoad(true);
    createInvoice();
    setRepairOrderReady(false);
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
      setLoggedIn(false);
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
      setLoading(false);
      setnewMinutes(Math.round(res.data.repairTime * 60));
      setrepairDetails(res.data);
      setrepairHistory(res.history);
      setrepairImages(res.images);
      setAllRepairNotes(res.notes);
      setAllParts(res.parts);
      RepairRerender();
      setShowLoad(false);

      //setRepairOrderReady(true);
    }
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
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: "Please try again later",
        show: true,
        icon: "error",
      });
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
      setLoggedIn(false);
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
      setSnackBar({
        type: "success",
        title: "Part removed from repair",
        message: "The part has been successfully removed from the repair",
        show: true,
        icon: "check",
      });
      getRepair();
      if (status == 4) {
        createInvoice();
      }
    } else {
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: "Please try again later",
        show: true,
        icon: "error",
      });
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
      setSnackBar({
        type: "success",
        title: "Repair time adjusted",
        message: "The repair time has been successfully adjusted",
        show: true,
        icon: "check",
      });
      getRepair();
    } else {
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: "Please try again later",
        show: true,
        icon: "error",
      });
    }
  };

  const { showUploadFunc, AddPhotoModal, setRepairId } = AddPhotos({
    getRepair,
  });

  useEffect(() => {
    setShowLoad(true);
    setrepairID(repairID);
    setRepairId(repairID);
    getRepair();
    createInvoice();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
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
      <DashboardNavbar />
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
                            ", ",
                            repairDetails.Customer.address.administrative_district_level_1 || "",
                            " ",
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
                    <MDTypography variant="body2">{parse(repairDetails.Details)}</MDTypography>
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
              {/* Repair pictures */}
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
                      <Grid item xs={6} alignItems="center" textAlign="right">
                        <MDButton
                          size="small"
                          color="warning"
                          variant="contained"
                          onClick={() => showUploadFunc()}
                        >
                          Add Photo
                        </MDButton>
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
                          <PartsButton
                            size="full"
                            status={repairDetails.status}
                            getRepair={getRepair}
                            repairID={repairDetails._id}
                          />
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
                      getRepair={getRepair}
                      repairID={repairDetails._id}
                      repairOrder={repairOrder}
                      repairOrderReady={repairOrderReady}
                      setRepairOrder={setRepairOrder}
                      setRepairOrderReady={setRepairOrderReady}
                      createInvoice={createInvoice}
                      showUploadFunc={showUploadFunc}
                      setnewRepairNotes={setnewRepairNotes}
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
                    setShowLoad={setShowLoad}
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>

      {/* <AddNotes
        RepairNotes={RepairNotes}
        setRepairNotes={setRepairNotes}
        newRepairNotes={newRepairNotes}
        setnewRepairNotes={setnewRepairNotes}
        saveNotes={saveNotes}
        getRepair={getRepair}
        repairId={repairID}
      /> */}
      <PartsAdd
        status={repairDetails.status}
        showPartsModal={newRepairPart}
        setshowPartsModal={setnewRepairPart}
        toggleloadingOpen={setShowLoad}
        createInvoice={createInvoice}
        dialogOpen={dialogOpen}
        toggleDialogOpen={toggleDialogOpen}
        repairID={repairID}
        getRepair={getRepair}
      />
      <AddPhotoModal repairID={repairID} getRepair={getRepair} />
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
