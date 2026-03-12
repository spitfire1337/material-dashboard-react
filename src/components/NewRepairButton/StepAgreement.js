import React, { useState, useEffect, useRef } from "react";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useSocket } from "context/socket";
import parse from "html-react-parser";

function StepAgreement({ repairID, nextRepairStep, updateRepairData, repairData }) {
  const socket = useSocket();
  const [content, setContent] = useState("<p>Loading Agreement...</p>");
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    if (socket && repairID) {
      socket.emit("getRepairAgreement", { id: repairID, ...repairData }, (res) => {
        if (res && res.data) {
          setContent(res.data);
        }
      });
    }
  }, [socket, repairID, repairData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      contextRef.current = ctx;
    }
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getPos(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
    e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    if (!hasSigned) setHasSigned(true);
    e.preventDefault();
  };

  const endDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleNext = () => {
    if (!hasSigned) return;

    const signature = canvasRef.current.toDataURL();
    const finalData = {
      ...repairData,
      id: repairID,
      customerSignature: signature,
      status: 1,
    };

    if (socket) {
      socket.emit("updateRepair", finalData);
    }
    if (updateRepairData) {
      updateRepairData({ customerSignature: signature });
    }
    nextRepairStep(5);
  };

  return (
    <MDBox p={2}>
      <MDBox mb={2} height="300px" sx={{ overflowY: "auto", border: "1px solid #e0e0e0", p: 2 }}>
        {parse(content)}
      </MDBox>
      <MDTypography variant="h6" gutterBottom>
        Customer Signature *
      </MDTypography>
      <MDBox sx={{ border: "1px solid #000", touchAction: "none" }} width="100%" height="150px">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </MDBox>
      <MDBox display="flex" justifyContent="space-between" mt={2}>
        <MDButton variant="outlined" color="secondary" onClick={clearSignature}>
          Clear
        </MDButton>
        <MDBox>
          <MDButton
            variant="gradient"
            color="light"
            onClick={() => nextRepairStep(3)}
            sx={{ mr: 1 }}
          >
            Back
          </MDButton>
          <MDButton variant="gradient" color="info" onClick={handleNext} disabled={!hasSigned}>
            Next
          </MDButton>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

export default StepAgreement;
