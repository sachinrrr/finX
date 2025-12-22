export default function DashboardLayout({ children }) {
  return (
    <div className='px-5 py-8'>
      <h1 className='text-4xl font-bold gradient-title mb-8'>Dashboard</h1>
      <div className="gradient-card rounded-xl p-6 gradient-shadow">
        {children}
      </div>
    </div>
  );
}
