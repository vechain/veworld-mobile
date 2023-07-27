import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

export const selectLatestBeat = (state: RootState) => state.beat.latestBeat

export const selectBlockRef = createSelector(selectLatestBeat, latestBeat =>
    latestBeat?.id.slice(0, 18),
)
