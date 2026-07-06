import React, { useState } from 'react';
import { Eye, Edit, Trash, Database } from 'lucide-react';
import ServerTable from '../components/Common/ServerTable';
import './Pages.css';

const TestTable = () => {
  const [selectedRow, setSelectedRow] = useState(null);

  // Define columns for our server-side table
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{val}</span>
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{val}</span>
    },
    {
      key: 'email',
      label: 'Email Address',
      sortable: true
    },
    {
      key: 'amount',
      label: 'Transaction Amount',
      sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
          ${val.toFixed(2)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => {
        let bgColor = 'rgba(239, 68, 68, 0.1)';
        let color = '#ef4444';
        if (val === 'Completed') {
          bgColor = 'rgba(34, 197, 94, 0.1)';
          color = '#22c55e';
        } else if (val === 'Pending') {
          bgColor = 'rgba(245, 158, 11, 0.1)';
          color = '#f59e0b';
        }
        return (
          <span style={{
            padding: '0.25rem 0.6rem',
            borderRadius: '50px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: bgColor,
            color: color
          }}>
            {val}
          </span>
        );
      }
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString()
    }
  ];

  // Helper generator to simulate 85 records for pagination testing
  const generateSimulatedRecords = () => {
    const statuses = ['Completed', 'Pending', 'Failed'];
    const names = [
      'John Doe', 'Alice Smith', 'Bob Johnson', 'Carol White', 'David Brown',
      'Emma Davis', 'Frank Miller', 'Grace Wilson', 'Henry Taylor', 'Ivy Martinez',
      'Jack Anderson', 'Kate Thomas', 'Leo Taylor', 'Mia Garcia', 'Nathan Robinson',
      'Olivia Clark', 'Paul Rodriguez', 'Quinn Lewis', 'Ryan Lee', 'Sophia Walker'
    ];

    const records = [];
    for (let i = 1; i <= 85; i++) {
      const name = names[i % names.length];
      const randomStatus = statuses[i % statuses.length];
      const amount = 50 + (i * 12.35) % 850;
      
      // Generate varying dates
      const date = new Date();
      date.setDate(date.getDate() - i);

      records.push({
        id: i,
        customerName: `${name} (${i})`,
        email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
        amount: amount,
        status: randomStatus,
        date: date.toISOString().split('T')[0]
      });
    }
    return records;
  };

  // Row Action buttons render callback
  const renderRowActions = (row) => (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      <button
        onClick={() => setSelectedRow(row)}
        className="nav-action-btn"
        title="View Details"
        style={{ width: '30px', height: '30px', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Eye size={13} />
      </button>
      <button
        className="nav-action-btn"
        title="Edit Record"
        style={{ width: '30px', height: '30px', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Edit size={13} style={{ color: 'var(--primary)' }} />
      </button>
    </div>
  );

  return (
    <div style={{ padding: '0.5rem 0 2rem' }}>
      
      {/* Test Page Banner */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: 'var(--primary-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Database size={20} color="var(--primary)" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Server-Side Paginated Table Test
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Verifies pagination limits, sorting states, search criteria, and loading states.
          </p>
        </div>
      </div>

      {/* Main Table Test Component */}
      <ServerTable
        apiUrl="SimulatedTransactions" // Endpoint to test (mock engine overrides if not exists)
        columns={columns}
        searchPlaceholder="Filter transactions by customer, status, or email..."
        rowActions={renderRowActions}
        mockDataGenerator={generateSimulatedRecords}
        idField="id"
      />

      {/* Row detail viewer modal/drawer drawer mockup */}
      {selectedRow && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div className="glass-panel" style={{
            width: '450px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--card-shadow)',
            padding: '1.5rem',
            position: 'relative'
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Transaction Detail #{selectedRow.id}
            </h3>
            
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Customer: </strong>
                <span style={{ color: 'var(--text-main)' }}>{selectedRow.customerName}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Email: </strong>
                <span style={{ color: 'var(--text-main)' }}>{selectedRow.email}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Amount: </strong>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>${selectedRow.amount.toFixed(2)}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Status: </strong>
                <span style={{ color: 'var(--text-main)' }}>{selectedRow.status}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Date: </strong>
                <span style={{ color: 'var(--text-main)' }}>{selectedRow.date}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedRow(null)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.4rem 1.25rem', borderRadius: '6px' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTable;
