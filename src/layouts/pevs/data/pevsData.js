/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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
import { useState, React, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//Global
import { globalFuncs } from "../../../context/global";
import { useLoginState } from "../../../context/loginContext";
import vars from "../../../config";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ConfirmDialog from "components/Confirm_Dialog";
import MDBadge from "components/MDBadge";
import DataTable from "examples/Tables/DataTable";
import { Modal, Grid, Icon } from "@mui/material";
import pevTableData from "./pevRepairsDatatable";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  minHeight: "50vh",
  maxHeight: "80vh",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};

const style2 = {
  minHeight: "40vh",
  maxHeight: "65vh",
  overflowY: "scroll",
  p: 4,
  borderRadius: "25px",
};

export default function data(setshowModal) {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const { setLoggedIn } = useLoginState();
  let redirect = useNavigate();
  const [inventoryOrig, setInventoryOrig] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setsearchTerm] = useState(null);
  const [showRepairs, setShowrepairs] = useState(false);
  const [pevRepairs, setpevRepairs] = useState([]);
  const [pevCustomers, setpevCustomers] = useState([]);
  const [deleteID, setDeleteId] = useState(null);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [selectedPEV, setSelectedPEV] = useState(null);
  const [brandDisable, setBrandDisable] = useState(true);
  const [brands, setBrands] = useState({});
  const [showNewPev, setShowNewPev] = useState(false);
  const { setShowConfirm, ConfirmActionDialog } = ConfirmDialog();
  const { columns, rows, reRenderDT } = pevTableData();

  const fetchData = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/square/getMyData?action=getPEVS`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();
      setShowLoad(false);
      if (res.res === 200) {
        setShowLoad(false);
        setInventoryOrig(res.data);
        setInventory(res.data);
        var unique = res.data.filter(
          (item, idx) => res.data.findIndex((x) => x.Brand._id == item.Brand._id) == idx
        );
        let brands = [{ id: 0, label: "Other" }];
        unique.map((brand) => {
          brands.push({ id: brand.Brand._id, label: brand.Brand.name });
        });
        setBrands(brands);
      } else if (res.res === 401) {
        setShowLoad(false);
        setLoggedIn(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Unauthorized, redirecting to login",
          show: true,
          icon: "check",
        });
      }
    } else if (response.status == 401) {
      setShowLoad(false);
      setLoggedIn(false);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Unauthorized, redirecting to login",
        show: true,
        icon: "check",
      });
    }
  };
  useEffect(() => {
    setShowLoad(true);
    fetchData();
  }, []);

  const reRender = () => {
    setShowLoad(true);
    fetchData();
  };
  useEffect(() => {
    doSearch();
  }, [searchTerm, inventoryOrig]);

  const doSearch = () => {
    let filterData = [...inventory];
    if (searchTerm == "" || searchTerm == null) {
      setInventory(inventoryOrig);
      return;
    }
    let filtered = filterData.filter((item) => {
      if (searchTerm == "" || searchTerm == null) {
        return true;
      }
      // eslint-disable-next-line prettier/prettier
      if (
        item.Brand.name
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
        return true;
      if (item.Model != undefined && item.Model.toLowerCase().includes(searchTerm.toLowerCase()))
        return true;
      if (
        item.PevType != undefined &&
        item.PevType.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return true;
      return false;
    });
    setInventory(filtered);
  };

  const showPEVModal = (item) => {
    setSelectedPEV(item);
    setShowNewPev(true);
    setshowModal(true);
  };

  const deletePEV = async () => {
    setShowConfirm(false);
    const response = await fetch(`${vars.serverUrl}/api/deletePEV`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _id: deleteID }),
      credentials: "include",
    });
    const json = await response.json();
    if (json.res == 200) {
      //We can now save PEV details with the new brand id
      setSnackBar({
        type: "success",
        title: "Success",
        message: "PEV Deleted",
        show: true,
        icon: "check",
      });
      reRender();
    } else {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "An error occured while deleting data, please try again",
        show: true,
        icon: "check",
      });
    }
  };

  const showConfirmDialog = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const ConfirmDialogConfig = () => {
    return (
      <ConfirmActionDialog
        title="Are you sure?"
        content="Do you wish to remove this item?"
        action={() => deletePEV()}
      />
    );
  };
  const doshowRepairs = (repairs, customers) => {
    repairs.map((repair) => {
      repair.CustomerData = customers.find((customer) => customer._id == repair.Customer);
    });
    setpevRepairs(repairs);
    reRenderDT(repairs);
    setShowrepairs(true);
  };
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
  const ViewRepairs = () => {
    return (
      <Modal
        open={showRepairs}
        onClose={() => null}
        // onClose={() => {
        //   setNewRepair(false);
        // }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox sx={style}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <MDBox sx={style2}>
                <DataTable
                  entriesPerPage={10}
                  table={{ columns, rows }}
                  showTotalEntries={true}
                  noEndBorder
                  pagination
                />
              </MDBox>
            </Grid>
            <Grid item xs={12}>
              <MDButton
                variant="contained"
                color="error"
                onClick={() => setShowrepairs(false)}
                fullwidth
              >
                Close
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </Modal>
    );
  };

  return {
    reRender: reRender,
    setsearchTerm: setsearchTerm,
    searchTerm: searchTerm,
    columns: [
      { Header: "PEV", accessor: "brand" },
      { Header: "Model", accessor: "model", align: "left" },
      { Header: "Type", accessor: "type", align: "left" },
      { Header: "Voltage", accessor: "voltage", align: "left" },
      { Header: "Capacity", accessor: "capacity", align: "left" },
      { Header: "Range", accessor: "range", align: "left" },
      { Header: "Top Speed", accessor: "speed", align: "left" },
      { Header: "# Repairs", accessor: "repairs", align: "left" },
      { Header: "", accessor: "edit", align: "left" },
    ],

    rows:
      inventory.length > 0
        ? inventory.map((item) => {
            return {
              brand: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.Brand.name || ""} - {item.Model || ""}
                </MDTypography>
              ),
              type: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.PevType || ""}
                </MDTypography>
              ),
              voltage: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.Voltage != null ? `${item.Voltage}v` : ""}
                </MDTypography>
              ),
              capacity: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                ></MDTypography>
              ),
              range: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.range != null ? `${item.range} miles` : ""}
                </MDTypography>
              ),
              speed: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.TopSpeed != null ? `${item.TopSpeed} mph` : ""}
                </MDTypography>
              ),
              repairs: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                  onClick={() => {
                    doshowRepairs(item.repairs, item.Customers);
                  }}
                >
                  {item.repairs.length}
                </MDTypography>
              ),
              edit: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  <MDButton variant="contained" color="success" onClick={() => showPEVModal(item)}>
                    <Icon>edit</Icon>
                  </MDButton>
                  &nbsp;
                  <MDButton
                    variant="contained"
                    color="error"
                    disabled={item.repairs.length > 0 ? true : false}
                    onClick={() => showConfirmDialog(item._id)}
                  >
                    <Icon>delete</Icon>
                  </MDButton>
                </MDTypography>
              ),
            };
          })
        : [],
    setshowModal: setshowModal,
    showPartsModal: showPartsModal,
    setShowPartsModal: setShowPartsModal,
    setShowLoad: setShowLoad,
    showNewPev: showNewPev,
    brands: brands,
    brandDisable: brandDisable,
    selectedPEV: selectedPEV,
    ConfirmDialog: ConfirmDialogConfig,
    ViewRepairs: ViewRepairs,
  };
}
