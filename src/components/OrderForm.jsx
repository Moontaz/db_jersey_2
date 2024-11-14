// Import pustaka dan komponen yang diperlukan
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Komponen untuk tampilan kartu
import { Button } from "@/components/ui/button"; // Komponen untuk tombol
import { Input } from "@/components/ui/input"; // Komponen untuk input teks
import { Label } from "@/components/ui/label"; // Komponen untuk label
import { Alert, AlertDescription } from "@/components/ui/alert"; // Komponen untuk notifikasi atau alert
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Calendar,
} from "lucide-react"; // Ikon untuk indikasi visual (cek, alert, kalender, dll.)

// Komponen utama untuk sistem pemesanan
const OrderSystem = () => {
  // Mengelola state atau data dalam aplikasi menggunakan useState
  const [step, setStep] = useState(1); // Langkah saat ini dalam proses pemesanan (mulai dari langkah 1)
  const [orderDetails, setOrderDetails] = useState({
    customerName: "", // Nama pelanggan
    service: "", // Jenis layanan yang dipilih pelanggan
    quantity: "", // Jumlah unit layanan yang dipesan
    date: "", // Tanggal produksi pesanan
  });
  const [capacityStatus, setCapacityStatus] = useState(null); // Status kapasitas (accept, negotiate, reject)
  const [negotiationMessage, setNegotiationMessage] = useState(""); // Pesan negosiasi jika kapasitas tidak cukup
  const [startDate, setStartDate] = useState(""); // Tanggal mulai produksi
  const [jenisLayanan, setJenisLayanan] = useState([]); // Data layanan yang tersedia
  const [variabelData, setVariabelData] = useState({}); // Data kapasitas variabel

  // Mengambil data jenis layanan dan kapasitas dari server saat komponen pertama kali dimuat
  useEffect(() => {
    // Meminta data jenis layanan dari API
    fetch("/api/jenis_layanan")
      .then((res) => res.json()) // Mengubah respons menjadi JSON
      .then((data) => setJenisLayanan(data)); // Menyimpan data jenis layanan ke dalam state

    // Meminta data variabel kapasitas dari API
    fetch("/api/variabel")
      .then((res) => res.json()) // Mengubah respons menjadi JSON
      .then((data) => {
        const variabelMap = {}; // Membuat objek untuk menyimpan nilai kapasitas
        data.forEach((item) => {
          variabelMap[item.nama_variabel] = item.nilai_variabel; // Memasukkan setiap variabel dan nilainya
        });
        setVariabelData(variabelMap); // Menyimpan variabel kapasitas ke dalam state
      });
  }, []);

  // Fungsi untuk mengecek apakah semua data wajib telah diisi
  const isFormFilled = () => {
    return (
      orderDetails.customerName.trim() && // Memeriksa apakah nama pelanggan telah diisi
      orderDetails.service.trim() && // Memeriksa apakah layanan telah dipilih
      orderDetails.quantity.trim() && // Memeriksa apakah jumlah pesanan telah diisi
      (capacityStatus === "accept" || orderDetails.date.trim()) // Memastikan tanggal diisi jika kapasitas tidak langsung diterima
    );
  };

  // Fungsi untuk mengecek kapasitas berdasarkan jumlah pesanan
  const checkCapacity = async () => {
    const quantity = parseInt(orderDetails.quantity); // Mengubah jumlah pesanan menjadi angka
    const kapasitasNormalPerHari =
      variabelData["kapasitas_normal_per_hari"] || 100; // Batas kapasitas harian normal
    const kapasitasLemburPerJam =
      variabelData["kapasitas_lembur_per_jam"] || 11; // Kapasitas lembur per jam
    const maksLemburPerHari = variabelData["maks_lembur_per_hari"] || 4; // Batas maksimal lembur per hari
    const maksLemburPerMinggu = variabelData["maks_lembur_per_minggu"] || 18; // Batas maksimal lembur per minggu

    // Mengecek kapasitas pada tanggal yang dipilih
    const response = await fetch(`/api/jadwal?date=${orderDetails.date}`);
    const existingSchedules = await response.json(); // Mengubah jadwal menjadi JSON
    const totalOrdersToday = existingSchedules.reduce(
      (total, schedule) => total + schedule.jumlah_pesanan, // Menghitung jumlah pesanan pada tanggal ini
      0
    );

    // Mengambil tanggal hari ini
    const todayDateStr = new Date().toISOString().split("T")[0];
    if (totalOrdersToday + quantity <= kapasitasNormalPerHari) {
      setCapacityStatus("accept"); // Terima pesanan jika kapasitas harian cukup
      setStartDate(todayDateStr); // Set tanggal produksi menjadi hari ini
    } else {
      const remainingNormalCapacity = kapasitasNormalPerHari - totalOrdersToday; // Kapasitas sisa dalam sehari
      if (remainingNormalCapacity > 0) {
        const remainingQuantity = quantity - remainingNormalCapacity; // Hitung sisa kapasitas lembur
        const maxOvertimeCapacityToday =
          kapasitasLemburPerJam * maksLemburPerHari; // Kapasitas lembur maksimum hari ini

        if (remainingQuantity <= maxOvertimeCapacityToday) {
          setCapacityStatus("negotiate"); // Negosiasi jika kapasitas dapat dipenuhi lembur
          setNegotiationMessage(
            `Kapasitas harian penuh untuk ${remainingNormalCapacity} unit. Sisanya ${remainingQuantity} unit akan diproses lembur pada tanggal ${todayDateStr}.`
          );
          setStartDate(todayDateStr); // Set tanggal mulai produksi hari ini
        } else {
          let nextDate = new Date(orderDetails.date); // Tanggal untuk mengecek hari berikutnya
          let additionalDaysNeeded = 1; // Hari tambahan yang diperlukan
          let totalProcessedQuantity = remainingNormalCapacity; // Total pesanan yang bisa diproses
          let isOrderFeasible = false;

          // Tambahkan validasi di dalam loop
          while (
            totalProcessedQuantity < quantity &&
            additionalDaysNeeded <= maksLemburPerMinggu
          ) {
            // Tambahkan hari berikutnya ke tanggal
            nextDate.setDate(nextDate.getDate() + 1);

            // Periksa apakah nextDate valid
            if (isNaN(nextDate)) {
              console.error("Invalid date encountered in the loop.");
              break; // Hentikan loop jika tanggal tidak valid
            }

            // Konversi nextDate ke format string jika valid
            const nextDateStr = nextDate.toISOString().split("T")[0];

            // Lakukan permintaan ke API
            const nextDayResponse = await fetch(
              `/api/jadwal?date=${nextDateStr}`
            );
            const nextDaySchedules = await nextDayResponse.json();
            const totalOrdersNextDay = nextDaySchedules.reduce(
              (total, schedule) => total + schedule.jumlah_pesanan,
              0
            );

            // Logika tambahan untuk memeriksa kapasitas
            if (totalOrdersNextDay < kapasitasNormalPerHari) {
              const availableCapacity =
                kapasitasNormalPerHari - totalOrdersNextDay;
              const remainingForNextDay = quantity - totalProcessedQuantity;

              if (remainingForNextDay <= availableCapacity) {
                isOrderFeasible = true;
                setNegotiationMessage(
                  `Pesanan melebihi kapasitas harian. Sebagian pesanan akan dikerjakan pada tanggal ${nextDateStr}`
                );
                setStartDate(nextDateStr); // Set tanggal baru
                break;
              } else {
                totalProcessedQuantity += availableCapacity;
              }
            }
            additionalDaysNeeded++;
          }

          if (isOrderFeasible) {
            setCapacityStatus("negotiate"); // Jika memungkinkan, beri opsi negosiasi
          } else {
            setCapacityStatus("reject"); // Tolak pesanan jika kapasitas tidak cukup
            setNegotiationMessage(
              `Kapasitas penuh untuk beberapa hari ke depan. Pesanan ditolak.`
            );
          }
        }
      } else {
        setCapacityStatus("negotiate"); // Jika kapasitas penuh, tawarkan negosiasi
        setNegotiationMessage(
          `Kapasitas harian penuh. Apakah Anda bersedia menunggu untuk dijadwalkan pada hari lain?`
        );
        setStartDate(todayDateStr); // Set tanggal mulai produksi hari ini
      }
    }
  };

  // Fungsi untuk menyimpan dan mengonfirmasi pesanan pengguna
  const handleConfirmOrder = async () => {
    const pesananResponse = await fetch("/api/pesanan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama_pelanggan: orderDetails.customerName, // Kirim nama pelanggan
        id_layanan: parseInt(orderDetails.service), // Kirim id layanan
        jumlah_pesanan: parseInt(orderDetails.quantity), // Kirim jumlah pesanan
        tanggal_masuk: startDate, // Kirim tanggal mulai produksi
      }),
    });
    const pesananData = await pesananResponse.json();

    // Memecah jadwal pesanan berdasarkan kapasitas harian
    let remainingQuantity = parseInt(orderDetails.quantity);
    let currentDate = new Date(startDate);

    while (remainingQuantity > 0) {
      const currentDateStr = currentDate.toISOString().split("T")[0];
      const dayScheduleResponse = await fetch(
        `/api/jadwal?date=${currentDateStr}`
      );
      const daySchedules = await dayScheduleResponse.json();
      const totalOrders = daySchedules.reduce(
        (total, schedule) => total + schedule.jumlah_pesanan,
        0
      );

      let dailyCapacity = kapasitasNormalPerHari - totalOrders;
      if (dailyCapacity <= 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      let quantityForToday = Math.min(remainingQuantity, dailyCapacity);
      await fetch("/api/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pesanan: pesananData.id_pesanan,
          jumlah_pesanan: quantityForToday,
          starting_at: currentDateStr,
        }),
      });

      remainingQuantity -= quantityForToday;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setStep(4); // Pindah ke langkah konfirmasi akhir
  };

  // Render setiap tahap proses pemesanan dengan fungsi render terpisah
  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Permintaan Pelanggan</h2>
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
        <Label>Jenis Layanan</Label>
        <select
          className="w-full p-2 border rounded"
          value={orderDetails.service}
          onChange={(e) =>
            setOrderDetails({ ...orderDetails, service: e.target.value })
          }
        >
          <option value="">Pilih layanan</option>
          {jenisLayanan.map((layanan) => (
            <option key={layanan.id_layanan} value={layanan.id_layanan}>
              {layanan.tipe_layanan}-{layanan.nama_layanan}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Jumlah</Label>
        <Input
          type="number"
          value={orderDetails.quantity}
          onChange={(e) =>
            setOrderDetails({ ...orderDetails, quantity: e.target.value })
          }
          placeholder="Masukkan jumlah"
        />
      </div>
      <Button
        className="w-full"
        onClick={() => {
          checkCapacity();
          setStep(2);
        }}
        // disabled={!isFormFilled()}
      >
        Cek Kapasitas <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Evaluasi Kapasitas</h2>
      {capacityStatus === "accept" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Kapasitas tersedia. Pesanan dapat diterima dan akan dikerjakan hari
            ini ({startDate}).
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
        <Button variant="outline" onClick={() => setStep(1)}>
          Kembali
        </Button>
        {capacityStatus === "accept" || capacityStatus === "negotiate" ? (
          <Button onClick={() => setStep(3)}>Lanjut Input Pesanan</Button>
        ) : null}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Input Detail Pesanan</h2>
      {capacityStatus === "negotiate" && (
        <div className="space-y-2">
          <Label>Tanggal Produksi</Label>
          <Input
            type="date"
            value={orderDetails.date}
            onChange={(e) =>
              setOrderDetails({ ...orderDetails, date: e.target.value })
            }
          />
        </div>
      )}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Detail Pesanan:</h3>
        <p>Pelanggan: {orderDetails.customerName}</p>
        <p>
          Layanan:{" "}
          {
            jenisLayanan.find(
              (l) => l.id_layanan === parseInt(orderDetails.service)
            )?.nama_layanan
          }
        </p>
        <p>Jumlah: {orderDetails.quantity}</p>
        <p>Tanggal Mulai Produksi: {startDate}</p>
      </div>
      <Button className="w-full" onClick={handleConfirmOrder}>
        Konfirmasi Pesanan <CheckCircle2 className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
      <h2 className="text-lg font-semibold">Pesanan Terkonfirmasi!</h2>
      <p>Pesanan telah dijadwalkan untuk produksi pada:</p>
      <p className="font-medium">{startDate}</p>
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setStep(1);
            setOrderDetails({
              customerName: "",
              service: "",
              quantity: "",
              date: "",
            });
            setCapacityStatus(null);
            setNegotiationMessage("");
            setStartDate("");
          }}
        >
          Pesanan Baru
        </Button>
        <Button>
          Lihat Jadwal <Calendar className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sistem Pengecekan & Input Pesanan</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex flex-col items-center w-1/4 ${
                step >= stepNumber ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 ${
                  step >= stepNumber
                    ? "bg-blue-100 border-2 border-blue-600"
                    : "bg-gray-100 border-2 border-gray-400"
                }`}
              >
                {stepNumber}
              </div>
              <div className="text-xs text-center">
                {stepNumber === 1 && "Permintaan"}
                {stepNumber === 2 && "Evaluasi"}
                {stepNumber === 3 && "Input"}
                {stepNumber === 4 && "Konfirmasi"}
              </div>
            </div>
          ))}
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </CardContent>
    </Card>
  );
};

export default OrderSystem;
