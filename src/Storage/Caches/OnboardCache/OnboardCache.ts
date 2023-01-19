// import { createSlice, PayloadAction } from "@reduxjs/toolkit"
// import { OnboardStage, OnboardState } from "~Model"
// import { RootState } from "../cache"

// export const initialOnboardState: OnboardState = {
//     stage: OnboardStage.BEGINNING,
// }

// export const onboardSlice = createSlice({
//     name: "onboard",
//     initialState: initialOnboardState,
//     reducers: {
//         setPassword: (_, action: PayloadAction<string>) => {
//             return {
//                 stage: OnboardStage.PASSWORD_SET,
//                 password: action.payload,
//             }
//         },
//         finishOnboarding: () => {
//             return { password: undefined, stage: OnboardStage.COMPLETE }
//         },
//     },
// })

// export const { setPassword, finishOnboarding } = onboardSlice.actions

// export const getOnboardPassword = (state: RootState) => state.onboard.password
// export const getOnboardStage = (state: RootState) => state.onboard.stage
