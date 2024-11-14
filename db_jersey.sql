-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3310
-- Generation Time: Nov 14, 2024 at 03:51 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_jersey`
--

-- --------------------------------------------------------

--
-- Table structure for table `jadwal`
--

CREATE TABLE `jadwal` (
  `id_jadwal` int UNSIGNED NOT NULL,
  `id_pesanan` int UNSIGNED NOT NULL,
  `jumlah_pesanan` int UNSIGNED NOT NULL,
  `is_overtime` tinyint(1) NOT NULL DEFAULT '0',
  `starting_at` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jadwal`
--

INSERT INTO `jadwal` (`id_jadwal`, `id_pesanan`, `jumlah_pesanan`, `is_overtime`, `starting_at`, `created_at`) VALUES
(1, 1, 20, 0, '2024-11-13', '2024-10-25 15:56:28'),
(51, 23, 80, 0, '2024-11-13', '2024-11-14 07:29:01'),
(52, 23, 100, 0, '2024-11-14', '2024-11-14 07:29:01'),
(53, 23, 40, 0, '2024-11-15', '2024-11-14 07:29:01'),
(54, 24, 12, 1, '2024-11-13', '2024-11-14 07:29:33'),
(59, 26, 0, 0, '2024-11-13', '2024-11-14 07:55:27'),
(60, 26, 0, 0, '2024-11-14', '2024-11-14 07:55:27'),
(61, 26, 60, 0, '2024-11-15', '2024-11-14 07:55:27'),
(62, 26, 100, 0, '2024-11-16', '2024-11-14 07:55:27'),
(63, 26, 40, 0, '2024-11-17', '2024-11-14 07:55:27');

-- --------------------------------------------------------

--
-- Table structure for table `jenis_layanan`
--

CREATE TABLE `jenis_layanan` (
  `id_layanan` int UNSIGNED NOT NULL,
  `tipe_layanan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_layanan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estimasi_waktu` int UNSIGNED NOT NULL,
  `harga` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jenis_layanan`
--

INSERT INTO `jenis_layanan` (`id_layanan`, `tipe_layanan`, `nama_layanan`, `estimasi_waktu`, `harga`) VALUES
(1, 'jersey', 'reguler', 5, 100000),
(2, 'jaket', 'reguler', 3, 200000),
(5, 'Jersey', 'Express', 1, 200000);

-- --------------------------------------------------------

--
-- Table structure for table `pesanan`
--

CREATE TABLE `pesanan` (
  `id_pesanan` int UNSIGNED NOT NULL,
  `nama_pelanggan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `no_hp` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_layanan` int UNSIGNED NOT NULL,
  `keterangan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `jumlah_pesanan` int UNSIGNED NOT NULL,
  `tanggal_masuk` date DEFAULT NULL,
  `status_pesanan` enum('pending','in_progress','completed','canceled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pesanan`
--

INSERT INTO `pesanan` (`id_pesanan`, `nama_pelanggan`, `no_hp`, `id_layanan`, `keterangan`, `jumlah_pesanan`, `tanggal_masuk`, `status_pesanan`, `created_at`, `updated_at`) VALUES
(1, 'Andi', '08123456789', 1, 'petani', 20, '2024-11-15', 'in_progress', '2024-10-25 15:54:41', '2024-10-25 15:54:41'),
(23, 'aerf', '082174842004', 1, '12e', 220, '2024-11-13', 'pending', '2024-11-14 07:29:01', '2024-11-14 07:29:01'),
(24, 'asdsda', '082174842004', 5, 'qwe', 12, '2024-11-13', 'pending', '2024-11-14 07:29:33', '2024-11-14 07:29:33'),
(26, 'tes23', '082174842004', 1, 'we', 200, '2024-11-13', 'pending', '2024-11-14 07:55:27', '2024-11-14 07:55:27');

-- --------------------------------------------------------

--
-- Table structure for table `variabel`
--

CREATE TABLE `variabel` (
  `id_variabel` int UNSIGNED NOT NULL,
  `nama_variabel` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nilai_variabel` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `variabel`
--

INSERT INTO `variabel` (`id_variabel`, `nama_variabel`, `nilai_variabel`) VALUES
(3, 'min_order', 10),
(5, 'biaya_overtime', 50000),
(6, 'gaji_overtime_per_jam', 100000),
(7, 'maks_overtime_per_minggu', 15),
(8, 'kapasitas_normal_per_hari', 100),
(9, 'kapasitas_lembur_per_jam', 11),
(10, 'maks_lembur_per_hari', 4),
(11, 'maks_lembur_per_minggu', 18);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('d50471a5-0971-48ab-86f9-fcb8004439ca', '64c6b9f708f13db423f420d37e3c06052a59f35463665e4f618e625dafcd2da1', '2024-10-25 15:18:27.786', '20241025151827_db_jersey', NULL, NULL, '2024-10-25 15:18:27.699', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `jadwal`
--
ALTER TABLE `jadwal`
  ADD PRIMARY KEY (`id_jadwal`),
  ADD KEY `fk_pesanan` (`id_pesanan`);

--
-- Indexes for table `jenis_layanan`
--
ALTER TABLE `jenis_layanan`
  ADD PRIMARY KEY (`id_layanan`);

--
-- Indexes for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD PRIMARY KEY (`id_pesanan`),
  ADD KEY `fk_layanan` (`id_layanan`);

--
-- Indexes for table `variabel`
--
ALTER TABLE `variabel`
  ADD PRIMARY KEY (`id_variabel`),
  ADD UNIQUE KEY `nama_variabel` (`nama_variabel`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `jadwal`
--
ALTER TABLE `jadwal`
  MODIFY `id_jadwal` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `jenis_layanan`
--
ALTER TABLE `jenis_layanan`
  MODIFY `id_layanan` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pesanan`
--
ALTER TABLE `pesanan`
  MODIFY `id_pesanan` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `variabel`
--
ALTER TABLE `variabel`
  MODIFY `id_variabel` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `jadwal`
--
ALTER TABLE `jadwal`
  ADD CONSTRAINT `fk_pesanan` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan` (`id_pesanan`) ON DELETE CASCADE;

--
-- Constraints for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD CONSTRAINT `fk_layanan` FOREIGN KEY (`id_layanan`) REFERENCES `jenis_layanan` (`id_layanan`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
