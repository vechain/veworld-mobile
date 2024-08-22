import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type FlowsTrackerState = {
    flows: {
        [flowKey: string]: unknown
    }
}

type FlowTracker = {
    flowKey: keyof FlowsTrackerState["flows"]
    flowData: unknown
}

export const initialFlowsTrackerState: FlowsTrackerState = {
    flows: {},
}

export const FlowsTrackerSlice = createSlice({
    name: "flowsTracker",
    initialState: initialFlowsTrackerState,
    reducers: {
        setFlowData: (state, action: PayloadAction<FlowTracker>) => {
            const { flowKey, flowData } = action.payload
            state.flows[flowKey] = flowData
        },
        resetFlow: (state, action: PayloadAction<keyof typeof state.flows>) => {
            const flowKey = action.payload
            delete state.flows[flowKey]
        },
        resetFlows: () => initialFlowsTrackerState,
    },
})

export const { setFlowData, resetFlow, resetFlows } = FlowsTrackerSlice.actions
