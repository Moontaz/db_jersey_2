// Step4.js
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

const Step4 = ({ errorMessage, onNewOrder }) => (
  <div className="space-y-4 text-center">
    {errorMessage ? (
      <>
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold">Pesanan Gagal!</h2>
        <p className="text-red-700">{errorMessage}</p>
      </>
    ) : (
      <>
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="text-lg font-semibold">Pesanan Terkonfirmasi!</h2>
        <p>Pesanan telah berhasil dimasukkan ke database.</p>
      </>
    )}
    <Button variant="outline" onClick={onNewOrder}>
      Pesanan Baru
    </Button>
  </div>
);

export default Step4;
