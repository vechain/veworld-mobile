import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { TestWrapper } from "~Test"

import { useBlacklistedCollection } from "~Hooks/useBlacklistedCollection"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useCollectionsBookmarking } from "~Hooks/useCollectionsBookmarking"

import { CollectionActionsBottomSheet } from "./CollectionActionsBottomSheet"

jest.mock("~Hooks/useBlacklistedCollection", () => ({
    useBlacklistedCollection: jest.fn().mockReturnValue({ isBlacklisted: false, toggleBlacklist: jest.fn() }),
}))
jest.mock("~Hooks/useCollectionsBookmarking", () => ({
    useCollectionsBookmarking: jest.fn().mockReturnValue({ isFavorite: false, toggleFavoriteCollection: jest.fn() }),
}))
jest.mock("~Hooks/useBrowserTab", () => ({
    useBrowserTab: jest.fn().mockReturnValue({ navigateWithTab: jest.fn() }),
}))
jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
}))

describe("CollectionActionsBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })
    afterEach(() => {
        jest.useRealTimers()
    })
    it("should call bookmark when bookmark is clicked", async () => {
        const toggleFavoriteCollection = jest.fn()
        const bsRef = { current: { present: jest.fn(), close: jest.fn() } } as any

        const addr = ethers.Wallet.createRandom().address
        ;(useCollectionsBookmarking as jest.Mock).mockReturnValue({
            isFavorite: false,
            toggleFavoriteCollection,
        })

        render(<CollectionActionsBottomSheet bsRef={bsRef} onOpenHidden={jest.fn()} onOpenReport={jest.fn()} />, {
            wrapper: TestWrapper,
        })

        const spiedClose = jest.spyOn(bsRef.current, "close")

        await act(() => {
            bsRef.current.present(addr)
        })

        expect(screen.getByTestId("COLLECTION_ACTIONS_BS_FAVORITE")).toBeVisible()

        await act(() => {
            fireEvent.press(screen.getByTestId("COLLECTION_ACTIONS_BS_FAVORITE"))
        })

        expect(toggleFavoriteCollection).toHaveBeenCalled()
        expect(spiedClose).toHaveBeenCalled()
    })
    describe("blacklist", () => {
        it("should call blacklist & open modal (if value is false)", async () => {
            const toggleBlacklist = jest.fn()
            const bsRef = { current: { present: jest.fn(), close: jest.fn() } } as any

            const addr = ethers.Wallet.createRandom().address
            ;(useBlacklistedCollection as jest.Mock).mockReturnValue({
                isBlacklisted: false,
                toggleBlacklist,
            })

            const onOpenHidden = jest.fn()

            render(
                <CollectionActionsBottomSheet bsRef={bsRef} onOpenHidden={onOpenHidden} onOpenReport={jest.fn()} />,
                {
                    wrapper: TestWrapper,
                },
            )

            const spiedClose = jest.spyOn(bsRef.current, "close")

            await act(() => {
                bsRef.current.present(addr)
            })

            expect(screen.getByTestId("COLLECTION_ACTIONS_BS_BLACKLIST")).toBeVisible()

            await act(() => {
                fireEvent.press(screen.getByTestId("COLLECTION_ACTIONS_BS_BLACKLIST"))
            })

            expect(toggleBlacklist).toHaveBeenCalled()
            expect(spiedClose).toHaveBeenCalled()
            jest.advanceTimersByTime(500)
            expect(onOpenHidden).toHaveBeenCalled()
        })
        it("should call blacklist & not open modal (if value is true)", async () => {
            const toggleBlacklist = jest.fn()
            const bsRef = { current: { present: jest.fn(), close: jest.fn() } } as any
            const addr = ethers.Wallet.createRandom().address
            ;(useBlacklistedCollection as jest.Mock).mockReturnValue({
                isBlacklisted: true,
                toggleBlacklist,
            })

            const onOpenHidden = jest.fn()

            render(
                <CollectionActionsBottomSheet bsRef={bsRef} onOpenHidden={onOpenHidden} onOpenReport={jest.fn()} />,
                {
                    wrapper: TestWrapper,
                },
            )

            const spiedClose = jest.spyOn(bsRef.current, "close")

            await act(() => {
                bsRef.current.present(addr)
            })

            expect(screen.getByTestId("COLLECTION_ACTIONS_BS_BLACKLIST")).toBeVisible()

            await act(() => {
                fireEvent.press(screen.getByTestId("COLLECTION_ACTIONS_BS_BLACKLIST"))
            })

            expect(toggleBlacklist).toHaveBeenCalled()
            expect(spiedClose).toHaveBeenCalled()
            jest.advanceTimersByTime(500)
            expect(onOpenHidden).not.toHaveBeenCalled()
        })
    })

    it("should call report when report is clicked", async () => {
        const navigateWithTab = jest.fn()
        const bsRef = { current: { present: jest.fn(), close: jest.fn() } } as any
        const addr = ethers.Wallet.createRandom().address
        ;(useBrowserTab as jest.Mock).mockReturnValue({
            navigateWithTab,
        })

        render(<CollectionActionsBottomSheet bsRef={bsRef} onOpenHidden={jest.fn()} onOpenReport={jest.fn()} />, {
            wrapper: TestWrapper,
        })

        const spiedClose = jest.spyOn(bsRef.current, "close")

        await act(() => {
            bsRef.current.present(addr)
        })

        expect(screen.getByTestId("COLLECTION_ACTIONS_BS_REPORT")).toBeVisible()

        await act(() => {
            fireEvent.press(screen.getByTestId("COLLECTION_ACTIONS_BS_REPORT"))
        })

        expect(navigateWithTab).toHaveBeenCalled()
        expect(spiedClose).toHaveBeenCalled()
    })

    it("should open block & report when block is clicked", async () => {
        const bsRef = { current: { present: jest.fn(), close: jest.fn() } } as any
        const addr = ethers.Wallet.createRandom().address
        const onOpenReport = jest.fn()

        render(<CollectionActionsBottomSheet bsRef={bsRef} onOpenHidden={jest.fn()} onOpenReport={onOpenReport} />, {
            wrapper: TestWrapper,
        })

        const spiedClose = jest.spyOn(bsRef.current, "close")

        await act(() => {
            bsRef.current.present(addr)
        })

        expect(screen.getByTestId("COLLECTION_ACTIONS_BS_REPORT_BLOCK")).toBeVisible()

        await act(() => {
            fireEvent.press(screen.getByTestId("COLLECTION_ACTIONS_BS_REPORT_BLOCK"))
        })

        expect(spiedClose).toHaveBeenCalled()
        jest.advanceTimersByTime(500)
        expect(onOpenReport).toHaveBeenCalled()
    })
})
