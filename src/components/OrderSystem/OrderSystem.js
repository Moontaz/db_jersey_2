import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProgressIndicator from "./ProgressIndicator";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";

const OrderSystem = () => {
  const [step, setStep] = useState(1);
  const [orderDetails, setOrderDetails] = useState({
    customerName: "",
    phoneNumber: "",
    service: "",
    serviceName: "",
    quantity: "",
    date: "",
    note: "",
  });
  const [capacityStatus, setCapacityStatus] = useState(null);
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [jenisLayanan, setJenisLayanan] = useState([]);
  const [variabelData, setVariabelData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Fetch service types
    fetch("/api/jenis_layanan")
      .then((res) => res.json())
      .then((data) => setJenisLayanan(data))
      .catch((error) => console.error("Failed to fetch layanan:", error));

    // Fetch variables for capacity calculation
    fetch("/api/variabel")
      .then((res) => res.json())
      .then((data) => {
        const variabelMap = {};
        data.forEach((item) => {
          variabelMap[item.nama_variabel] = item.nilai_variabel;
        });
        setVariabelData(variabelMap);
      })
      .catch((error) => console.error("Failed to fetch variabel:", error));
  }, []);

  const handleCheckCapacity = async () => {
    if (!orderDetails.date || isNaN(new Date(orderDetails.date).getTime())) {
      setErrorMessage("Tanggal tidak valid. Pastikan dalam format YYYY-MM-DD.");
      return;
    }

    try {
      // Call the capacity check API route
      const response = await fetch("/api/capacityCheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderDetails, variabelData }),
      });

      const result = await response.json();

      if (response.ok) {
        setCapacityStatus(result.status);
        setNegotiationMessage(result.message);
        setStartDate(result.startDate);
        setLastDate(result.lastDate);
        setErrorMessage("");
        setStep(2); // Move to the next step
      } else {
        setErrorMessage(result.message || "Error checking capacity.");
      }
    } catch (error) {
      console.error("Error in handleCheckCapacity:", error);
      setErrorMessage("Failed to check capacity.");
    }
  };

  const handleConfirm = async () => {
    // Validasi nama pelanggan dan nomor HP sebelum mengirim ke database
    if (!orderDetails.customerName || !orderDetails.phoneNumber) {
      setErrorMessage("name and phone number must be filled.");
      return;
    }

    try {
      const response = await fetch("/api/confirmOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderDetails,
          startDate,
          capacityResult: {
            lastDate,
            is_overtime: capacityStatus === "negotiate" ? true : false,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStep(4);
        setErrorMessage("");
      } else {
        setErrorMessage(result.error || "Error confirming order.");
      }
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      setErrorMessage("Failed to confirm order.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sistem Pengecekan & Input Pesanan</CardTitle>
      </CardHeader>
      <CardContent>
        <ProgressIndicator step={step} />

        {errorMessage && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            Error: {errorMessage}
          </div>
        )}

        {step === 1 && (
          <Step1
            orderDetails={orderDetails}
            setOrderDetails={setOrderDetails}
            jenisLayanan={jenisLayanan}
            onNext={handleCheckCapacity}
          />
        )}
        {step === 2 && (
          <Step2
            capacityStatus={capacityStatus}
            negotiationMessage={negotiationMessage}
            lastDate={lastDate}
            onBack={() => setStep(1)}
            onNext={() => {
              if (
                capacityStatus === "accept" ||
                capacityStatus === "negotiate"
              ) {
                setStep(3);
              } else {
                setErrorMessage("Pesanan ditolak karena kapasitas penuh.");
              }
            }}
          />
        )}
        {step === 3 && (
          <Step3
            orderDetails={orderDetails}
            setOrderDetails={setOrderDetails}
            onConfirm={handleConfirm}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <Step4
            errorMessage={errorMessage}
            onNewOrder={() => {
              setStep(1);
              setOrderDetails({
                customerName: "",
                phoneNumber: "",
                service: "",
                serviceName: "",
                quantity: "",
                date: "",
                note: "",
              });
              setCapacityStatus(null);
              setNegotiationMessage("");
              setStartDate("");
              setLastDate("");
              setErrorMessage("");
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSystem;
