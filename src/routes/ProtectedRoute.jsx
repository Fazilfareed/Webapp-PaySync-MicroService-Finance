// Example logic inside ProtectedRoute.jsx
if (user.role === 'moderate_admin') return <Navigate to="/admin/dashboard" />;
if (user.role === 'agent') return <Navigate to="/agent/dashboard" />;
// and so on...
