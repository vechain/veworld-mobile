import {
    initialUserPreferencesState,
    setHideStargateBannerHomeScreen,
    setHideStargateBannerVETScreen,
    setHideNewUserVeBetterCard,
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
    it("should set hideNewUserVeBetterCard", () => {
        const state = UserPreferencesSlice.reducer(initialUserPreferencesState, setHideNewUserVeBetterCard(true))
        expect(state.hideNewUserVeBetterCard).toBe(true)
    })
})
