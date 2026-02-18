import { useState, React, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//Global
import { globalFuncs } from "../../../context/global";

import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import { Grid } from "@mui/material";
import vars from "../../../config";

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
import PartsButton from "../../../components/PartsButton";
import AddNotes from "../../../components/NotesButton";
import ChecklistModal from "./checklist";
import PauseRepairPartsButton from "../../../components/PauseRepairPartsButton";
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
  repair,
}) {
  let redirect = useNavigate();
  const socket = useSocket();
  const [state, setState] = useState({
    Labor: 100,
    Tax: 0,
    TaxRate: 7,
    Taxable: false,
    subTotal: 0,
    Total: 0,
    activeRepair: "",
    showInvoice: false,
    timeUsed: repairTime.toFixed(2),
    dialogOpen: false,
    printDialogOpen: false,
    documents: [],
    confirmOpen: { cancelInvoice: false },
    checklistOpen: false,
  });
  const { setSnackBar, setShowLoad } = globalFuncs();

  useEffect(() => {
    if (repairOrderReady == true) {
      let mySubTotal = state.timeUsed * state.Labor;
      repairOrder.lineItems.map((item) => {
        mySubTotal = mySubTotal + (item.basePriceMoney.amount * item.quantity) / 100;
      });
      let mytax = 0;
      if (state.Taxable) {
        mytax = mySubTotal * (state.TaxRate / 100);
        setState((s) => ({ ...s, Tax: mytax, subTotal: mySubTotal, Total: mySubTotal + mytax }));
      } else {
        mytax = 0;
        setState((s) => ({ ...s, Tax: 0, Total: mySubTotal + mytax }));
      }
    }
  }, [repairOrderReady, state.Labor, state.Taxable, state.TaxRate, state.timeUsed]);
  useEffect(() => {
    setState((s) => ({ ...s, repairTime: repairTime.toFixed(2) }));
  }, [repairTime]);

  const getDocuments = () => {
    if (socket) {
      socket.emit("getDocuments", { repairID: repairID }, (json) => {
        if (json.res == 200) {
          setState((s) => ({ ...s, printDialogOpen: true, documents: json.data }));
        } else {
          setState((s) => ({ ...s, documents: [] }));
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
              message: "Repair status updated successfully",
              show: true,
              icon: "check",
            });
            getRepair();
          } else if (json.res == 501) {
            setState((s) => ({ ...s, activeRepair: json.repairID, dialogOpen: true }));
          } else {
            setSnackBar({
              type: "error",
              title: "Server error occured",
              message: json.message,
              show: true,
              icon: "error",
            });
          }
        }
      );
    } else {
      console.log("socket not connected");
    }
    setShowLoad(false);
    return null;
  };

  const doCreateInvoice = () => {
    setShowLoad(true);
    let dueTaxes;
    if (state.Taxable) {
      dueTaxes = {
        taxes: [
          {
            type: "ADDITIVE",
            name: "FL Sales Tax",
            percentage: state.TaxRate.toString(),
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
            note: `${state.timeUsed} hours @ $${state.Labor}/hr`,
            basePriceMoney: {
              amount: Math.round(state.Labor * state.timeUsed) * 100,
            },
          },
          tax: dueTaxes,
        },
        (json) => {
          if (json.res == 200) {
            setSnackBar({
              type: "success",
              title: "Invoice created",
              message: "Invoice created successfully",
              show: true,
              icon: "check",
            });
            setState((s) => ({ ...s, showInvoice: false }));
            getRepair();
          } else {
            setSnackBar({
              type: "error",
              title: "Server error occured",
              message: "Server error occured",
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
    setState((s) => ({ ...s, confirmOpen: { cancelInvoice: false } }));
    setShowLoad(true);
    if (socket) {
      socket.emit("cancelInvoice", { id: repairID }, (json) => {
        if (json.res == 200) {
          setSnackBar({
            type: "success",
            title: "Invoice Cancelled",
            message: "Invoice cancelled successfully",
            show: true,
            icon: "check",
          });
        } else {
          setSnackBar({
            type: "error",
            title: "Server error occured",
            message: "Server error occured",
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
    setState((s) => ({ ...s, printDialogOpen: false }));
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
          message: "Document sent to printer successfully",
          show: true,
          icon: "check",
        });
      } else {
        setSnackBar({
          type: "error",
          title: "Error occured during printing",
          message: "Error occured during printing",
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

  const printDocsDialog = (
    <Dialog open={state.printDialogOpen}>
      <DialogTitle>Reprint Paperwork</DialogTitle>
      <DialogContent>
        {state.documents.map((doc) => {
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
        <MDButton
          color="error"
          fullWidth
          onClick={() => setState((s) => ({ ...s, printDialogOpen: false }))}
        >
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
          setState((s) => ({ ...s, activeRepair: json.data._id, dialogOpen: true }));
        } else {
          let showChecklist = false;
          if (
            repair &&
            repair.RepairType &&
            repair.RepairType.some((t) => t.toLowerCase() !== "other")
          ) {
            try {
              const qRes = await new Promise((resolve) => {
                socket.emit("getChecklistQuestions", {}, (res) => resolve(res));
              });
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
            setState((s) => ({ ...s, checklistOpen: true }));
          } else {
            repairAction(2, "Repair started", "construction", "success");
          }
        }
      });
    }
  };

  const handleCompleteRepair = async () => {
    setShowLoad(true);
    try {
      const qRes = await new Promise((resolve) => {
        socket.emit("getChecklistQuestions", {}, (res) => resolve(res));
      });
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
          let scrolled = false;
          missing.forEach((q) => {
            const el = document.getElementById(`question-${q._id}`);
            if (el) {
              if (!scrolled) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                scrolled = true;
              }
              el.animate(
                [{ backgroundColor: "rgba(244, 67, 54, 0.2)" }, { backgroundColor: "transparent" }],
                {
                  duration: 1000,
                  iterations: 3,
                }
              );
            }
          });

          if (!scrolled) {
            const checklistElement = document.getElementById("in-progress-checklist");
            if (checklistElement) {
              checklistElement.scrollIntoView({ behavior: "smooth", block: "center" });
              scrolled = true;
            }
          }

          setSnackBar({
            type: "error",
            title: "In Progress Checklist Incomplete",
            message: scrolled
              ? "Please complete the highlighted questions."
              : "Please answer all In Progress checklist questions before completing the repair.",
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
    setState((s) => ({ ...s, checklistOpen: true }));
  };

  const startRepairButton = (
    <>
      <Tooltip title="Start Repair">
        <MDButton fullwidth color="success" variant="contained" pb={3} onClick={handleStartRepair}>
          <Icon>play_circle</Icon>
        </MDButton>
      </Tooltip>
      <ConfirmActionDialog
        title={"Current repair in progress"}
        content={
          "You must pause the current repair before starting a new one. Would you like to go to the current repair"
        }
        action={() => {
          redirect(`/repairdetails/${state.activeRepair}`);
          setState((s) => ({ ...s, dialogOpen: false }));
        }}
        openState={state.dialogOpen}
        closeState={() => setState((s) => ({ ...s, dialogOpen: false }))}
      />
    </>
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

  const completeRepairButton = (
    <Tooltip title="Complete Repair">
      <MDButton fullwidth color="success" variant="contained" onClick={handleCompleteRepair}>
        <Icon>check_circle</Icon>
      </MDButton>
    </Tooltip>
  );

  const restartRepairButton = (
    <>
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
      <ConfirmActionDialog
        title={"Current repair in progress"}
        content={
          "You must pause the current repair before starting a new one. Would you like to go to the current repair"
        }
        action={() => {
          redirect(`/repairdetails/${state.activeRepair}`);
          setState((s) => ({ ...s, dialogOpen: false }));
        }}
        openState={state.dialogOpen}
        closeState={() => setState((s) => ({ ...s, dialogOpen: false }))}
      />
    </>
  );

  const createInvoiceButton = (
    <Tooltip title="Create Invoice">
      <MDButton
        fullwidth
        color="success"
        variant="contained"
        p={3}
        disabled={!repairOrderReady}
        onClick={() => setState((s) => ({ ...s, showInvoice: true }))}
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
        onClick={() => setState((s) => ({ ...s, confirmOpen: { cancelInvoice: true } }))}
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

  if (status == 1) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {startRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {pauseRepairPartsButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            <PartsButton size="icon" status={status} getRepair={getRepair} repairId={repairID} />
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {returnToCustomerButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {cancelRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            <AddNotes repairId={repairID} size="icon" callback={getRepair} />
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {reprintButton}
          </Grid>
          <ChecklistModal
            open={state.checklistOpen}
            onClose={() => setState((s) => ({ ...s, checklistOpen: false }))}
            repair={repair}
            checklistType="Pre-Repair"
            getRepair={getRepair}
            onSave={() => repairAction(2, "Repair started", "construction", "success")}
          />
        </Grid>
        {printDocsDialog}
      </>
    );
  }
  if (status == 2) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {pauseRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {pauseRepairPartsButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            <PartsButton size="icon" status={status} getRepair={getRepair} repairId={repairID} />
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {completeRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {returnToCustomerButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {cancelRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            <AddNotes repairId={repairID} size="icon" callback={getRepair} />
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {reprintButton}
          </Grid>
        </Grid>
        {printDocsDialog}
        <ChecklistModal
          open={state.checklistOpen}
          onClose={() => setState((s) => ({ ...s, checklistOpen: false }))}
          repair={repair}
          checklistType="Post-Repair"
          getRepair={getRepair}
          onSave={() => repairAction(4, "Repair completed", "build_circle", "success")}
        />
      </>
    );
  }
  if (status == 3 || status == 11) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {restartRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {pauseRepairPartsButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            <PartsButton size="icon" status={status} getRepair={getRepair} repairId={repairID} />
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {completeRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {returnToCustomerButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {cancelRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            <AddNotes repairId={repairID} size="icon" callback={getRepair} />
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {reprintButton}
          </Grid>
        </Grid>
        {printDocsDialog}
        <ChecklistModal
          open={state.checklistOpen}
          onClose={() => setState((s) => ({ ...s, checklistOpen: false }))}
          repair={repair}
          checklistType="Post-Repair"
          getRepair={getRepair}
          onSave={() => repairAction(4, "Repair completed", "build_circle", "success")}
        />
      </>
    );
  }
  if (status == 997) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {restartRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {archiveRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            <AddNotes repairId={repairID} size="icon" callback={getRepair} />
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {reprintButton}
          </Grid>
        </Grid>
        {printDocsDialog}
      </>
    );
  }

  if (status == 4) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            <PartsButton size="icon" status={status} getRepair={getRepair} repairId={repairID} />
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {createInvoiceButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {restartRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {cancelRepairButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            <AddNotes repairId={repairID} size="icon" callback={getRepair} />
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {reprintButton}
          </Grid>
        </Grid>
        {printDocsDialog}
        {repairOrderReady ? (
          <Modal
            open={state.showInvoice}
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
                    value={state.timeUsed}
                    onChange={(e) => {
                      setState((s) => ({ ...s, timeUsed: e.target.value }));
                    }}
                    type="number"
                  ></TextField>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Labor Rate"
                    value={state.Labor}
                    onChange={(e, val) => {
                      setState((s) => ({ ...s, Labor: e.target.value }));
                    }}
                    type="number"
                  ></TextField>
                </Grid>
                <Grid item xs={3}>
                  <MDTypography variant="body2" sx={{ mt: 1 }}>
                    ${(state.timeUsed * state.Labor).toFixed(2)}
                  </MDTypography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={9}>
                  Subtotal
                </Grid>
                <Grid item xs={3}>
                  ${Number(state.subTotal).toFixed(2)}
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
                      if (!e.target.checked) {
                        setState((s) => ({
                          ...s,
                          Tax: 0,
                          subTotal: state.subTotal,
                          Taxable: false,
                        }));
                      } else {
                        setState((s) => ({
                          ...s,
                          Tax: state.subTotal * (state.TaxRate / 100),
                          Total: state.subTotal + state.subTotal * (state.TaxRate / 100),
                          Taxable: true,
                        }));
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Tax Rate %"
                    disabled={!state.Taxable}
                    value={state.TaxRate}
                    onChange={(e, val) => {
                      setState((s) => ({
                        s,
                        TaxRate: e.target.value,
                        Tax: state.subTotal * (e.target.value / 100),
                        Total: state.subTotal + state.subTotal * (e.target.value / 100),
                      }));
                    }}
                    type="number"
                  ></TextField>
                </Grid>
                <Grid item xs={3}>
                  ${Number(state.Tax).toFixed(2)}
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={9}>
                  Total
                </Grid>
                <Grid item xs={3}>
                  ${Number(state.Total).toFixed(2)}
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
                  setState((s) => ({ ...s, showInvoice: false }));
                }}
              >
                Cancel
              </MDButton>
            </MDBox>
          </Modal>
        ) : null}
      </>
    );
  }
  if (status == 5) {
    return (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {cancelInvoiceButton}
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            <AddNotes repairId={repairID} size="icon" callback={getRepair} />
          </Grid>
          <Grid item xs={3} sm={2} md={4} lg={3} xl={3}>
            {reprintButton}
          </Grid>
        </Grid>
        <ConfirmActionDialog
          title="Are you sure?"
          content="Do you wish to cancel this invoice?"
          action={() => doCancelInvoice()}
          openState={state.confirmOpen.cancelInvoice}
          closeState={() => setState((s) => ({ ...s, confirmOpen: { cancelInvoice: false } }))}
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
      </>
    );
  }
}

export default Actions;
