import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { VeChatState } from "../Slices"
import { HexUInt } from "@vechain/sdk-core"

export const selectVeChatState = (state: RootState) => state.veChat

export const selectRegisteredClients = createSelector(
    [selectVeChatState],
    (state: VeChatState) => state.registerdClients[state.selectedNetwork],
)

export const selectConversationByTopic = createSelector(
    [selectVeChatState, (_: RootState, topic: string) => topic],
    (state, topic) => {
        if (!state.conversations[topic]) return undefined
        return state.conversations[topic]
    },
)

export const selectConversations = createSelector([selectVeChatState], state => {
    return state.conversations
})

export const getDbEncryptionKey = createSelector([selectVeChatState], state => {
    const dbEncryptionKey = state.dbEncryptionKeys[`veChat-${state.selectedNetwork}`]
    if (!dbEncryptionKey) return undefined
    return HexUInt.of(dbEncryptionKey).bytes
})
