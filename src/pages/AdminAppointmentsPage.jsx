import AdminAppointments from '../components/AdminAppointments';

function AdminAppointmentsPage() {
  return (
    <div className="page-container max-w-7xl mx-auto p-6">
      <div className="animate-slide-in-left mb-8">
        <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-2">Gestión de Citas</h1>
        <p className="text-gray-600">Administra todas las citas de propiedades</p>
      </div>
      <div className="animate-slide-up">
        <AdminAppointments />
      </div>
    </div>
  );
}

export default AdminAppointmentsPage;