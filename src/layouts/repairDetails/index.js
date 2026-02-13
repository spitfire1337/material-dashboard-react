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
import parse from "html-react-parser";
import { globalFuncs } from "../../context/global";
import { useLoginState } from "../../context/loginContext";
// Vars
import vars from "../../config";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {
  Divider,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormControl,
  Tooltip,
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
import PartsAdd from "./components/addParts";
import AddPhotos from "./components/addPhoto";
import { useTableState } from "../../context/tableState";
import PartsButton from "components/PartsButton";
import AddNotes from "components/NotesButton";

const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
  color: () => {
    let colorValue = dark.main;

    // if (transparentNavbar) {
    //   colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
    // }

    return colorValue;
  },
});

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
  if (repairStatus == 11) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Paused - Awaiting parts"
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

const PartsItem = ({ part, status, onDelete }) => {
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
          <IconButton size="small" disableRipple color="red" onClick={() => onDelete(part)}>
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

const PartsOrderedItem = ({ part, onReceive, onDelete }) => {
  const getTrackingLink = (trackingNumber) => {
    if (!trackingNumber) return null;
    const cleanNumber = trackingNumber.replace(/\s/g, "").toUpperCase();

    // UPS
    if (/^1Z[A-Z0-9]{16}$/.test(cleanNumber)) {
      return `https://www.ups.com/track?tracknum=${cleanNumber}`;
    }
    // FedEx
    if (/^\d{12}$|^\d{15}$/.test(cleanNumber)) {
      return `https://www.fedex.com/fedextrack/?trknbr=${cleanNumber}`;
    }
    // USPS
    if (
      /^9\d{21}$/.test(cleanNumber) ||
      /^\d{20}$/.test(cleanNumber) ||
      /^\d{22}$/.test(cleanNumber)
    ) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleanNumber}`;
    }
    // DHL
    if (/^\d{10}$/.test(cleanNumber)) {
      return `https://www.dhl.com/en/express/tracking.html?AWB=${cleanNumber}&brand=DHL`;
    }
    // Amazon
    if (/^TB[A-Z]\d{12}$/.test(cleanNumber)) {
      return `https://track.amazon.com/tracking/${cleanNumber}`;
    }
    return null;
  };

  const trackingLink = getTrackingLink(part.trackingNumber);
  const amazonLink =
    part.vendor && part.vendor.toLowerCase().includes("amazon") && part.orderNumber
      ? `https://www.amazon.com/your-orders/order-details?orderID=${part.orderNumber}`
      : null;

  return (
    <>
      <Grid item xs={4}>
        <MDTypography variant="body2">{part.partName}</MDTypography>
        <MDTypography variant="caption" display="block">
          {part.vendor} {part.orderNumber ? `- ${part.orderNumber}` : ""}
        </MDTypography>
      </Grid>
      <Grid item xs={2}>
        <MDTypography variant="body2">{part.quantity}</MDTypography>
      </Grid>
      <Grid item xs={4}>
        {trackingLink ? (
          <MDTypography
            component="a"
            href={trackingLink}
            target="_blank"
            rel="noreferrer"
            variant="body2"
            color="info"
            sx={{ textDecoration: "underline", cursor: "pointer" }}
          >
            {part.trackingNumber}
          </MDTypography>
        ) : (
          <MDTypography variant="body2">{part.trackingNumber}</MDTypography>
        )}
        {amazonLink && (
          <MDTypography
            component="a"
            href={amazonLink}
            target="_blank"
            rel="noreferrer"
            variant="caption"
            color="info"
            display="block"
            sx={{ textDecoration: "underline", cursor: "pointer" }}
          >
            Track on Amazon
          </MDTypography>
        )}
      </Grid>
      <Grid item xs={1}>
        <Tooltip title="Mark as Received">
          <IconButton color="success" onClick={() => onReceive(part)}>
            <Icon>check</Icon>
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid item xs={1}>
        <Tooltip title="Remove Ordered Part">
          <IconButton color="error" onClick={() => onDelete(part)}>
            <Icon>delete</Icon>
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid item xs={12} mb={-2} mt={-2}>
        <Divider fullWidth></Divider>
      </Grid>
    </>
  );
};

