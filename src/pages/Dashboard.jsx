import React from 'react';
import { useSelector } from 'react-redux';
import { Users, UserCheck, UserMinus, ShieldAlert, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import './Pages.css';

const Dashboard = () => {
  const usersList = useSelector((state) => state.users.list);

  // Dynamic calculations from redux store
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => u.status === 'active').length;
  const inactiveUsers = usersList.filter(u => u.status === 'inactive').length;
  const adminUsers = usersList.filter(u => u.role === 'admin').length;

  // Percentage active
  const activePct = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  // Visual Mock Data for Analytics chart
  const weeklyData = [
    { day: 'Mon', count: 12, height: '40%' },
    { day: 'Tue', count: 19, height: '60%' },
    { day: 'Wed', count: 15, height: '50%' },
    { day: 'Thu', count: 28, height: '90%' },
    { day: 'Fri', count: 22, height: '75%' },
    { day: 'Sat', count: 8, height: '28%' },
    { day: 'Sun', count: 14, height: '45%' },
  ];

  // Activities logs list
  const recentActivities = [
    { id: 1, user: 'Olivia Martinez', action: 'updated user status to Active', time: '10 minutes ago' },
    { id: 2, user: 'System Watchdog', action: 'performed automated configuration database cleanup', time: '1 hour ago' },
    { id: 3, user: 'James Chen', action: 'updated profile email configurations', time: '3 hours ago' },
    { id: 4, user: 'Elena Rostova', action: 'created new user profile: Sophia Kovalski', time: '5 hours ago' },
  ];

  return (
    <div>
      {/* KPI Cards Grid */}
      {/* KPI Cards Grid */}
      <div className="row dashboard-grid g-3" style={{ marginBottom: '2rem' }}>
        <div className="col-6 col-md-3">
          <div className="card kpi-card total-users h-100">
            <div className="kpi-header">
              <div className="kpi-icon-wrapper" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', boxShadow: '0 0 12px var(--primary-glow)' }}>
                <Users size={22} />
              </div>
              <div className="kpi-trend positive">
                <ArrowUpRight size={14} />
                <span>+12% wk</span>
              </div>
            </div>
            <div className="kpi-details">
              <h3>Total Users</h3>
              <div className="kpi-value-row">
                <span className="kpi-value">{totalUsers}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Registered</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card kpi-card active-users h-100">
            <div className="kpi-header">
              <div className="kpi-icon-wrapper" style={{ color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.15)', boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)' }}>
                <UserCheck size={22} />
              </div>
              <div className="kpi-trend positive">
                <ArrowUpRight size={14} />
                <span>{activePct}% ratio</span>
              </div>
            </div>
            <div className="kpi-details">
              <h3>Active Accounts</h3>
              <div className="kpi-value-row">
                <span className="kpi-value">{activeUsers}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card kpi-card inactive-users h-100">
            <div className="kpi-header">
              <div className="kpi-icon-wrapper" style={{ color: 'var(--warning)', backgroundColor: 'rgba(245, 158, 11, 0.15)', boxShadow: '0 0 12px rgba(245, 158, 11, 0.15)' }}>
                <UserMinus size={22} />
              </div>
              <div className="kpi-trend negative" style={{ color: 'var(--text-muted)' }}>
                <ArrowDownRight size={14} />
                <span>Stable</span>
              </div>
            </div>
            <div className="kpi-details">
              <h3>Inactive Accounts</h3>
              <div className="kpi-value-row">
                <span className="kpi-value">{inactiveUsers}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Off</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card kpi-card admin-users h-100">
            <div className="kpi-header">
              <div className="kpi-icon-wrapper" style={{ color: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.15)', boxShadow: '0 0 12px rgba(139, 92, 246, 0.15)' }}>
                <ShieldAlert size={22} />
              </div>
              <div className="kpi-trend positive" style={{ color: '#8b5cf6' }}>
                <ArrowUpRight size={14} />
                <span>Secure</span>
              </div>
            </div>
            <div className="kpi-details">
              <h3>System Admins</h3>
              <div className="kpi-value-row">
                <span className="kpi-value">{adminUsers}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Managers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section Grid */}
      <div className="analytics-grid">
        {/* Weekly Registrations Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>User Sign-ups Activity</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly trend showing database creation</p>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>Active Period</span>
          </div>

          <div className="chart-container">
            {weeklyData.map((item, index) => (
              <div key={index} className="chart-bar-wrapper">
                <div 
                  className="chart-bar" 
                  style={{ height: item.height }}
                >
                  <span className="chart-tooltip">{item.count} signups</span>
                </div>
                <span className="chart-label">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Stream */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Operations</h2>
          <div className="activity-list">
            {recentActivities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-info">
                  <div className="activity-desc">
                    <strong>{act.user}</strong> {act.action}
                  </div>
                  <div className="activity-time" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} />
                    <span>{act.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status Table Summary */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Recent Users Overview</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {usersList.slice(0, 3).map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: '600' }}>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.joinedDate}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
