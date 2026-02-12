import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import vars from "../../../config";
import { globalFuncs } from "../../../context/global";

const ChecklistModal = ({ open, onClose, repair, checklistType, getRepair, onSave }) => {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (open && repair) {
      fetchData();
    }
  }, [open, repair]);

  const fetchData = async () => {
    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/checklist/questions`, {
        credentials: "include",
      });
      const res = await response.json();

      if (res.res === 200) {
        // Filter questions based on repair details
        const filteredQuestions = res.data.filter((q) => {
          if (!q.isActive) return false;
          if (q.checklistType !== checklistType) return false;

          // Filter by Device Type if specified
          if (q.deviceType && q.deviceType !== "All" && q.deviceType !== "") {
            const deviceType = repair.pev?.PevType || repair.pev?.type;
            if (deviceType && q.deviceType !== deviceType) return false;
          }

          // Filter by Repair Type if specified
          if (q.repairType && q.repairType !== "All" && q.repairType !== "") {
            if (repair.RepairType && !repair.RepairType.includes(q.repairType)) return false;
          }

          return true;
        });
        const uniqueQuestions = filteredQuestions
          .filter(
            (q, index, self) => index === self.findIndex((t) => t.question.text === q.question.text)
          )
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
        if (uniqueQuestions.length === 0) {
          if (onSave) await onSave();
          onClose();
          setShowLoad(false);
          return;
        }
        setQuestions(uniqueQuestions);

        // Pre-fill answers if they exist on the repair object
        const currentAnswers = {};
        const answerSource =
          checklistType === "Pre-Repair"
            ? repair.preRepairChecklist
            : checklistType === "Post-Repair"
            ? repair.postRepairChecklist
            : null;

        if (answerSource && answerSource.answers) {
          answerSource.answers.forEach((ans) => {
            currentAnswers[ans.questionId] = ans.answer;
          });
        } else if (repair.checklistAnswers) {
          // Fallback for old structure
          repair.checklistAnswers.forEach((ans) => {
            if (ans.checklistType === checklistType) {
              currentAnswers[ans.questionId] = ans.answer;
            }
          });
        }
        setAnswers(currentAnswers);
      }
    } catch (error) {
      console.error(error);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Failed to load checklist",
        show: true,
        icon: "warning",
      });
    }
    setShowLoad(false);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    // Validate required questions
    for (const q of questions) {
      if (q.question.required && (answers[q._id] === undefined || answers[q._id] === "")) {
        setSnackBar({
          type: "error",
          title: "Validation Error",
          message: `Please answer: ${q.question.text}`,
          show: true,
          icon: "warning",
        });
        return;
      }
    }

    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/checklist/saveAnswers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repairId: repair._id,
          checklistType,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
            checklistType,
          })),
        }),
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setSnackBar({
          type: "success",
          title: "Success",
          message: "Checklist saved successfully",
          show: true,
          icon: "check",
        });
        if (getRepair) getRepair();
        if (onSave) onSave();
        onClose();
      } else {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Failed to save checklist",
          show: true,
          icon: "warning",
        });
      }
    } catch (error) {
      console.error(error);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error",
        show: true,
        icon: "warning",
      });
    }
    setShowLoad(false);
  };

  const renderInput = (q) => {
    const value = answers[q._id] !== undefined ? answers[q._id] : "";
    const label = q.question.text;

    switch (q.answerType) {
      case "text":
        return (
          <TextField
            fullWidth
            required={q.question.required}
            label={label}
            value={value}
            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
            multiline
            rows={2}
          />
        );
      case "select":
        return (
          <FormControl fullWidth required={q.question.required}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={value}
              label={label}
              onChange={(e) => handleAnswerChange(q._id, e.target.value)}
              sx={{ height: "44px" }}
            >
              {q.selectOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "checkbox":
        return (
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value === true}
                  onChange={(e) => handleAnswerChange(q._id, e.target.checked)}
                />
              }
              label={
                <span>
                  {label}
                  {q.question.required && <span style={{ color: "red" }}> *</span>}
                </span>
              }
            />
          </FormGroup>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{checklistType} Checklist</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} pt={1}>
          {questions.length > 0 ? (
            questions.map((q) => (
              <Grid item xs={12} key={q._id}>
                {renderInput(q)}
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <MDTypography variant="body2">
                No checklist questions found for this repair.
              </MDTypography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="secondary">
          Cancel
        </MDButton>
        <MDButton onClick={handleSubmit} color="success">
          Save
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default ChecklistModal;
