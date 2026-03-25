import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      savedChats: [],
      chatOpen: false,

      setChatOpen: (open) => set({ chatOpen: open }),
      toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),

      loadExternalChat: (title, messages) =>
        set({ messages: [...messages], chatOpen: true }),

      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      setMessages: (messages) => set({ messages }),

      clearMessages: () => set({ messages: [] }),

      saveChat: (title) => {
        const { messages, savedChats } = get()
        if (messages.length === 0) return
        const chat = {
          id: Date.now().toString(),
          title,
          messages: [...messages],
          messageCount: messages.length,
          savedAt: new Date().toISOString(),
        }
        set({ savedChats: [chat, ...savedChats] })
      },

      removeSavedChat: (id) =>
        set((state) => ({
          savedChats: state.savedChats.filter((c) => c.id !== id),
        })),

      loadSavedChat: (id) => {
        const chat = get().savedChats.find((c) => c.id === id)
        if (chat) set({ messages: [...chat.messages] })
      },
    }),
    { name: 'ds-chats' }
  )
)
