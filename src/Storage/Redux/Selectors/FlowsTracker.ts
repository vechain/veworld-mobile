import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const selectFlowsTrackerState = (state: RootState) => state.flowsTracker

export const selectFlowData = <T extends unknown>(flowKey: string) =>
    createSelector(selectFlowsTrackerState, state => {
        return state.flows[flowKey] as T
    })

export const selectFlows = () =>
    createSelector(selectFlowsTrackerState, state => {
        return Object.keys(state.flows)
    })
