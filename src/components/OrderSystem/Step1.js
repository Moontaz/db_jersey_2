import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

const Step1 = ({
  orderDetails,
  setOrderDetails,
  jenisLayanan = [],
  onNext,
}) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold">Permintaan Pelanggan</h2>
    <div className="space-y-2">
      <Label>Jenis Layanan</Label>
      <select
        className="w-full p-2 border rounded"
        value={orderDetails.service || ""}
        onChange={(e) => {
          const selectedServiceId = e.target.value;
          const selectedService = jenisLayanan.find(
            (layanan) => layanan.id_layanan === parseInt(selectedServiceId)
          );

          // Set both serviceId and serviceName in orderDetails
          setOrderDetails({
            ...orderDetails,
            service: selectedServiceId,
            serviceName: selectedService ? selectedService.nama_layanan : "",
          });
        }}
      >
        <option value="">Pilih layanan</option>
        {jenisLayanan.map((layanan) => (
          <option key={layanan.id_layanan} value={layanan.id_layanan}>
            {layanan.tipe_layanan} - {layanan.nama_layanan}
          </option>
        ))}
      </select>
    </div>
    <div className="space-y-2">
      <Label>Jumlah</Label>
      <Input
        type="number"
        value={orderDetails.quantity || ""}
        onChange={(e) =>
          setOrderDetails({
            ...orderDetails,
            quantity: parseInt(e.target.value) || 0,
          })
        }
        placeholder="Masukkan jumlah"
      />
    </div>
    <div className="space-y-2">
      <Label>Tanggal Produksi</Label>
      <Input
        type="date"
        value={orderDetails.date || ""}
        onChange={(e) =>
          setOrderDetails({ ...orderDetails, date: e.target.value })
        }
      />
    </div>
    <Button className="w-full" onClick={onNext}>
      Cek Kapasitas <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
);

export default Step1;
