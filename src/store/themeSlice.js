import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) return savedTheme;
  return 'dark'; // default theme is dark
};

const getInitialPreset = () => {
  const savedPreset = localStorage.getItem('theme-preset');
  if (savedPreset) return savedPreset;
  return 'blue'; // default preset is blue
};

const getInitialSidebarBg = () => {
  const saved = localStorage.getItem('theme-sidebar-bg');
  return saved || 'default'; // default, carbon, midnight, primary, glass
};

const getInitialHeaderBg = () => {
  const saved = localStorage.getItem('theme-header-bg');
  return saved || 'default'; // default, solid, primary, glass
};

const initialState = {
  theme: getInitialTheme(),
  preset: getInitialPreset(),
  sidebarBg: getInitialSidebarBg(),
  headerBg: getInitialHeaderBg(),
  sidebarCollapsed: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setPreset: (state, action) => {
      state.preset = action.payload;
      localStorage.setItem('theme-preset', action.payload);
    },
    setSidebarBg: (state, action) => {
      state.sidebarBg = action.payload;
      localStorage.setItem('theme-sidebar-bg', action.payload);
    },
    setHeaderBg: (state, action) => {
      state.headerBg = action.payload;
      localStorage.setItem('theme-header-bg', action.payload);
    },
    resetTheme: (state) => {
      state.theme = 'dark';
      state.preset = 'blue';
      state.sidebarBg = 'default';
      state.headerBg = 'default';
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('theme-preset', 'blue');
      localStorage.setItem('theme-sidebar-bg', 'default');
      localStorage.setItem('theme-header-bg', 'default');
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    }
  }
});

export const { 
  toggleTheme, 
  setTheme, 
  setPreset, 
  setSidebarBg, 
  setHeaderBg, 
  resetTheme,
  toggleSidebar, 
  setSidebarCollapsed 
} = themeSlice.actions;

export default themeSlice.reducer;
