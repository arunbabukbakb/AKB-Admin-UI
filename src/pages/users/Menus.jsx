import React from 'react';
import GenericCRUD from 'src/components/Common/GenericCRUD';

const Menus = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'title',
      label: 'Title',
      render: (val) => <span style={{ fontWeight: '600' }}>{val}</span>
    },
    { key: 'path', label: 'Path' },
    {
      key: 'icon',
      label: 'Icon',
      render: (val) => val ? <code>{val}</code> : <span style={{ color: 'var(--text-muted)' }}>-</span>
    },
    { key: 'orderNumber', label: 'Order' },
    {
      key: 'isParent',
      label: 'Is Parent',
      render: (val) => (
        <span className={`status-badge ${val === true || val === 'true' ? 'admin' : 'user'}`} style={{ fontSize: '0.8rem' }}>
          {val === true || val === 'true' ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'parentMenuId',
      label: 'Parent Menu',
      render: (val) => {
        if (!val || val === 0 || val === '0') return <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None (Root Menu)</span>;

        // Lookup parent menu title from localStorage cache to show text dynamically
        const stored = localStorage.getItem('crud_cache_Menu');
        if (stored) {
          try {
            const list = JSON.parse(stored);
            const parent = list.find(m => m.id === parseInt(val));
            if (parent) return <span style={{ fontWeight: '500' }}>{parent.title}</span>;
          } catch (e) { }
        }
        return <code>ID: {val}</code>;
      }
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
    { name: 'title', label: 'Menu Title', type: 'text', required: true, placeholder: 'E.g. Manage Roles', gridSize: 6 },
    { name: 'path', label: 'Navigation Path', type: 'text', required: false, placeholder: 'E.g. /roles', gridSize: 6 },
    { name: 'icon', label: 'Icon Code/Class', type: 'text', required: false, placeholder: 'E.g. lock or shield', gridSize: 6 },
    { name: 'orderNumber', label: 'Display Order', type: 'number', required: true, defaultValue: 0, gridSize: 6 },
    {
      name: 'isParent',
      label: 'Is Parent Menu?',
      type: 'boolean',
      required: false,
      defaultValue: false
    },
    {
      name: 'parentMenuId',
      label: 'Parent Menu Assignment',
      type: 'select',
      required: false,
      dataType: 'number',
      defaultValue: '0',
      gridSize: 6,
      optionsFromSelf: true,
      selfFilter: (item) => item.isParent === true || item.isParent === 'true',
      selfValue: 'id',
      selfLabel: 'title',
      noneOption: { value: '0', label: 'None (Root Menu)' }
    },
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
      title="Menu"
      apiUrl="Menu"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search menus by title or path..."
      modalSize="md"
    />
  );
};

export default Menus;
