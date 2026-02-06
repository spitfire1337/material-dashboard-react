//Global
import { globalFuncs } from "../../../context/global";

import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import { Grid } from "@mui/material";
import vars from "../../../config";
import { useState, React, useEffect, useMemo, useDebugValue } from "react";
import MDTypography from "components/MDTypography";
import {
  Modal,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  Divider,
  Tooltip,
  Icon,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import PartsOrder from "./partsOrder";
// import PartsAdd from "../components/addParts";
import Loading from "../../../components/Loading_Dialog";
import AddNotes from "layouts/repairs/components/addnotes";

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
function Actions({
  status,
  getRepair,
  repairID,
  repairTime,
  repairOrder,
  repairOrderReady,
  createInvoice,
  reRender,
}) {
  const { setSnackBar } = globalFuncs();
  const [Labor, setLabor] = useState(100);
  const [Tax, setTax] = useState(0);
  const [TaxRate, setTaxRate] = useState(7);
  const [Taxable, setTaxable] = useState(false);
  const [subTotal, setSubtotal] = useState(0);
  const [Total, setTotal] = useState(0);
  const [parts, setParts] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [allparts, setAllParts] = useState();
  const [partDetails, setPartDetails] = useState({ cost: 0, name: "", qty: 0 });
  const [part, setPart] = useState();
  const [searchedpart, setSearchedpart] = useState();
  const [partCost, setPartCost] = useState((0).toFixed(2));
  const [partName, setPartName] = useState();
  const [PartDetail, setPartDetail] = useState();
  // const [repairOrder, setRepairOrder] = useState();
  // const [repairOrderReady, setRepairOrderReady] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [timeUsed, setLaborTime] = useState(repairTime.toFixed(2));

  const [newRepairPart, setnewRepairPart] = useState(false);
  const [dialogOpen, toggleDialogOpen] = useState(false);
  const [printDialogOpen, toggleprintDialogOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  //     {
  //       id: 0,
  //       vendor: "",
  //       part: "",
  //       cost: 0,
  //       price: 0,
  //       tracking: "",
  //     },
  //   ]);
  const [partsCount, setPartsCount] = useState(0);

  const [confirmOpen, toggleconfirmOpen] = useState({ cancelInvoice: false });
  const [showUpload, showUploadFunc] = useState(false);

  const { setShowLoad, LoadBox } = Loading();

  const { PartsOrderDialog, togglePartsOrderOpen } = PartsOrder();
  //   useEffect(() => {
  //     if (repairOrderReady == true) {
  //       let mySubTotal = timeUsed * Labor;
  //       repairOrder.lineItems.map((item) => {
  //         mySubTotal = mySubTotal + (item.basePriceMoney.amount * item.quantity) / 100;
  //       });
  //       setSubtotal(mySubTotal);
  //       let mytax = 0;
  //       if (Taxable) {
  //         mytax = subTotal * (TaxRate / 100);
  //         setTax(mytax);
  //       } else {
  //         mytax = 0;
  //         setTax(0);
  //       }
  //       setTotal(mySubTotal + mytax);
  //     }
  //   }, [repairOrderReady, Labor, Taxable, TaxRate, timeUsed]);
  //   useEffect(() => {
  //     setLaborTime(repairTime.toFixed(2));
  //   }, [repairTime]);
  const dialogHandleClose = () => {
    // setPartCost(0);
    // setPartQuantity(1);
    setPartDetails({
      qty: 1,
      cost: 0,
      name: "",
    });
    toggleDialogOpen(false);
  };
  const choosePart = (value) => {
    if (value.id == 0) {
      //New item
      setPartName(value.inputValue);
      setPartCost((0).toFixed(2));
      setPartDetail(true);
    } else {
      let selectedpart = allparts.filter((x) =>
        x.itemData.variations.filter((y) => y.id == value.id)
      );
      const filteredArray = allparts.filter((part) => {
        // Use Array.prototype.some() to check if any rating has the desired category
        return part.itemData.variations.some((item) => {
          return item.id === value.id;
        });
      })[0];
      let variant = filteredArray.itemData.variations.filter((x) => x.id == value.id);
      let cost =
        variant[0].itemVariationData.priceMoney != undefined
          ? variant[0].itemVariationData.priceMoney
          : 0;
      setPartDetails({
        ...partDetails,
        qty: 1,
        cost:
          variant[0].itemVariationData.priceMoney != undefined
            ? (variant[0].itemVariationData.priceMoney.amount / 100).toFixed(2)
            : (0).toFixed(2),
        name: filteredArray.itemData.name + " - " + variant[0].itemVariationData.name,
      });
      setPart(value.id);
      setPartDetail(true);
    }
  };

  const getParts = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/getParts`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const json = await response.json();
    if (json.res == 200) {
      let itemList = [];
      setAllParts(json.data);
      json.data.map((item) => {
        item.itemData.variations.map((variant) => {
          itemList.push({
            label: `${item.itemData.name} - ${variant.itemVariationData.name} ${
              variant.itemVariationData != undefined &&
              variant.itemVariationData.priceMoney != undefined
                ? `- $${(Number(variant.itemVariationData.priceMoney.amount) / 100).toFixed(2)}`
                : ""
            }`,
            id: variant.id,
          });
        });
      });
      setParts(itemList);
      setPartDetails({
        qty: 1,
        cost: 0,
        name: "",
      });
      setPartDetail(false);
      setnewRepairPart(true);
      setShowLoad(false);
    }
  };

  const getDocuments = async () => {
    const response = await fetch(`${vars.serverUrl}/repairs/documents`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repairID: repairID }),
    });
    const json = await response.json();
    if (json.res == 200) {
      setDocuments(json.data);
      toggleprintDialogOpen(true);
    } else {
      setDocuments([]);
    }
  };

  const repairAction = async (status, Event, icon, color) => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/updateRepairStatus`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: repairID,
        status: status,
        history: {
          repairId: repairID,
          Event: Event,
          Details: "",
          icon: icon,
          color: color,
        },
      }),
      credentials: "include",
    });
    const json = await response.json();
    if (json.res == 200) {
      setSnackBar({
        type: "success",
        title: "Repair Updated",
        message: "Repair status Updated",
        show: true,
        icon: "check",
      });
      reRender();
      setShowLoad(false);
    } else {
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: json.message,
        show: true,
        icon: "error",
      });
      setShowLoad(false);
    }
    setShowLoad(false);
    return null;
  };

  const addParts = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/addParts`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: repairID,
        parts: {
          quantity: partDetails.qty,
          name: partDetails.name,
          basePriceMoney: {
            amount: Math.round(partDetails.cost * 100),
          },
          catalogObjectId: part,
        },
      }),
    });
    const json = await response.json();
    setShowLoad(false);
    if (json.res == 200) {
      setSnackBar({
        type: "success",
        title: "Repair Updated",
        message: "Part added to repair",
        show: true,
        icon: "check",
      });
      getRepair();
      if (status == 4) {
        createInvoice();
      }
      setnewRepairPart(false);
    } else {
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: json.message,
        show: true,
        icon: "error",
      });
    }
  };

  //const selectedValues = useMemo(() => parts.filter((v) => v.selected), [parts]);

  const doCreateInvoice = async () => {
    setShowLoad(true);
    let dueTaxes;
    if (Taxable) {
      dueTaxes = {
        taxes: [
          {
            type: "ADDITIVE",
            name: "FL Sales Tax",
            percentage: TaxRate.toString(),
            scope: "ORDER",
          },
        ],
      };
    }
    const response = await fetch(`${vars.serverUrl}/repairs/createInvoice`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: repairID,
        parts: {
          quantity: 1,
          name: "Labor",
          note: `${timeUsed} hours @ $${Labor}/hr`,
          basePriceMoney: {
            amount: Math.round(Labor * timeUsed) * 100,
          },
        },
        tax: dueTaxes,
      }),
    });
    const json = await response.json();
    if (json.res == 200) {
      setSnackBar({
        type: "success",
        title: "Invoice created",
        message: "Invoice created",
        show: true,
        icon: "check",
      });
      setShowInvoice(false);
      getRepair();
    } else {
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: json.message,
        show: true,
        icon: "error",
      });
    }
    setShowLoad(false);
  };

  const doCancelInvoice = async () => {
    toggleconfirmOpen({ cancelInvoice: false });
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/cancelInvoice`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: repairID,
      }),
    });
    const json = await response.json();
    if (json.res == 200) {
      setSnackBar({
        type: "success",
        title: "Invoice Cancelled",
        message: "Invoice Cancelled",
        show: true,
        icon: "check",
      });
    } else {
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: json.message,
        show: true,
        icon: "error",
      });
    }
    getRepair();
    setShowLoad(false);
  };

  const reprintPaperwork = async (docid = null) => {
    toggleprintDialogOpen(false);
    setShowLoad(true);
    try {
      let postData;
      if (docid == null) {
        postData = {
          id: repairID,
        };
      } else {
        postData = {
          id: repairID,
          fileId: [docid],
        };
      }
      const response = await fetch(`${vars.serverUrl}/repairs/printDropOff`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
        credentials: "include",
      });
      const json = await response.json();
      if (json.res == 200) {
        setSnackBar({
          type: "success",
          title: "Sent to printer",
          message: "Sent to printer",
          show: true,
          icon: "check",
        });
      } else {
        setSnackBar({
          type: "error",
          title: "Error occured during printing",
          message: json.message,
          show: true,
          icon: "error",
        });
      }
    } catch (e) {
      setSnackBar({
        type: "error",
        title: "Error occured during printing",
        message: "Error occured during printing",
        show: true,
        icon: "error",
      });
      // TODO: Add error notification
    }
    setShowLoad(false);
  };

  const PhotoButton = () => {
    return (
      <Grid item xs={12} md={6}>
        <MDButton
          fullwidth
          color="warning"
          variant="contained"
          onClick={() => showUploadFunc(true)}
        >
          Add Photo
        </MDButton>
      </Grid>
    );
  };

  const NotesButton = () => {
    return (
      <>
        <Tooltip title="Add Notes">
          <MDButton fullwidth color="dark" variant="contained" onClick={() => setShowNotes(true)}>
            <Icon>note_add</Icon>
          </MDButton>
        </Tooltip>
        <AddNotes
          setnewRepairNotes={setShowNotes}
          newRepairNotes={showNotes}
          getRepair={reRender}
          setShowLoad={setShowLoad}
          repairId={repairID}
        />
      </>
    );
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

  const PrintDocsDialog = () => {
    return (
      <Dialog open={printDialogOpen}>
        <DialogTitle>Reprint Paperwork</DialogTitle>
        <DialogContent>
          {documents.map((doc) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <>
                <MDButton
                  mt={1}
                  fullWidth
                  color="success"
                  onClick={() => reprintPaperwork(doc._id)}
                >
                  {doc.name}
                </MDButton>
                <br /> <br />
              </>
            );
          })}
          <MDButton color="success" fullWidth onClick={() => reprintPaperwork()}>
            Reprint All
          </MDButton>
        </DialogContent>
        <DialogActions>
          <MDButton color="error" fullWidth onClick={() => toggleprintDialogOpen(false)}>
            Close
          </MDButton>
        </DialogActions>
      </Dialog>
    );
  };

  const ReprintButton = () => {
    return (
      <Tooltip title="Reprint Paperwork">
        <MDButton fullwidth color="dark" variant="contained" pb={3} onClick={() => getDocuments()}>
          <Icon>print</Icon>
        </MDButton>
      </Tooltip>
    );
  };

  const StartRepairButton = () => {
    return (
      <Tooltip title="Start Repair">
        <MDButton
          fullwidth
          color="success"
          variant="contained"
          pb={3}
          onClick={() => repairAction(2, "Repair started", "construction", "success")}
        >
          <Icon>play_circle</Icon>
        </MDButton>
      </Tooltip>
    );
  };

  const ReturnToCustomerButton = () => {
    return (
      <Tooltip title="Return to Customer">
        <MDButton
          fullwidth
          color="primary"
          variant="contained"
          p={3}
          onClick={() => repairAction(997, "Return to customer", "event_busy", "primary")}
        >
          <Icon>exit_to_app</Icon>
        </MDButton>
      </Tooltip>
    );
  };

  const CancelRepairButton = () => {
    return (
      <Tooltip title="Cancel Repair">
        <MDButton
          fullwidth
          color="primary"
          variant="contained"
          onClick={() => repairAction(998, "Repair cancelled", "event_busy", "primary")}
        >
          <Icon>cancel</Icon>
        </MDButton>
      </Tooltip>
    );
  };

  const PauseRepairButton = () => {
    return (
      <Tooltip title="Pause Repair">
        <MDButton
          fullwidth
          color="info"
          variant="contained"
          onClick={() => repairAction(3, "Repair paused", "pause", "info")}
        >
          <Icon>pause_circle</Icon>
        </MDButton>
      </Tooltip>
    );
  };

  const PauseRepairPartsButton = () => {
    return (
      <>
        <Tooltip title="Pause Repair - Awaiting parts">
          <MDButton
            fullwidth
            color="info"
            variant="contained"
            onClick={() => togglePartsOrderOpen(true)}
          >
            <Icon>alarm_pause</Icon>
          </MDButton>
        </Tooltip>
        <PartsOrderDialog />
      </>
    );
  };

  const AddPartsButton = () => {
    return (
      <Tooltip title="Add Parts">
        <MDButton fullwidth color="dark" variant="contained" onClick={() => getParts()}>
          <Icon>add_shopping_cart</Icon>
        </MDButton>
      </Tooltip>
    );
  };

  const CompleteRepairButton = () => {
    return (
      <Tooltip title="Complete Repair">
        <MDButton
          fullwidth
          color="success"
          variant="contained"
          onClick={() => repairAction(4, "Repair completed", "build_circle", "success")}
        >
          <Icon>check_circle</Icon>
        </MDButton>
      </Tooltip>
    );
  };

  const RestartRepairButton = () => {
    return (
      <Tooltip title="Restart Repair">
        <MDButton
          fullwidth
          color="success"
          variant="contained"
          p={3}
          onClick={() => repairAction(2, "Repair resumed", "construction", "success")}
        >
          <Icon>restart_alt</Icon>
        </MDButton>
      </Tooltip>
    );
  };

  const CreateInvoiceButton = () => {
    return (
      <Tooltip title="Create Invoice">
        <MDButton
          fullwidth
          color="success"
          variant="contained"
          p={3}
          disabled={!repairOrderReady}
          onClick={() => setShowInvoice(true)}
        >
          <Icon>receipt</Icon>
        </MDButton>
      </Tooltip>
    );
  };

  const CancelInvoiceButton = () => {
    return (
      <Tooltip title="Cancel Invoice">
        <MDButton
          fullwidth
          color="success"
          variant="contained"
          p={3}
          onClick={() => toggleconfirmOpen({ cancelInvoice: true })}
        >
          <Icon>credit_card_off</Icon>
        </MDButton>
      </Tooltip>
    );
  };

  const ArchiveRepairButton = () => {
    return (
      <Tooltip title="Archive Repair - Customer picked up">
        <MDButton
          fullwidth
          color="primary"
          variant="contained"
          p={3}
          onClick={() => repairAction(998, "Repair Archived", "event_busy", "primary")}
        >
          <Icon>archive</Icon>
        </MDButton>
      </Tooltip>
    );
  };
  console.log("Quick Actions Rendered");
  if (status == 1) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} lg={3}>
            <StartRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <PauseRepairPartsButton />
          </Grid>
          {/* <Grid item xs={4} md={2}>
            <AddPartsButton />
          </Grid> */}
          <Grid item xs={6} lg={3}>
            <ReturnToCustomerButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <CancelRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <NotesButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <ReprintButton />
          </Grid>
        </Grid>
        <LoadBox />
        {/* <PartsModal /> */}
      </>
    );
  }
  if (status == 2) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} lg={3}>
            <PauseRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <PauseRepairPartsButton />
          </Grid>
          {/* <Grid item xs={4} md={2}>
            <AddPartsButton />
          </Grid> */}
          <Grid item xs={6} lg={3}>
            <CompleteRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <ReturnToCustomerButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <CancelRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <NotesButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <ReprintButton />
          </Grid>
        </Grid>
        {/* <PartsModal /> */}
        <LoadBox />
      </>
    );
  }
  if (status == 3 || status == 11) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} lg={3}>
            <RestartRepairButton />
          </Grid>

          <Grid item xs={6} lg={3}>
            <CompleteRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <ReturnToCustomerButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <CancelRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <NotesButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <ReprintButton />
          </Grid>
        </Grid>
        <setShowLoad />
      </>
    );
  }
  if (status == 997) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} lg={3}>
            <RestartRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <ArchiveRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <NotesButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <ReprintButton />
          </Grid>
        </Grid>
        <setShowLoad />
      </>
    );
  }

  if (status == 4) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          {/* <Grid item xs={4} md={2}>
            <AddPartsButton />
          </Grid> */}
          <Grid item xs={6} lg={3}>
            <CreateInvoiceButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <RestartRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <CancelRepairButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <NotesButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <ReprintButton />
          </Grid>
        </Grid>
        <LoadBox />
        {repairOrderReady ? (
          <Modal
            open={showInvoice}
            onClose={() => null}
            // onClose={() => {
            //   setNewRepair(false);
            // }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <MDBox sx={style}>
              <MDTypography id="modal-modal-title" variant="h6" component="h2">
                Create Invoice
              </MDTypography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <MDTypography variant="h6" sx={{ mt: 1 }}>
                    Item
                  </MDTypography>
                </Grid>
                <Grid item xs={2}>
                  <MDTypography variant="h6" sx={{ mt: 1 }}>
                    Qty
                  </MDTypography>
                </Grid>
                <Grid item xs={3}>
                  <MDTypography variant="h6" sx={{ mt: 1 }}>
                    Cost
                  </MDTypography>
                </Grid>
                <Grid item xs={3}>
                  <MDTypography variant="h6" sx={{ mt: 1 }}>
                    Subtotal
                  </MDTypography>
                </Grid>
                {repairOrder.lineItems.map((item) => {
                  return (
                    <>
                      <Grid item xs={4}>
                        <MDTypography variant="body2" sx={{ mt: 1 }}>
                          {item.name}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={2}>
                        <MDTypography variant="body2" sx={{ mt: 1 }}>
                          {item.quantity}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={3}>
                        <MDTypography variant="body2" sx={{ mt: 1 }}>
                          ${(item.basePriceMoney.amount / 100).toFixed(2)}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={3}>
                        <MDTypography variant="body2" sx={{ mt: 1 }}>
                          ${((item.basePriceMoney.amount * item.quantity) / 100).toFixed(2)}
                        </MDTypography>
                      </Grid>
                    </>
                  );
                })}
                <Grid item xs={4}>
                  <MDTypography variant="body2" sx={{ mt: 1 }}>
                    Labor
                  </MDTypography>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    label="Time (hours)"
                    value={timeUsed}
                    onChange={(e) => {
                      setLaborTime(e.target.value);
                    }}
                    type="number"
                  ></TextField>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Labor Rate"
                    value={Labor}
                    onChange={(e, val) => {
                      setLabor(e.target.value);
                    }}
                    type="number"
                  ></TextField>
                </Grid>
                <Grid item xs={3}>
                  <MDTypography variant="body2" sx={{ mt: 1 }}>
                    ${(timeUsed * Labor).toFixed(2)}
                  </MDTypography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={9}>
                  Subtotal
                </Grid>
                <Grid item xs={3}>
                  ${subTotal.toFixed(2)}
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={3}>
                  Tax
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Taxable"
                    onChange={(e) => {
                      setTaxable(e.target.checked);
                      if (!e.target.checked) {
                        setTax(0);
                        setTotal(subTotal);
                      } else {
                        setTax(subTotal * (TaxRate / 100));
                        setTotal(subTotal + subTotal * (TaxRate / 100));
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Tax Rate %"
                    disabled={!Taxable}
                    value={TaxRate}
                    onChange={(e, val) => {
                      setTaxRate(e.target.value);
                      setTax(subTotal * (TaxRate / 100));
                      setTotal(subTotal + subTotal * (TaxRate / 100));
                    }}
                    type="number"
                  ></TextField>
                </Grid>
                <Grid item xs={3}>
                  ${Tax.toFixed(2)}
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={9}>
                  Total
                </Grid>
                <Grid item xs={3}>
                  ${Total.toFixed(2)}
                </Grid>
              </Grid>
              <FormControl fullWidth></FormControl>
              <MDButton
                sx={{ marginTop: "2px" }}
                fullWidth
                color="success"
                onClick={() => {
                  doCreateInvoice();
                }}
              >
                Create Invoice
              </MDButton>
              <MDButton
                sx={{ marginTop: "2px" }}
                fullWidth
                color="secondary"
                onClick={() => {
                  setShowInvoice(false);
                }}
              >
                Cancel
              </MDButton>
            </MDBox>
          </Modal>
        ) : null}
        {/* <PartsModal /> */}
      </>
    );
  }
  if (status == 5) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} lg={3}>
            <CancelInvoiceButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <NotesButton />
          </Grid>
          <Grid item xs={6} lg={3}>
            <ReprintButton />
          </Grid>
        </Grid>
        <LoadBox />
        <ConfirmActionDialog
          title="Are you sure?"
          content="Do you wish to cancel this invoice?"
          action={() => doCancelInvoice()}
          openState={confirmOpen.cancelInvoice}
          closeState={() => toggleconfirmOpen({ cancelInvoice: false })}
        />
      </>
    );
  }
  if (status == 6) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <ReprintButton />
        </Grid>
        <setShowLoad />
      </>
    );
  }
}
Actions.whyDidYouRender = true;
export default Actions;
