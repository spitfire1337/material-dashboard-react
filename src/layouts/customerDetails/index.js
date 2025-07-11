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
import DataTable from "examples/Tables/DataTable";

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
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Loading from "../../components/Loading_Dialog";
import Notification from "components/Notifications";
import CustomerData from "layouts/tables/data/customerDetails";
import CustomerOrders from "layouts/tables/data/customerOrders";
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
const CustomerDetails = ({ globalFunc }) => {
  const { id } = useParams();
  const [repairID, setrepairID] = useState(id);
  const [loading, setLoading] = useState(true);
  const [customerDetail, setcustomerDetails] = useState({});
  const [newRepairNotes, setnewRepairNotes] = useState(false);
  const [confirmOpen, toggleconfirmOpen] = useState({ removePart: false, editTime: false });
  const { showSnackBar, RenderSnackbar } = Notification();
  const { setShowLoad, LoadBox } = Loading();
  const [repairHistory, setRepairHistory] = useState([]);

  const { repairColumns, repairRows, setData } = CustomerData();
  const { orderColumns, orderRows, setOrderData } = CustomerOrders();
  const Pev = ({ title, description, id }) => (
    <MDBox
      lineHeight={1}
      textAlign="left"
      sx={{ cursor: "pointer" }}
      onClick={() => redirect(`/repairs/${id}`, { replace: false })}
    >
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {title}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
    </MDBox>
  );

  const Status = ({ repairStatus, id }) => {
    if (repairStatus == 0) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairs/${id}`, { replace: false })}
        >
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

  const getCustomer = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/square/getCustomers?id=${id}`, {
      method: "GET",
      credentials: "include",
    });
    const res = await response.json();
    if (res.res === 401) {
      globalFunc.setLoggedIn(false);
      showSnackBar("error", "Unauthorized, redirecting to login");
    } else if (res.res === 500) {
      showSnackBar("error", "Server error occured");
    } else {
      console.log("Customer data", res.data[0].repairs);
      setcustomerDetails(res.data[0]);
      let repairs =
        res.data[0].repairs.length > 0
          ? res.data[0].repairs.map((repair) => {
              return {
                id: repair.repairID,
                pev: (
                  <Pev
                    id={repair._id}
                    title={repair.pev.Brand.name}
                    description={repair.pev.Model}
                  />
                ),
                status: <Status repairStatus={repair.status} id={repair._id} />,
                received: (
                  <MDTypography
                    component="a"
                    href="#"
                    variant="caption"
                    color="text"
                    fontWeight="medium"
                    sx={{ cursor: "pointer" }}
                    onClick={() => redirect(`/repairs/${repair._id}`, { replace: false })}
                  >
                    {moment(repair.createdAt).format("MM/DD/yyyy hh:mm a")}
                  </MDTypography>
                ),
                updated: (
                  <MDTypography
                    component="a"
                    href={"/repairs/" + repair._id}
                    variant="caption"
                    color="text"
                    fontWeight="medium"
                  >
                    {moment(repair.updatedAt).format("MM/DD/yyyy hh:mm a")}
                  </MDTypography>
                ),
              };
            })
          : [];
      let orders =
        res.data[0].orders.length > 0
          ? res.data[0].orders.map((order) => {
              return {
                date: moment(order.created_at).format("MM/DD/yyyy hh:mm a"),
                items: order.line_items.length,
                status: order.state,
                ammount: `$${order.total_money.amount / 100}`,
              };
            })
          : [];
      setOrderData(res.data[0].orders);
      setData(res.data[0].repairs);
      setRepairHistory();
      setLoading(false);
      //setRepairOrderReady(true);
      setShowLoad(false);
    }
  };
  // useEffect(() => {
  // }, [repairHistory]);
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

  useEffect(() => {
    getCustomer();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar globalFunc={globalFunc} />
        <LoadBox />
      </DashboardLayout>
    );
  }

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
                      {customerDetail.given_name} {customerDetail.family_name}
                      {customerDetail.address != undefined
                        ? [<br key="" />, customerDetail.address.address_line_1]
                        : ""}
                      {customerDetail.address != undefined
                        ? customerDetail.address.address_line_2 != undefined
                          ? [<br key="" />, customerDetail.address.address_line_2]
                          : ""
                        : ""}
                      {customerDetail.address != undefined
                        ? [
                            <br key="" />,
                            customerDetail.address.locality || "",
                            ", ",
                            customerDetail.address.administrative_district_level_1 || "",
                            " ",
                            customerDetail.address.postal_code || "",
                          ]
                        : ""}
                      {customerDetail.email_address != undefined
                        ? [<br key="" />, customerDetail.email_address]
                        : ""}
                      {customerDetail.phone_number != undefined
                        ? [<br key="" />, customerDetail.phone_number]
                        : ""}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>

              {/* Order History */}
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
                          Order history
                        </MDTypography>
                      </Grid>
                      <Grid item xs={6} alignItems="center" textAlign="right"></Grid>
                    </Grid>
                  </MDBox>
                  <MDBox mx={2} py={3} px={2}>
                    <DataTable
                      entriesPerPage={{ defaultValue: 5 }}
                      table={{ columns: orderColumns, rows: orderRows }}
                      showTotalEntries={true}
                      noEndBorder
                      pagination
                    />
                  </MDBox>
                </Card>
              </Grid>
              {/* Repair history */}
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
                      <Grid item xs={12} alignItems="center">
                        <MDTypography variant="h6" color="white">
                          Repair History
                        </MDTypography>
                      </Grid>
                    </Grid>
                  </MDBox>
                  <MDBox mx={2} py={3} px={2}>
                    <DataTable
                      entriesPerPage={{ defaultValue: 5 }}
                      table={{ columns: repairColumns, rows: repairRows }}
                      showTotalEntries={true}
                      noEndBorder
                      pagination
                    />
                  </MDBox>
                </Card>
              </Grid>
              {/* Repair pictures */}
              {/* <Grid item xs={12}>
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
                  <MDBox mx={2} py={3} px={2}></MDBox>
                </Card>
              </Grid> */}
              {/* Repair parts */}
              {/* <Grid item xs={12}>
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
                      <Grid item xs={6} alignItems="center" textAlign="right"></Grid>
                    </Grid>
                  </MDBox>
                  <MDBox mx={2} py={3} px={2}></MDBox>
                </Card>
              </Grid> */}
            </Grid>
          </Grid>
          {/* Repair Actions & History */}
          <Grid item xs={12} md={4}>
            {/* Repair Actions */}

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
                <MDBox mx={2} py={3} px={2}></MDBox>
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
      <LoadBox />
      <ConfirmActionDialog
        title="Are you sure?"
        content="Do you wish to remove this item?"
        action={() => removeParts(partId, repairDetails.status)}
        openState={confirmOpen.removePart}
        closeState={() => toggleconfirmOpen({ removePart: false })}
      />
      <RenderSnackbar />
      <Footer />
    </DashboardLayout>
  );
};

export default CustomerDetails;
