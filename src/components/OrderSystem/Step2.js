// Step2.js
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

const Step2 = ({
  capacityStatus,
  negotiationMessage,
  lastDate,
  onBack,
  onNext,
}) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold">Evaluasi Kapasitas</h2>
    {capacityStatus === "accept" && (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          {negotiationMessage}
        </AlertDescription>
      </Alert>
    )}
    {capacityStatus === "negotiate" && (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-700">
          {negotiationMessage}
        </AlertDescription>
      </Alert>
    )}
    {capacityStatus === "reject" && (
      <Alert className="bg-red-50 border-red-200">
        <XCircle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-700">
          {negotiationMessage}
        </AlertDescription>
      </Alert>
    )}
    <div className="flex gap-2">
      <Button variant="outline" onClick={onBack}>
        Kembali
      </Button>
      {(capacityStatus === "accept" || capacityStatus === "negotiate") && (
        <Button onClick={onNext}>Lanjut</Button>
      )}
    </div>
  </div>
);

export default Step2;
