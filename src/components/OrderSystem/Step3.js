// Step3.js
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Step3 = ({ orderDetails, setOrderDetails, onConfirm, onBack }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold">Data Pelanggan</h2>
    <div className="space-y-2">
      <Label>Nama Pelanggan</Label>
      <Input
        value={orderDetails.customerName}
        onChange={(e) =>
          setOrderDetails({ ...orderDetails, customerName: e.target.value })
        }
        placeholder="Masukkan nama pelanggan"
      />
    </div>
    <div className="space-y-2">
      <Label>Nomor HP</Label>
      <Input
        type="tel"
        value={orderDetails.phoneNumber}
        onChange={(e) =>
          setOrderDetails({ ...orderDetails, phoneNumber: e.target.value })
        }
        placeholder="Masukkan nomor HP"
      />
    </div>
    <div className="space-y-2">
      <Label>Keterangan (Opsional)</Label>
      <Input
        value={orderDetails.note}
        onChange={(e) =>
          setOrderDetails({ ...orderDetails, note: e.target.value })
        }
        placeholder="Tambahkan keterangan (opsional)"
      />
    </div>
    <div className="flex gap-2">
      <Button variant="outline" onClick={onBack}>
        Kembali
      </Button>
      <Button onClick={onConfirm}>Konfirmasi Pesanan</Button>
    </div>
  </div>
);

export default Step3;
