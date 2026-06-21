import { create } from 'zustand';

// Shared between the (tabs) layout (which owns the floating tab bar's "+"
// button) and the groups list screen (whose empty-state CTA opens the same
// sheet) — both need to trigger it, neither is an ancestor of the other.
interface UiState {
  createGroupSheetOpen: boolean;
  openCreateGroupSheet: () => void;
  closeCreateGroupSheet: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  createGroupSheetOpen: false,
  openCreateGroupSheet: () => set({ createGroupSheetOpen: true }),
  closeCreateGroupSheet: () => set({ createGroupSheetOpen: false }),
}));
