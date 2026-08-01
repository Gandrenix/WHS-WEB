export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-bg-dark-primary flex items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-sm font-medium">Cargando panel de administración...</p>
      </div>
    </div>
  );
}
