export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen w-screen justify-center bg-black">
      <div className="w-3/4 p-4">{children}</div>
    </div>
  );
}
