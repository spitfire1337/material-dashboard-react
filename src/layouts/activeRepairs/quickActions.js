//Global
import { globalFuncs } from "../../context/global";

import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import { Grid } from "@mui/material";
import vars from "../../config";
import { useState, React } from "react";
import { useNavigate } from "react-router-dom";
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
// import PartsOrder from "./partsOrder";
// import PartsAdd from "../components/addParts";
//Buttons
import AddNotes from "components/NotesButton";
import PartsButton from "components/PartsButton";
import ChecklistModal from "../repairDetails/components/checklist";
import PauseRepairPartsButton from "components/PauseRepairPartsButton";
import { useSocket } from "context/socket";

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
  repair,
}) {
  const navigate = useNavigate();
  const { setSnackBar, setShowLoad } = globalFuncs();
  const socket = useSocket();
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

  const [partsCount, setPartsCount] = useState(0);

  const [confirmOpen, toggleconfirmOpen] = useState({ cancelInvoice: false });
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [showUpload, showUploadFunc] = useState(false);
  const [activeRepairId, setActiveRepairId] = useState(null);
  const [showActiveRepairDialog, setShowActiveRepairDialog] = useState(false);
  // const { PartsOrderDialog, togglePartsOrderOpen } = PartsOrder();

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

  const getParts = () => {
    setShowLoad(true);
    if (socket) {
      socket.emit("getParts", {}, (json) => {
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
        }
        setShowLoad(false);
      });
    }
  };

  const getDocuments = () => {
    if (socket) {
      socket.emit("getDocuments", { repairID: repairID }, (json) => {
        if (json.res == 200) {
          setDocuments(json.data);
          toggleprintDialogOpen(true);
        } else {
          setDocuments([]);
        }
      });
    }
  };

  const repairAction = (status, Event, icon, color) => {
    setShowLoad(true);
    if (socket) {
      socket.emit(
        "updateRepairStatus",
        {
          id: repairID,
          status: status,
          history: {
            repairId: repairID,
            Event: Event,
            Details: "",
            icon: icon,
            color: color,
          },
        },
        (json) => {
          if (json.res == 200) {
            setSnackBar({
              type: "success",
              title: "Repair Updated",
              message: "Repair status Updated",
              show: true,
              icon: "check",
            });
            reRender();
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
        }
      );
    }
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

  const doCreateInvoice = () => {
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
    if (socket) {
      socket.emit(
        "createInvoice",
        {
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
        },
        (json) => {
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
        }
      );
    }
  };

  const doCancelInvoice = () => {
    toggleconfirmOpen({ cancelInvoice: false });
    setShowLoad(true);
    if (socket) {
      socket.emit("cancelInvoice", { id: repairID }, (json) => {
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
      });
    }
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

  const printDocsDialog = (
    <Dialog open={printDialogOpen}>
      <DialogTitle>Reprint Paperwork</DialogTitle>
      <DialogContent>
        {documents.map((doc) => {
          return (
            // eslint-disable-next-line react/jsx-key
            <>
              <MDButton mt={1} fullWidth color="success" onClick={() => reprintPaperwork(doc._id)}>
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

  const reprintButton = (
    <Tooltip title="Reprint Paperwork">
      <MDButton fullwidth color="dark" variant="contained" pb={3} onClick={() => getDocuments()}>
        <Icon>print</Icon>
      </MDButton>
    </Tooltip>
  );

  const handleStartRepair = () => {
    setShowLoad(true);
    if (socket) {
      socket.emit("activeRepair", {}, async (json) => {
        if (json.res == 501) {
          setShowLoad(false);
          setActiveRepairId(json.data._id);
          setShowActiveRepairDialog(true);
        } else {
          let showChecklist = false;
          if (
            repair &&
            repair.RepairType &&
            repair.RepairType.some((t) => t.toLowerCase() !== "other")
          ) {
            try {
              const qResponse = await fetch(`${vars.serverUrl}/checklist/questions`, {
                credentials: "include",
              });
              const qRes = await qResponse.json();
              if (qRes.res === 200) {
                const checklistType = "Pre-Repair";
                const applicableQuestions = qRes.data.filter((q) => {
                  if (!q.isActive) return false;
                  if (q.checklistType !== checklistType) return false;

                  if (q.deviceType && q.deviceType !== "All" && q.deviceType !== "") {
                    const deviceType = repair.pev?.PevType || repair.pev?.type;
                    if (deviceType && q.deviceType !== deviceType) return false;
                  }

                  if (q.repairType && q.repairType !== "All" && q.repairType !== "") {
                    if (repair.RepairType && !repair.RepairType.includes(q.repairType))
                      return false;
                  }
                  return true;
                });

                let answeredIds = [];
                if (repair.preRepairChecklist && repair.preRepairChecklist.answers) {
                  answeredIds = repair.preRepairChecklist.answers.map((a) => a.questionId);
                } else if (repair.checklistAnswers) {
                  answeredIds = repair.checklistAnswers
                    .filter((a) => a.checklistType === checklistType)
                    .map((a) => a.questionId);
                }

                const hasUnanswered = applicableQuestions.some((q) => !answeredIds.includes(q._id));

                if (hasUnanswered && applicableQuestions.length > 0) {
                  showChecklist = true;
                }
              } else {
                showChecklist = true;
              }
            } catch (e) {
              console.error(e);
              showChecklist = true;
            }
          }

          setShowLoad(false);
          if (showChecklist) {
            setChecklistOpen(true);
          } else {
            repairAction(2, "Repair started", "construction", "success");
          }
        }
      });
    }
  };

  const startRepairButton = (
    <Tooltip title="Start Repair">
      <MDButton fullwidth color="success" variant="contained" pb={3} onClick={handleStartRepair}>
        <Icon>play_circle</Icon>
      </MDButton>
    </Tooltip>
  );

  const returnToCustomerButton = (
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

  const cancelRepairButton = (
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

  const pauseRepairButton = (
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

  const pauseRepairPartsButton = (
    <PauseRepairPartsButton repairId={repairID} onPause={repairAction} size="icon" />
  );

  const addPartsButton = (
    <Tooltip title="Add Parts">
      <MDButton fullwidth color="dark" variant="contained" onClick={() => getParts()}>
        <Icon>add_shopping_cart</Icon>
      </MDButton>
    </Tooltip>
  );

  const handleCompleteRepair = async () => {
    setShowLoad(true);
    try {
      const qResponse = await fetch(`${vars.serverUrl}/checklist/questions`, {
        credentials: "include",
      });
      const qRes = await qResponse.json();
      if (qRes.res === 200) {
        const checklistType = "In Progress";
        const applicableQuestions = qRes.data.filter((q) => {
          if (!q.isActive) return false;
          if (q.checklistType !== checklistType) return false;

          if (q.deviceType && q.deviceType !== "All" && q.deviceType !== "") {
            const deviceType = repair.pev?.PevType || repair.pev?.type;
            if (deviceType && q.deviceType !== deviceType) return false;
          }

          if (q.repairType && q.repairType !== "All" && q.repairType !== "") {
            if (repair.RepairType && !repair.RepairType.includes(q.repairType)) return false;
          }
          return true;
        });

        let answeredIds = [];
        if (repair.inprogressRepairChecklist && repair.inprogressRepairChecklist.answers) {
          answeredIds = repair.inprogressRepairChecklist.answers.map((a) => a.questionId);
        } else if (repair.checklistAnswers) {
          answeredIds = repair.checklistAnswers
            .filter((a) => a.checklistType === checklistType)
            .map((a) => a.questionId);
        }

        const missing = applicableQuestions.filter((q) => !answeredIds.includes(q._id));

        if (missing.length > 0) {
          setSnackBar({
            type: "error",
            title: "In Progress Checklist Incomplete",
            message:
              "Please answer all In Progress checklist questions before completing the repair.",
            show: true,
            icon: "warning",
          });
          setShowLoad(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setShowLoad(false);
    setChecklistOpen(true);
  };

  const completeRepairButton = (
    <Tooltip title="Complete Repair">
      <MDButton fullwidth color="success" variant="contained" onClick={handleCompleteRepair}>
        <Icon>check_circle</Icon>
      </MDButton>
    </Tooltip>
  );

  const restartRepairButton = (
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

  const createInvoiceButton = (
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

  const cancelInvoiceButton = (
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

  const archiveRepairButton = (
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
  console.log("Quick actions rendered");
  if (status == 1) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} lg={3}>
            {startRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            {pauseRepairPartsButton}
          </Grid>
          <Grid item xs={6} md={3}>
            <PartsButton size="icon" repairId={repairID} getRepair={getRepair} />
          </Grid>
          <Grid item xs={6} lg={3}>
            {returnToCustomerButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            {cancelRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            <AddNotes repairId={repairID} callback={getRepair} size="icon" />
          </Grid>
          <Grid item xs={6} lg={3}>
            {reprintButton}
          </Grid>
        </Grid>
        <ChecklistModal
          open={checklistOpen}
          onClose={() => setChecklistOpen(false)}
          repair={repair}
          checklistType="Pre-Repair"
          getRepair={reRender || getRepair}
          onSave={() => repairAction(2, "Repair started", "construction", "success")}
        />
        {printDocsDialog}
        <ConfirmActionDialog
          title={"Current repair in progress"}
          content={
            "You must pause the current repair before starting a new one. Would you like to go to the current repair"
          }
          action={() => {
            navigate(`/repairdetails/${activeRepairId}`);
            setShowActiveRepairDialog(false);
          }}
          openState={showActiveRepairDialog}
          closeState={() => setShowActiveRepairDialog(false)}
        />
        {/* <PartsModal /> */}
      </>
    );
  }
  if (status == 2) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} lg={3}>
            {pauseRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            {pauseRepairPartsButton}
          </Grid>
          <Grid item xs={6} md={3}>
            <PartsButton size="icon" repairId={repairID} getRepair={getRepair} />
          </Grid>
          <Grid item xs={6} lg={3}>
            {completeRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            {returnToCustomerButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            {cancelRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            <AddNotes repairId={repairID} callback={getRepair} size="icon" />
          </Grid>
          <Grid item xs={6} lg={3}>
            {reprintButton}
          </Grid>
        </Grid>
        {printDocsDialog}
        <ChecklistModal
          open={checklistOpen}
          onClose={() => setChecklistOpen(false)}
          repair={repair}
          checklistType="Post-Repair"
          getRepair={reRender || getRepair}
          onSave={() => repairAction(4, "Repair completed", "build_circle", "success")}
        />
        {/* <PartsModal /> */}
      </>
    );
  }
  if (status == 3 || status == 11) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} lg={3}>
            {restartRepairButton}
          </Grid>
          <Grid item xs={6} md={3}>
            <PartsButton size="icon" repairId={repairID} getRepair={getRepair} />
          </Grid>
          <Grid item xs={6} lg={3}>
            {completeRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            {returnToCustomerButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            {cancelRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            <AddNotes repairId={repairID} callback={getRepair} size="icon" />
          </Grid>
          <Grid item xs={6} lg={3}>
            {reprintButton}
          </Grid>
        </Grid>
        {printDocsDialog}
        <ChecklistModal
          open={checklistOpen}
          onClose={() => setChecklistOpen(false)}
          repair={repair}
          checklistType="Post-Repair"
          getRepair={reRender || getRepair}
          onSave={() => repairAction(4, "Repair completed", "build_circle", "success")}
        />
        <setShowLoad />
      </>
    );
  }
  if (status == 997) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} lg={3}>
            {restartRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            {archiveRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            <AddNotes repairId={repairID} callback={getRepair} size="icon" />
          </Grid>
          <Grid item xs={6} lg={3}>
            {reprintButton}
          </Grid>
        </Grid>
        {printDocsDialog}
        <setShowLoad />
      </>
    );
  }

  if (status == 4) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          {/* <Grid item xs={4} md={2}>
            {addPartsButton}
          </Grid> */}
          <Grid item xs={6} lg={3}>
            {createInvoiceButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            {restartRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            {cancelRepairButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            <AddNotes repairId={repairID} callback={getRepair} size="icon" />
          </Grid>
          <Grid item xs={6} lg={3}>
            {reprintButton}
          </Grid>
        </Grid>
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
        {printDocsDialog}
        {/* <PartsModal /> */}
      </>
    );
  }
  if (status == 5) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} lg={3}>
            {cancelInvoiceButton}
          </Grid>
          <Grid item xs={6} lg={3}>
            <AddNotes repairId={repairID} callback={getRepair} size="icon" />
          </Grid>
          <Grid item xs={6} lg={3}>
            {reprintButton}
          </Grid>
        </Grid>
        <ConfirmActionDialog
          title="Are you sure?"
          content="Do you wish to cancel this invoice?"
          action={() => doCancelInvoice()}
          openState={confirmOpen.cancelInvoice}
          closeState={() => toggleconfirmOpen({ cancelInvoice: false })}
        />
        {printDocsDialog}
      </>
    );
  }
  if (status == 6) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          {reprintButton}
        </Grid>
        {printDocsDialog}
        <setShowLoad />
      </>
    );
  }
}
Actions.whyDidYouRender = true;
export default Actions;
