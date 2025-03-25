import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { fetchMuavu, fetchGiaiDoan, fetchCongViec } from "@/lib/sync-service"
import { useNetworkStore } from "@/lib/network-status"

interface Season {
  _id: string
  tenmuavu: string
  nam: string
  ngaybatdau: string
  ngayketthuc?: string
  phuongphap?: string
  giong?: string
}

interface Stage {
  _id: string
  tengiaidoan: string
  color: string
  thutu?: number
}

interface Task {
  _id: string
  tenCongViec: string
  giaidoanId: string
  thutu?: number
}

interface ReferenceDataState {
  seasons: Season[]
  stages: Stage[]
  tasks: Task[]
  isLoadingSeasons: boolean
  isLoadingStages: boolean
  isLoadingTasks: boolean
  lastUpdatedSeasons: number | null
  lastUpdatedStages: number | null
  lastUpdatedTasks: number | null
  fetchAllReferenceData: () => Promise<void>
  fetchSeasons: () => Promise<Season[]>
  fetchStages: () => Promise<Stage[]>
  fetchTasks: () => Promise<Task[]>
  getFilteredTasks: (stageId: string) => Task[]
  getStageById: (stageId: string) => Stage | undefined
  getSeasonById: (seasonId: string) => Season | undefined
  getTaskById: (taskId: string) => Task | undefined
  reset: () => void
}

const shouldRefreshData = (lastUpdated: number | null): boolean => {
  if (!lastUpdated) return true
  const ONE_HOUR = 60 * 60 * 1000
  return Date.now() - lastUpdated > ONE_HOUR
}

export const useReferenceDataStore = create<ReferenceDataState>()(
  persist(
    (set, get) => ({
      seasons: [],
      stages: [],
      tasks: [],
      isLoadingSeasons: false,
      isLoadingStages: false,
      isLoadingTasks: false,
      lastUpdatedSeasons: null,
      lastUpdatedStages: null,
      lastUpdatedTasks: null,
      fetchAllReferenceData: async () => {
        try {
          await Promise.all([get().fetchSeasons(), get().fetchStages(), get().fetchTasks()])
          console.log("All reference data fetched successfully")
        } catch (error) {
          console.error("Error fetching all reference data:", error)
        }
      },
      fetchSeasons: async () => {
        try {
          set({ isLoadingSeasons: true })
          const needsRefresh = shouldRefreshData(get().lastUpdatedSeasons)
          const isOnline = useNetworkStore.getState().isOnline
          if (get().seasons.length > 0 && !needsRefresh && !isOnline) {
            console.log("Using cached seasons data")
            set({ isLoadingSeasons: false })
            return get().seasons
          }
          const data = await fetchMuavu()
          set({
            seasons: data,
            isLoadingSeasons: false,
            lastUpdatedSeasons: Date.now(),
          })
          return data
        } catch (error) {
          console.error("Error fetching seasons:", error)
          set({ isLoadingSeasons: false })
          return get().seasons
        }
      },
      fetchStages: async () => {
        try {
          set({ isLoadingStages: true })
          const needsRefresh = shouldRefreshData(get().lastUpdatedStages)
          const isOnline = useNetworkStore.getState().isOnline
          if (get().stages.length > 0 && !needsRefresh && !isOnline) {
            console.log("Using cached stages data")
            set({ isLoadingStages: false })
            return get().stages
          }
          const data = await fetchGiaiDoan()
          set({
            stages: data,
            isLoadingStages: false,
            lastUpdatedStages: Date.now(),
          })
          return data
        } catch (error) {
          console.error("Error fetching stages:", error)
          set({ isLoadingStages: false })
          return get().stages
        }
      },
      fetchTasks: async () => {
        try {
          set({ isLoadingTasks: true })
          const needsRefresh = shouldRefreshData(get().lastUpdatedTasks)
          const isOnline = useNetworkStore.getState().isOnline
          if (get().tasks.length > 0 && !needsRefresh && !isOnline) {
            console.log("Using cached tasks data")
            set({ isLoadingTasks: false })
            return get().tasks
          }
          const data = await fetchCongViec()
          set({
            tasks: data,
            isLoadingTasks: false,
            lastUpdatedTasks: Date.now(),
          })
          return data
        } catch (error) {
          console.error("Error fetching tasks:", error)
          set({ isLoadingTasks: false })
          return get().tasks
        }
      },
      getFilteredTasks: (stageId: string) => {
        return get().tasks.filter((task) => task.giaidoanId === stageId)
      },
      getStageById: (stageId: string) => {
        return get().stages.find((stage) => stage._id === stageId)
      },
      getSeasonById: (seasonId: string) => {
        return get().seasons.find((season) => season._id === seasonId)
      },
      getTaskById: (taskId: string) => {
        return get().tasks.find((task) => task._id === taskId)
      },
      reset: () => {
        set({
          seasons: [],
          stages: [],
          tasks: [],
          lastUpdatedSeasons: null,
          lastUpdatedStages: null,
          lastUpdatedTasks: null,
        })
      },
    }),
    {
      name: "reference-data-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        seasons: state.seasons,
        stages: state.stages,
        tasks: state.tasks,
        lastUpdatedSeasons: state.lastUpdatedSeasons,
        lastUpdatedStages: state.lastUpdatedStages,
        lastUpdatedTasks: state.lastUpdatedTasks,
      }),
    }
  )
)