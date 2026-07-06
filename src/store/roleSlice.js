import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/api';

const initialRoles = [
  { id: 1, name: 'System Administrator', userType: 0, codeName: 'sys_admin', status: true },
  { id: 2, name: 'Regional Manager', userType: 1, codeName: 'reg_mgr', status: true },
  { id: 3, name: 'Support Operator', userType: 2, codeName: 'sup_op', status: true },
  { id: 4, name: 'Standard User', userType: 2, codeName: 'std_usr', status: true }
];

const getStoredRoles = () => {
  const stored = localStorage.getItem('crud_roles');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error('Failed to parse stored roles:', e);
    }
  }
  localStorage.setItem('crud_roles', JSON.stringify(initialRoles));
  return initialRoles;
};

// Async thunks for Role API
export const fetchRoles = createAsyncThunk('roles/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await apiService.get('Role');
    // Cache to localStorage
    localStorage.setItem('crud_roles', JSON.stringify(data));
    return data;
  } catch (error) {
    console.warn('Roles API Fetch failed, falling back to local cache:', error.message);
    return getStoredRoles(); // fallback
  }
});

export const addRole = createAsyncThunk('roles/add', async (roleData, { rejectWithValue }) => {
  try {
    const createdRole = await apiService.post('Role', {
      id: 0, // Server creates ID
      name: roleData.name,
      userType: parseInt(roleData.userType),
      codeName: roleData.codeName,
      status: roleData.status === 'true' || roleData.status === true
    });
    return createdRole;
  } catch (error) {
    console.warn('Roles API Add failed, executing local operation:', error.message);
    // Local fallback
    const localList = getStoredRoles();
    const newLocalRole = {
      id: localList.length > 0 ? Math.max(...localList.map(r => r.id)) + 1 : 1,
      name: roleData.name,
      userType: parseInt(roleData.userType),
      codeName: roleData.codeName,
      status: roleData.status === 'true' || roleData.status === true
    };
    localList.push(newLocalRole);
    localStorage.setItem('crud_roles', JSON.stringify(localList));
    return newLocalRole;
  }
});

export const updateRole = createAsyncThunk('roles/update', async (roleData, { rejectWithValue }) => {
  try {
    const updated = await apiService.put('Role', {
      id: parseInt(roleData.id),
      name: roleData.name,
      userType: parseInt(roleData.userType),
      codeName: roleData.codeName,
      status: roleData.status === 'true' || roleData.status === true
    });
    return updated;
  } catch (error) {
    console.warn('Roles API Update failed, executing local operation:', error.message);
    // Local fallback
    const localList = getStoredRoles();
    const index = localList.findIndex(r => r.id === roleData.id);
    if (index !== -1) {
      localList[index] = {
        id: roleData.id,
        name: roleData.name,
        userType: parseInt(roleData.userType),
        codeName: roleData.codeName,
        status: roleData.status === 'true' || roleData.status === true
      };
      localStorage.setItem('crud_roles', JSON.stringify(localList));
    }
    return roleData;
  }
});

export const deleteRole = createAsyncThunk('roles/delete', async (roleId, { rejectWithValue }) => {
  try {
    await apiService.delete(`Role/${roleId}`);
    return roleId;
  } catch (error) {
    console.warn('Roles API Delete failed, executing local operation:', error.message);
    // Local fallback
    const localList = getStoredRoles();
    const updatedList = localList.filter(r => r.id !== roleId);
    localStorage.setItem('crud_roles', JSON.stringify(updatedList));
    return roleId;
  }
});

const initialState = {
  list: getStoredRoles(),
  loading: false,
  error: null
};

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        let rolesData = [];
        if (Array.isArray(action.payload)) {
          rolesData = action.payload;
        } else if (action.payload && Array.isArray(action.payload.data)) {
          rolesData = action.payload.data;
        } else if (action.payload && typeof action.payload === 'object') {
          // Fallback scanner: find any array nested inside the response object
          const foundArray = Object.values(action.payload).find(val => Array.isArray(val));
          if (foundArray) {
            rolesData = foundArray;
          }
        }
        state.list = rolesData;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add Role
      .addCase(addRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRole.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      // Update Role
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.list.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // Delete Role
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.list = state.list.filter(r => r.id !== action.payload);
      });
  }
});

export default roleSlice.reducer;
