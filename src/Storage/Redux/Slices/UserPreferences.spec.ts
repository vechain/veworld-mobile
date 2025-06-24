import {
    initialUserPreferencesState,
    setHideStargateBannerHomeScreen,
    setHideStargateBannerVETScreen,
    UserPreferencesSlice,
} from "./UserPreferences"

describe("UserPreferences", () => {
    it("should set hideStargateBannerHomeScreen", () => {
        const state = UserPreferencesSlice.reducer(initialUserPreferencesState, setHideStargateBannerHomeScreen(true))
        expect(state.hideStargateBannerHomeScreen).toBe(true)
    })
    it("should set hideStargateBannerVETScreen", () => {
        const state = UserPreferencesSlice.reducer(initialUserPreferencesState, setHideStargateBannerVETScreen(true))
        expect(state.hideStargateBannerVETScreen).toBe(true)
    })
})
