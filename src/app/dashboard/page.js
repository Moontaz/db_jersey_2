"use client";
import OrderSystem from "@/components/OrderSystem/OrderSystem";
import React from "react";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-white">
        Admin Dashboard
      </h1>
      <OrderSystem />
    </div>
  );
};

export default Dashboard;
