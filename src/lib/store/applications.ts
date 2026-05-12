import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Application, ApplicationStatus } from "@/types";

interface ApplicationStore {
  applications: Application[];
  addApplication: (app: Omit<Application, "id">) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
}

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set) => ({
      applications: [],

      addApplication: (app) =>
        set((state) => ({
          applications: [
            { ...app, id: crypto.randomUUID() },
            ...state.applications,
          ],
        })),

      updateStatus: (id, status) =>
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, status } : app
          ),
        })),

      updateApplication: (id, updates) =>
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, ...updates } : app
          ),
        })),

      deleteApplication: (id) =>
        set((state) => ({
          applications: state.applications.filter((app) => app.id !== id),
        })),
    }),
    {
      name: "careercopilot-applications",
    }
  )
);
