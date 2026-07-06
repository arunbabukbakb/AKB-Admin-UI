import { createSlice } from '@reduxjs/toolkit';

const initialUsers = [
  {
    id: '1',
    name: 'Olivia Martinez',
    email: 'olivia@example.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    joinedDate: '2025-01-15'
  },
  {
    id: '2',
    name: 'James Chen',
    email: 'james.c@example.com',
    role: 'user',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    joinedDate: '2025-02-18'
  },
  {
    id: '3',
    name: 'Sophia Kovalski',
    email: 'sophia.k@example.com',
    role: 'user',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    joinedDate: '2025-03-05'
  },
  {
    id: '4',
    name: 'Marcus Vance',
    email: 'marcus.v@example.com',
    role: 'user',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    joinedDate: '2025-04-10'
  },
  {
    id: '5',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    joinedDate: '2025-05-12'
  }
];

const getStoredUsers = () => {
  const stored = localStorage.getItem('crud_users');
  if (stored) {
    return JSON.parse(stored);
  } else {
    localStorage.setItem('crud_users', JSON.stringify(initialUsers));
    return initialUsers;
  }
};

const initialState = {
  list: getStoredUsers(),
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action) => {
      const newUser = {
        id: Date.now().toString(),
        joinedDate: new Date().toISOString().split('T')[0],
        avatar: action.payload.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        ...action.payload
      };
      state.list.unshift(newUser);
      localStorage.setItem('crud_users', JSON.stringify(state.list));
    },
    updateUser: (state, action) => {
      const { id, name, email, role, status, avatar } = action.payload;
      const index = state.list.findIndex((u) => u.id === id);
      if (index !== -1) {
        state.list[index] = { 
          ...state.list[index], 
          name, 
          email, 
          role, 
          status,
          ...(avatar && { avatar }) 
        };
        localStorage.setItem('crud_users', JSON.stringify(state.list));
      }
    },
    deleteUser: (state, action) => {
      const id = action.payload;
      state.list = state.list.filter((u) => u.id !== id);
      localStorage.setItem('crud_users', JSON.stringify(state.list));
    }
  }
});

export const { addUser, updateUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;
