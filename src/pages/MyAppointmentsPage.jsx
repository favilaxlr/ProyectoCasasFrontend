import UserAppointments from '../components/UserAppointments';

function MyAppointmentsPage() {
    return (
        <div className="page-container max-w-4xl mx-auto p-6">
            <div className="animate-slide-in-left mb-8">
                <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-2">My Appointments</h1>
                <p className="text-gray-600">Manage your scheduled visits</p>
            </div>
            <div className="animate-slide-up">
                <UserAppointments />
            </div>
        </div>
    );
}

export default MyAppointmentsPage;