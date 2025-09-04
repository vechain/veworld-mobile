import { renderHook, act } from "@testing-library/react-hooks"
import * as FileSystem from "expo-file-system"
import { useTabManagement } from "./useTabManagement"

jest.mock("expo-file-system", () => ({
    documentDirectory: "file:///test/documents/",
    getInfoAsync: jest.fn(),
    deleteAsync: jest.fn(),
    makeDirectoryAsync: jest.fn(),
}))

const mockDispatch = jest.fn()
const mockTabs = [
    { id: "tab-1", href: "https://example1.com", title: "Tab 1" },
    { id: "tab-2", href: "https://example2.com", title: "Tab 2" },
    { id: "tab-3", href: "https://example3.com", title: "Tab 3" },
]

jest.mock("~Storage/Redux", () => ({
    closeTab: jest.fn(id => ({ type: "discovery/closeTab", payload: id })),
    closeAllTabs: jest.fn(() => ({ type: "discovery/closeAllTabs" })),
    useAppDispatch: () => mockDispatch,
    useAppSelector: () => mockTabs,
    selectTabs: jest.fn(),
}))

describe("useTabManagement", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true })
        ;(FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined)
        ;(FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined)
    })

    it("should return tabs from Redux store", () => {
        const { result } = renderHook(() => useTabManagement())

        expect(result.current.tabs).toEqual(mockTabs)
    })

    describe("closeTab", () => {
        it("should delete screenshot file and dispatch closeTab action", async () => {
            const { result } = renderHook(() => useTabManagement())
            const tabId = "tab-1"

            await act(async () => {
                await result.current.closeTab(tabId)
            })

            // Check screenshot deletion
            expect(FileSystem.getInfoAsync).toHaveBeenCalledWith("file:///test/documents/screenshots/tab-1-preview.jpg")
            expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
                "file:///test/documents/screenshots/tab-1-preview.jpg",
                { idempotent: true },
            )

            // Check Redux dispatch
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "discovery/closeTab",
                payload: tabId,
            })
        })

        it("should still dispatch action even if screenshot doesn't exist", async () => {
            ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false })

            const { result } = renderHook(() => useTabManagement())
            const tabId = "tab-2"

            await act(async () => {
                await result.current.closeTab(tabId)
            })

            expect(FileSystem.getInfoAsync).toHaveBeenCalled()
            expect(FileSystem.deleteAsync).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "discovery/closeTab",
                payload: tabId,
            })
        })

        it("should handle screenshot deletion errors gracefully", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation()
            ;(FileSystem.deleteAsync as jest.Mock).mockRejectedValue(new Error("Permission denied"))

            const { result } = renderHook(() => useTabManagement())
            const tabId = "tab-3"

            await act(async () => {
                await result.current.closeTab(tabId)
            })

            // Should still dispatch the action despite error
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "discovery/closeTab",
                payload: tabId,
            })

            consoleLogSpy.mockRestore()
        })
    })

    describe("closeAllTabs", () => {
        it("should delete all screenshots and dispatch closeAllTabs action", async () => {
            const { result } = renderHook(() => useTabManagement())

            await act(async () => {
                await result.current.closeAllTabs()
            })

            // Check directory operations
            expect(FileSystem.getInfoAsync).toHaveBeenCalledWith("file:///test/documents/screenshots/")
            expect(FileSystem.deleteAsync).toHaveBeenCalledWith("file:///test/documents/screenshots/", {
                idempotent: true,
            })
            expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith("file:///test/documents/screenshots/", {
                intermediates: true,
            })

            // Check Redux dispatch
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "discovery/closeAllTabs",
            })
        })

        it("should still dispatch action even if screenshots directory doesn't exist", async () => {
            ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false })

            const { result } = renderHook(() => useTabManagement())

            await act(async () => {
                await result.current.closeAllTabs()
            })

            expect(FileSystem.getInfoAsync).toHaveBeenCalled()
            expect(FileSystem.deleteAsync).not.toHaveBeenCalled()
            expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "discovery/closeAllTabs",
            })
        })

        it("should handle directory deletion errors gracefully", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation()
            ;(FileSystem.deleteAsync as jest.Mock).mockRejectedValue(new Error("Directory not empty"))

            const { result } = renderHook(() => useTabManagement())

            await act(async () => {
                await result.current.closeAllTabs()
            })

            // Should still dispatch the action despite error
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "discovery/closeAllTabs",
            })

            consoleLogSpy.mockRestore()
        })

        it("should handle directory creation errors gracefully", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation()
            ;(FileSystem.makeDirectoryAsync as jest.Mock).mockRejectedValue(new Error("Permission denied"))

            const { result } = renderHook(() => useTabManagement())

            await act(async () => {
                await result.current.closeAllTabs()
            })

            // Should still dispatch the action despite error
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "discovery/closeAllTabs",
            })

            consoleLogSpy.mockRestore()
        })
    })
})
