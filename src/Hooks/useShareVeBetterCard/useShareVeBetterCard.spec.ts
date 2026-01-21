import { act, renderHook } from "@testing-library/react-hooks"
import { Share } from "react-native"
import { captureRef, releaseCapture } from "react-native-view-shot"
import { TestWrapper } from "~Test"
import { useShareVeBetterCard } from "./useShareVeBetterCard"

jest.mock("react-native-view-shot")

const mockUri = "file:///path/to/screenshot.png"

describe("useShareVeBetterCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", () => {
        const { result } = renderHook(() => useShareVeBetterCard(), { wrapper: TestWrapper })

        expect(result.current.cardRef).toBeDefined()
        expect(result.current.shareCard).toBeInstanceOf(Function)
        expect(result.current.isSharing).toBe(false)
    })

    it("should not capture or share when cardRef is not set", async () => {
        const { result } = renderHook(() => useShareVeBetterCard(), { wrapper: TestWrapper })
        jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" })

        await result.current.shareCard()

        expect(captureRef).not.toHaveBeenCalled()
        expect(Share.share).not.toHaveBeenCalled()
    })

    it("should capture and share the view successfully", async () => {
        ;(captureRef as jest.Mock).mockResolvedValue(mockUri)
        jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" })

        const { result } = renderHook(() => useShareVeBetterCard(), { wrapper: TestWrapper })
        const mockRefValue = {} as any
        // @ts-ignore - Assigning to ref.current in tests
        result.current.cardRef.current = mockRefValue

        await result.current.shareCard()

        expect(captureRef).toHaveBeenCalledWith(result.current.cardRef, {
            format: "png",
            quality: 1,
            result: "tmpfile",
        })
        expect(Share.share).toHaveBeenCalledWith({
            url: mockUri,
            message: expect.any(String),
        })
        expect(releaseCapture).toHaveBeenCalledWith(mockUri)
        expect(result.current.isSharing).toBe(false)
    })

    it("should handle capture failure gracefully", async () => {
        const error = new Error("Capture failed")
        ;(captureRef as jest.Mock).mockRejectedValue(error)

        const { result } = renderHook(() => useShareVeBetterCard(), { wrapper: TestWrapper })
        const mockRefValue = {} as any
        // @ts-ignore - Assigning to ref.current in tests
        result.current.cardRef.current = mockRefValue

        await result.current.shareCard()

        expect(captureRef).toHaveBeenCalled()
        expect(Share.share).not.toHaveBeenCalled()
        expect(result.current.isSharing).toBe(false)
    })

    it("should clean up resources when user cancels share", async () => {
        ;(captureRef as jest.Mock).mockResolvedValue(mockUri)
        jest.spyOn(Share, "share").mockRejectedValue(new Error("User did not share"))

        const { result } = renderHook(() => useShareVeBetterCard(), { wrapper: TestWrapper })
        const mockRefValue = {} as any
        // @ts-ignore - Assigning to ref.current in tests
        result.current.cardRef.current = mockRefValue

        await result.current.shareCard()

        expect(releaseCapture).toHaveBeenCalledWith(mockUri)
        expect(result.current.isSharing).toBe(false)
    })

    it("should prevent duplicate share operations", async () => {
        jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" })
        ;(captureRef as jest.Mock).mockImplementation(
            () =>
                new Promise(resolve => {
                    setTimeout(() => resolve(mockUri), 100)
                }),
        )

        const { result } = renderHook(() => useShareVeBetterCard(), { wrapper: TestWrapper })
        const mockRefValue = {} as any
        // @ts-ignore - Assigning to ref.current in tests
        result.current.cardRef.current = mockRefValue

        act(async () => {
            await result.current.shareCard()
            await result.current.shareCard()
        })

        expect(captureRef).toHaveBeenCalledTimes(1)
    })
})
