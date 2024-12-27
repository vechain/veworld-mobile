import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

/**
 * Retrieves all connected app accounts from the state.
 * @param state - The root state of the application.
 * @returns All connected app accounts.
 */
export const getAllConnectedAppAccounts = (state: RootState) => state.connectedAppAccounts

/**
 * Retrieves all connected apps from the state.
 * @param state - The root state of the application.
 * @returns All connected apps.
 */
export const getAllConnectedApps = createSelector([getAllConnectedAppAccounts], connectedApps =>
    Object.keys(connectedApps),
)
