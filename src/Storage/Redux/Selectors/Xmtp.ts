import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { XmtpState } from "../Slices"
import { HexUInt } from "@vechain/sdk-core"

export const selectXmtpState = (state: RootState) => state.xmpt

export const selectClients = createSelector([selectXmtpState], (state: XmtpState) => {
    return state.clients
})

export const selectRegisteredClients = createSelector([selectXmtpState], (state: XmtpState) => state.registerdClients)

export const selectClientFromAddress = createSelector(
    [selectXmtpState, (_: RootState, address: string) => address],
    (state: XmtpState, address) => {
        return state.clients.find(client => client.address === address)
    },
)

export const getDbEncryptionKey = createSelector([selectXmtpState], state => {
    const dbEncryptionKey = state.dbEncryptionKeys[`veChat-${state.selectedNetwork}`]
    if (!dbEncryptionKey) return undefined
    return HexUInt.of(dbEncryptionKey).bytes
})
