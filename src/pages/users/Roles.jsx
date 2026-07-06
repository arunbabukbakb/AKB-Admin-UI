import React from 'react';
import GenericCRUD from '../../components/Common/GenericCRUD';

const Roles = () => {
  const columns = [
    {
      key: 'serialNumber',
      label: 'S.No',
      render: (val, row, index) => index + 1
    },
    {
      key: 'name',
      label: 'Role Name',
      render: (val) => <span style={{ fontWeight: '600' }}>{val}</span>
    },
    {
      key: 'userType',
      label: 'User Type',
      render: (val) => {
        const numericVal = parseInt(val);
        const types = {
          0: { label: 'Admin', className: 'status-badge admin' },
          1: { label: 'Manager', className: 'status-badge manager' },
          2: { label: 'User', className: 'status-badge user' }
        };
        const type = types[numericVal] || { label: val || 'Unknown', className: 'status-badge user' };
        return (
          <span className={type.className} style={{ fontSize: '0.8rem' }}>
            {type.label}
          </span>
        );
      }
    },
    {
      key: 'codeName',
      label: 'Code Name',
      render: (val) => (
        <code style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--primary)' }}>
          {val}
        </code>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`status-badge ${val === true || val === 'true' ? 'active' : 'inactive'}`}>
          {val === true || val === 'true' ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const fields = [
    { name: 'name', label: 'Role Name', type: 'text', required: true, placeholder: 'E.g. Guest User' },
    {
      name: 'userType',
      label: 'User Type',
      type: 'select',
      required: true,
      dataType: 'number',
      defaultValue: '2',
      options: [
        { value: '0', label: 'Admin' },
        { value: '1', label: 'Manager' },
        { value: '2', label: 'User' }
      ]
    },
    { name: 'codeName', label: 'Code Name', type: 'text', required: true, placeholder: 'E.g. guest_user' },
    {
      name: 'status',
      label: 'Status',
      type: 'boolean',
      required: true,
      defaultValue: true
    }
  ];

  return (
    <GenericCRUD
      title="Role"
      apiUrl="Role"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search roles by name, codeName..."
      modalSize="sm"
    />
  );
};

export default Roles;