const ChecklistQuestion = ({ question, answerObj, canEdit, onSave, id }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (answerObj) {
      setValue(answerObj.answer);
    } else {
      setValue(question.answerType === "checkbox" ? false : "");
    }
  }, [answerObj, question]);

  const handleChange = (e) => {
    const newValue = question.answerType === "checkbox" ? e.target.checked : e.target.value;
    setValue(newValue);
    if (question.answerType !== "text") {
      onSave(question._id, newValue);
    }
  };

  const handleBlur = () => {
    if (question.answerType === "text") {
      const original = answerObj ? answerObj.answer : "";
      if (value !== original) {
        onSave(question._id, value);
      }
    }
  };

  if (!canEdit) {
    let answerDisplay = "Not answered";
    if (answerObj) {
      if (question.answerType === "checkbox") {
        answerDisplay = answerObj.answer ? "Yes" : "No";
      } else {
        answerDisplay = answerObj.answer;
      }
    }
    return (
      <MDBox mb={1} id={id}>
        <MDTypography variant="button" fontWeight="bold" display="block">
          {question.question.text}
          {question.question.required && <span style={{ color: "red" }}> *</span>}
        </MDTypography>
        <MDTypography variant="body2">{String(answerDisplay)}</MDTypography>
        {answerObj?.user && (
          <MDTypography variant="caption" color="text" display="block">
            Answered by: {answerObj.user}
          </MDTypography>
        )}
        <Divider />
      </MDBox>
    );
  }

  return (
    <MDBox mb={1} id={id}>
      <MDTypography variant="button" fontWeight="bold" display="block">
        {question.question.text}
        {question.question.required && <span style={{ color: "red" }}> *</span>}
      </MDTypography>
      {question.answerType === "text" && (
        <TextField
          fullWidth
          variant="standard"
          value={value}
          onKeyUp={(e) => {
            if (e.keyCode === 13) {
              handleChange(e);
            }
          }}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      )}
      {question.answerType === "select" && (
        <FormControl fullWidth variant="standard">
          <Select value={value} onChange={handleChange} displayEmpty>
            <MenuItem value="" disabled>
              <em>Select Option</em>
            </MenuItem>
            {question.selectOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {question.answerType === "checkbox" && (
        <FormControlLabel
          control={<Checkbox checked={Boolean(value)} onChange={handleChange} />}
          label="Yes"
        />
      )}
      {answerObj?.user && (
        <MDTypography variant="caption" color="text" display="block">
          Answered by: {answerObj.user}
        </MDTypography>
      )}
      <Divider />
    </MDBox>
  );
};

// eslint-disable-next-line react/prop-types
const RepairDetails = () => {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const { setLoginState } = useLoginState();
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
  const [partsOrdered, setPartsOrdered] = useState([]);
  const [newRepairPart, setnewRepairPart] = useState(false);
  const [dialogOpen, toggleDialogOpen] = useState(false);
  const [repairOrder, setRepairOrder] = useState();
  const [repairOrderReady, setRepairOrderReady] = useState(false);
  const [confirmOpen, toggleconfirmOpen] = useState({
    removePart: false,
    editTime: false,
    removeOrderedPart: false,
  });
  const [orderedPartToDelete, setOrderedPartToDelete] = useState(null);
  const [partId, setPartid] = useState();
  const [partName, setPartName] = useState();
  const [newMinutes, setnewMinutes] = useState();
  const [questions, setQuestions] = useState([]);
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
      setLoading(false);
      setnewMinutes(Math.round(res.data.repairTime * 60));
      setrepairDetails(res.data);
      setrepairHistory(res.history);
      setrepairImages(res.images);
      setAllRepairNotes(res.notes);
      setAllParts(res.parts);
      setPartsOrdered(res.partsOrdered || []);
      RepairRerender();
      setShowLoad(false);

      //setRepairOrderReady(true);
    }
  };

  const getQuestions = async () => {
    try {
      const response = await fetch(`${vars.serverUrl}/checklist/questions`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setQuestions(res.data);
      }
    } catch (error) {
      console.error(error);
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

  const removeOrderedPart = async () => {
    toggleconfirmOpen({ ...confirmOpen, removeOrderedPart: false });
    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/repairs/removeOrderedPart`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          repairId: repairID,
          partId: orderedPartToDelete._id,
        }),
      });
      const json = await response.json();
      setShowLoad(false);
      if (json.res == 200) {
        setSnackBar({
          type: "success",
          title: "Success",
          message: "Ordered part removed",
          show: true,
          icon: "check",
        });
        getRepair();
      } else {
        setSnackBar({
          type: "error",
          title: "Error",
          message: json.message || "Error removing part",
          show: true,
          icon: "error",
        });
      }
    } catch (e) {
      setShowLoad(false);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error",
        show: true,
        icon: "error",
      });
    }
  };

  const receivePart = async (part) => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/receivePart`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        repairId: repairID,
        partId: part._id,
      }),
    });
    const json = await response.json();
    setShowLoad(false);
    if (json.res == 200) {
      setSnackBar({
        type: "success",
        title: "Part Received",
        message: "Part has been moved to repair parts list",
        show: true,
        icon: "check",
      });
      getRepair();
      if (repairDetails.status == 4) {
        createInvoice();
      }
    } else {
      setSnackBar({
        type: "error",
        title: "Error",
        message: json.message,
        show: true,
        icon: "error",
      });
    }
  };

  const updateChecklistAnswer = async (checklistType, questionId, value) => {
    try {
      const response = await fetch(`${vars.serverUrl}/checklist/updateAnswer`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repairId: id, checklistType, questionId, answer: value }),
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setrepairDetails((prev) => {
          const listKey =
            checklistType === "Pre-Repair"
              ? "preRepairChecklist"
              : checklistType === "In Progress"
              ? "inProgressChecklist"
              : "postRepairChecklist";

          const currentList = prev[listKey] || { answers: [] };
          const answers = currentList.answers || [];
          const existingIndex = answers.findIndex((a) => a.questionId === questionId);

          let newAnswers = [...answers];
          if (existingIndex >= 0) {
            newAnswers[existingIndex] = { ...newAnswers[existingIndex], answer: value };
          } else {
            newAnswers.push({ questionId, answer: value });
          }

          return {
            ...prev,
            [listKey]: {
              ...currentList,
              answers: newAnswers,
            },
          };
        });
        getRepair();
        setSnackBar({
          type: "success",
          title: "Success",
          message: "Answer saved successfully",
          show: true,
          icon: "check",
        });
      } else {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Error saving answer",
          show: true,
          icon: "warning",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const { showUploadFunc, addPhotoModal, setRepairId } = AddPhotos({
    getRepair,
  });

  useEffect(() => {
    setShowLoad(true);
    setrepairID(repairID);
    setRepairId(repairID);
    getRepair();
    getQuestions();
    createInvoice();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
      </DashboardLayout>
    );
  }

  const getApplicableQuestions = (type) => {
    if (!repairDetails || !questions) return [];
    const filtered = questions.filter((q) => {
      if (!q.isActive) return false;
      if (q.checklistType !== type) return false;

      // Filter by Device Type
      if (q.deviceType && q.deviceType !== "All" && q.deviceType !== "") {
        const deviceType = repairDetails.pev?.PevType || repairDetails.pev?.type;
        if (deviceType && q.deviceType !== deviceType) return false;
      }

      // Filter by Repair Type
      if (q.repairType && q.repairType !== "All" && q.repairType !== "") {
        if (repairDetails.RepairType && !repairDetails.RepairType.includes(q.repairType))
          return false;
      }
      return true;
    });
    return filtered
      .filter(
        (q, index, self) => index === self.findIndex((t) => t.question.text === q.question.text)
      )
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
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
              {/* Checklists */}
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
                      Checklists
                    </MDTypography>
                  </MDBox>
                  <MDBox mx={2} py={3} px={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="h6" gutterBottom>
                          Pre-Repair Checklist
                        </MDTypography>
                        {getApplicableQuestions("Pre-Repair").length > 0 ? (
                          getApplicableQuestions("Pre-Repair").map((q) => {
                            const answerObj = repairDetails.preRepairChecklist?.answers?.find(
                              (a) => a.questionId === q._id
                            );
                            return (
                              <ChecklistQuestion
                                key={q._id}
                                question={q}
                                answerObj={answerObj}
                                canEdit={repairDetails.status === 0 || repairDetails.status === 1}
                                onSave={(qId, val) => updateChecklistAnswer("Pre-Repair", qId, val)}
                              />
                            );
                          })
                        ) : (
                          <MDTypography variant="body2">No questions available.</MDTypography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={4} id="in-progress-checklist">
                        <MDTypography variant="h6" gutterBottom>
                          In Progress Checklist
                        </MDTypography>
                        {getApplicableQuestions("In Progress").length > 0 ? (
                          getApplicableQuestions("In Progress").map((q) => {
                            const answerObj =
                              repairDetails.inprogressRepairChecklist?.answers?.find(
                                (a) => a.questionId === q._id
                              );
                            return (
                              <ChecklistQuestion
                                key={q._id}
                                id={`question-${q._id}`}
                                question={q}
                                answerObj={answerObj}
                                canEdit={
                                  repairDetails.status === 2 ||
                                  repairDetails.status === 3 ||
                                  repairDetails.status === 11
                                }
                                onSave={(qId, val) =>
                                  updateChecklistAnswer("In Progress", qId, val)
                                }
                              />
                            );
                          })
                        ) : (
                          <MDTypography variant="body2">No questions available.</MDTypography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="h6" gutterBottom>
                          Post-Repair Checklist
                        </MDTypography>
                        {getApplicableQuestions("Post-Repair").length > 0 ? (
                          getApplicableQuestions("Post-Repair").map((q) => {
                            const answerObj = repairDetails.postRepairChecklist?.answers?.find(
                              (a) => a.questionId === q._id
                            );
                            return (
                              <ChecklistQuestion
                                key={q._id}
                                question={q}
                                answerObj={answerObj}
                                canEdit={
                                  repairDetails.status === 4 ||
                                  repairDetails.status === 5 ||
                                  repairDetails.status === 6
                                }
                                onSave={(qId, val) =>
                                  updateChecklistAnswer("Post-Repair", qId, val)
                                }
                              />
                            );
                          })
                        ) : (
                          <MDTypography variant="body2">No questions available.</MDTypography>
                        )}
                      </Grid>
                    </Grid>
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
                        <AddNotes repairId={repairDetails._id} size="full" callback={getRepair} />
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
              {/* Parts on Order */}
              {partsOrdered && partsOrdered.length > 0 && (
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
                        Parts on Order
                      </MDTypography>
                    </MDBox>
                    <MDBox mx={2} py={3} px={2}>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <MDTypography variant="h6">Part Details</MDTypography>
                        </Grid>
                        <Grid item xs={2}>
                          <MDTypography variant="h6">Qty</MDTypography>
                        </Grid>
                        <Grid item xs={6}>
                          <MDTypography variant="h6">Tracking</MDTypography>
                        </Grid>
                        <Grid item xs={12} mb={-2} mt={-2}>
                          <Divider fullWidth></Divider>
                        </Grid>
                        {partsOrdered.map((part, index) => (
                          <PartsOrderedItem
                            key={index}
                            part={part}
                            onReceive={receivePart}
                            onDelete={(p) => {
                              setOrderedPartToDelete(p);
                              toggleconfirmOpen({ ...confirmOpen, removeOrderedPart: true });
                            }}
                          />
                        ))}
                      </Grid>
                    </MDBox>
                  </Card>
                </Grid>
              )}
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
                            repairId={repairDetails._id}
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
                          <PartsItem
                            part={part}
                            key={part.name}
                            status={repairDetails.status}
                            onDelete={(p) => {
                              setPartid(p._id);
                              toggleconfirmOpen({ removePart: true });
                              setPartName(p.name);
                            }}
                          />
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
                      repair={repairDetails}
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
      {addPhotoModal}
      <ConfirmActionDialog
        title="Are you sure?"
        content="Do you wish to remove this item?"
        action={() => removeParts(partId, repairDetails.status)}
        openState={confirmOpen.removePart}
        closeState={() => toggleconfirmOpen({ removePart: false })}
      />
      <ConfirmActionDialog
        title="Are you sure?"
        content="Do you wish to remove this ordered part?"
        action={removeOrderedPart}
        openState={confirmOpen.removeOrderedPart}
        closeState={() => toggleconfirmOpen({ ...confirmOpen, removeOrderedPart: false })}
      />
      <Footer />
    </DashboardLayout>
  );
};

export default RepairDetails;
