import { renderHook, act } from "@testing-library/react-hooks"
import { useAppLock } from "./useAppLock"
import { setAppLockStatus } from "~Storage/Redux/Actions"
import {
    selectAppLockStatus,
    selectHasOnboarded,
    selectIsAppLockActive,
} from "~Storage/Redux/Selectors"
import { WALLET_STATUS } from "~Model"
import { TestWrapper } from "~Test"
jest.mock("~Storage/Redux/Actions", () => ({
    ...jest.requireActual("~Storage/Redux/Actions"),
    setAppLockStatus: jest.fn(
        jest.requireActual("~Storage/Redux/Actions").setAppLockStatus,
    ),
}))
jest.mock("~Storage/Redux/Selectors", () => ({
    ...jest.requireActual("~Storage/Redux/Selectors"),
    selectAppLockStatus: jest.fn(),
    selectHasOnboarded: jest.fn(),
    selectIsAppLockActive: jest.fn(),
}))

describe("useAppLock", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should initialize with app lock inactive and app lock active as false", async () => {
        ;(selectHasOnboarded as unknown as jest.Mock).mockImplementation(
            () => false,
        )
        ;(selectIsAppLockActive as unknown as jest.Mock).mockImplementation(
            () => false,
        )
        ;(selectAppLockStatus as unknown as jest.Mock).mockImplementation(
            () => WALLET_STATUS.LOCKED,
        )

        const { result, waitForNextUpdate } = renderHook(useAppLock, {
            wrapper: TestWrapper,
        })
        await waitForNextUpdate()
        expect(result.current.appLockStatusInactive).toBe(true)
        expect(result.current.appLockStatusActive).toBe(false)
    })

    it("should unlock the app when calling unlockApp", async () => {
        ;(selectHasOnboarded as unknown as jest.Mock).mockImplementation(
            () => true,
        )
        ;(selectIsAppLockActive as unknown as jest.Mock).mockImplementation(
            () => true,
        )
        ;(selectAppLockStatus as unknown as jest.Mock).mockImplementation(
            () => WALLET_STATUS.LOCKED,
        )

        const { result, waitForNextUpdate } = renderHook(useAppLock, {
            wrapper: TestWrapper,
        })
        await waitForNextUpdate()
        act(() => {
            result.current.unlockApp()
        })

        expect(setAppLockStatus).toHaveBeenCalledWith(WALLET_STATUS.UNLOCKED)
    })

    it("should lock the app when calling lockApp", async () => {
        ;(selectHasOnboarded as unknown as jest.Mock).mockImplementation(
            () => true,
        )
        ;(selectIsAppLockActive as unknown as jest.Mock).mockImplementation(
            () => true,
        )
        ;(selectAppLockStatus as unknown as jest.Mock).mockImplementation(
            () => WALLET_STATUS.UNLOCKED,
        )

        const { result, waitForNextUpdate } = renderHook(useAppLock, {
            wrapper: TestWrapper,
        })
        await waitForNextUpdate()
        act(() => {
            result.current.lockApp()
        })

        expect(setAppLockStatus).toHaveBeenCalledWith(WALLET_STATUS.LOCKED)
    })
})
