import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { useNetworkStore } from '@/lib/network-status';

// Define user type
interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string[];
  xId: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Unit {
  _id: string;
  tendonvi: string;
}

interface UserState {
  // Data
  users: User[];
  units: Unit[];
  
  // Loading states
  isLoadingUsers: boolean;
  isLoadingUnits: boolean;
  
  // Last updated timestamps
  lastUpdatedUsers: number | null;
  lastUpdatedUnits: number | null;
  
  // Actions
  fetchUsers: () => Promise<User[]>;
  fetchUnits: () => Promise<Unit[]>;
  addUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  
  // Utility functions
  getUserById: (id: string) => User | undefined;
  getUnitById: (id: string) => Unit | undefined;
  getUnitName: (id: string) => string;
  
  // Reset function
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial data
      users: [],
      units: [],
      
      // Initial loading states
      isLoadingUsers: false,
      isLoadingUnits: false,
      
      // Initial timestamps
      lastUpdatedUsers: null,
      lastUpdatedUnits: null,
      
      // Fetch users
      fetchUsers: async () => {
        try {
          set({ isLoadingUsers: true });
          
          // Check if we need to refresh the data
          const shouldRefresh = get().shouldRefreshData(get().lastUpdatedUsers);
          const isOnline = useNetworkStore.getState().isOnline;
          
          // If we have data and don't need to refresh, return the cached data
          if (get().users.length > 0 && !shouldRefresh && !isOnline) {
            console.log('Using cached users data');
            set({ isLoadingUsers: false });
            return get().users;
          }
          
          // Fetch new data if online
          if (isOnline) {
            const response = await axios.get('/api/users');
            
            // Update the store
            set({ 
              users: response.data, 
              isLoadingUsers: false,
              lastUpdatedUsers: Date.now()
            });
            
            return response.data;
          } else {
            // Return cached data if offline
            set({ isLoadingUsers: false });
            return get().users;
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          set({ isLoadingUsers: false });
          return get().users;
        }
      },
      
      // Fetch units
      fetchUnits: async () => {
        try {
          set({ isLoadingUnits: true });
          
          // Check if we need to refresh the data
          const shouldRefresh = get().shouldRefreshData(get().lastUpdatedUnits);
          const isOnline = useNetworkStore.getState().isOnline;
          
          // If we have data and don't need to refresh, return the cached data
          if (get().units.length > 0 && !shouldRefresh && !isOnline) {
            console.log('Using cached units data');
            set({ isLoadingUnits: false });
            return get().units;
          }
          
          // Fetch new data if online
          if (isOnline) {
            const response = await axios.get('/api/donvi');
            
            // Update the store
            set({ 
              units: response.data, 
              isLoadingUnits: false,
              lastUpdatedUnits: Date.now()
            });
            
            return response.data;
          } else {
            // Return cached data if offline
            set({ isLoadingUnits: false });
            return get().units;
          }
        } catch (error) {
          console.error('Error fetching units:', error);
          set({ isLoadingUnits: false });
          return get().units;
        }
      },
      
      // Add user
      addUser: async (userData) => {
        try {
          const isOnline = useNetworkStore.getState().isOnline;
          
          if (isOnline) {
            // Send to server if online
            const response = await axios.post('/api/user', userData);
            const newUser = response.data;
            
            // Update local store
            set(state => ({
              users: [...state.users, newUser]
            }));
            
            return newUser;
          } else {
            // Create temporary user with local ID if offline
            const tempUser = {
              ...userData,
              _id: `temp_${Date.now()}`,
              _pendingCreation: true
            } as User;
            
            // Update local store
            set(state => ({
              users: [...state.users, tempUser]
            }));
            
            return tempUser;
          }
        } catch (error) {
          console.error('Error adding user:', error);
          throw error;
        }
      },
      
      // Update user
      updateUser: async (id, userData) => {
        try {
          const isOnline = useNetworkStore.getState().isOnline;
          
          if (isOnline) {
            // Send to server if online
            const response = await axios.put(`/api/user/${id}`, userData);
            const updatedUser = response.data;
            
            // Update local store
            set(state => ({
              users: state.users.map(user => 
                user._id === id ? updatedUser : user
              )
            }));
            
            return updatedUser;
          } else {
            // Update locally if offline
            const existingUser = get().getUserById(id);
            if (!existingUser) {
              throw new Error('User not found');
            }
            
            const updatedUser = {
              ...existingUser,
              ...userData,
              _pendingUpdate: true
            } as User;
            
            // Update local store
            set(state => ({
              users: state.users.map(user => 
                user._id === id ? updatedUser : user
              )
            }));
            
            return updatedUser;
          }
        } catch (error) {
          console.error('Error updating user:', error);
          throw error;
        }
      },
      
      // Delete user
      deleteUser: async (id) => {
        try {
          const isOnline = useNetworkStore.getState().isOnline;
          
          if (isOnline) {
            // Send to server if online
            await axios.delete(`/api/user?id=${id}`);
            
            // Update local store
            set(state => ({
              users: state.users.filter(user => user._id !== id)
            }));
          } else {
            // Mark for deletion if offline
            set(state => ({
              users: state.users.map(user => 
                user._id === id ? { ...user, _pendingDeletion: true } : user
              )
            }));
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          throw error;
        }
      },
      
      // Utility function to check if data should be refreshed (older than 1 hour)
      shouldRefreshData: (lastUpdated: number | null): boolean => {
        if (!lastUpdated) return true;
        
        const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
        return Date.now() - lastUpdated > ONE_HOUR;
      },
      
      // Get user by ID
      getUserById: (id: string) => {
        return get().users.find(user => user._id === id);
      },
      
      // Get unit by ID
      getUnitById: (id: string) => {
        return get().units.find(unit => unit._id === id);
      },
      
      // Get unit name by ID
      getUnitName: (id: string) => {
        const unit = get().getUnitById(id);
        return unit ? unit.tendonvi : 'Không có đơn vị';
      },
      
      // Reset function
      reset: () => {
        set({
          users: [],
          units: [],
          lastUpdatedUsers: null,
          lastUpdatedUnits: null
        });
      }
    }),
    {
      name: 'user-data-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        units: state.units,
        lastUpdatedUsers: state.lastUpdatedUsers,
        lastUpdatedUnits: state.lastUpdatedUnits
      })
    }
  )
);
