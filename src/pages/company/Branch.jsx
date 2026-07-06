import React from 'react';
import GenericCRUD from '../../components/Common/GenericCRUD';

const Branch = () => {
  const columns = [
    {
      key: 'serialNumber',
      label: 'S.No',
      render: (val, row, index) => index + 1
    },
    {
      key: 'code',
      label: 'Branch Code',
      render: (val) => <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{val}</span>
    },
    {
      key: 'name',
      label: 'Branch Name',
      render: (val) => <span style={{ fontWeight: '500' }}>{val}</span>
    },
    {
      key: 'companyName',
      label: 'Company',
      render: (val, row) => val || `Company ID: ${row.companyId}`
    },
    { key: 'managerName', label: 'Manager' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'city', label: 'City' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`status-badge ${val ? 'active' : 'inactive'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const fields = [
    { name: 'code', label: 'Branch Code', type: 'text', required: true, placeholder: 'E.g. BR-001', gridSize: 4 },
    { name: 'name', label: 'Branch Name', type: 'text', required: true, placeholder: 'E.g. Downtown Branch', gridSize: 4 },

    { name: 'shortName', label: 'Short Name', type: 'text', required: true, placeholder: 'E.g. DWN', gridSize: 4 },
    { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'branch@company.com', gridSize: 4 },
    { name: 'phoneNumber', label: 'Phone Number', type: 'text', required: true, placeholder: 'E.g. +1234567890', gridSize: 4 },

    { name: 'alternatePhone', label: 'Alternate Phone', type: 'text', required: false, placeholder: 'E.g. +1098765432', gridSize: 4 },
    { name: 'managerName', label: 'Manager Name', type: 'text', required: true, placeholder: 'Manager Full Name', gridSize: 4 },
    { name: 'managerEmail', label: 'Manager Email', type: 'email', required: true, placeholder: 'manager@company.com', gridSize: 4 },

    { name: 'managerPhone', label: 'Manager Phone', type: 'text', required: true, placeholder: 'Manager Phone Number', gridSize: 4 },

    { name: 'city', label: 'City', type: 'text', required: true, placeholder: 'City', gridSize: 4 },
    { name: 'country', label: 'Country', type: 'text', required: true, placeholder: 'Country', gridSize: 4 },
    { name: 'pinCode', label: 'Pin Code', type: 'number', required: true, placeholder: 'E.g. 100001', gridSize: 4 },

    {
      name: 'status',
      label: 'Status',
      type: 'boolean',
      required: true,
      defaultValue: true,
      gridSize: 4
    },
    { name: 'address', label: 'Address Details', type: 'textarea', required: true, placeholder: 'Street details...', gridSize: 12 }
  ];

  return (
    <GenericCRUD
      title="Branch"
      apiUrl="Branch"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search branches by code, name, city..."
      modalSize="xl"
    />
  );
};

export default Branch;
