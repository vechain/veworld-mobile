import { act, renderHook } from "@testing-library/react-native"
import { Share } from "react-native"
import { captureRef, releaseCapture } from "react-native-view-shot"
import { useShareVeBetterCard } from "./useShareVeBetterCard"

jest.mock("react-native-view-shot")
jest.mock("react-native/Libraries/Share/Share", () => ({
    share: jest.fn(),
}))

describe("useShareVeBetterCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("GIVEN the hook is initialized", () => {
        describe("WHEN the hook is rendered", () => {
            it("THEN it should return cardRef, shareCard function, and isSharing state", () => {
                const { result } = renderHook(() => useShareVeBetterCard())

                expect(result.current.cardRef).toBeDefined()
                expect(result.current.shareCard).toBeInstanceOf(Function)
                expect(result.current.isSharing).toBe(false)
            })
        })
    })

    describe("GIVEN the shareCard function is called", () => {
        describe("WHEN cardRef is not set", () => {
            it("THEN it should not capture or share", async () => {
                const { result } = renderHook(() => useShareVeBetterCard())

                await act(async () => {
                    await result.current.shareCard()
                })

                expect(captureRef).not.toHaveBeenCalled()
                expect(Share.share).not.toHaveBeenCalled()
            })
        })

        describe("WHEN cardRef is set and capture succeeds", () => {
            it("THEN it should capture the view and share it", async () => {
                const mockUri = "file:///path/to/screenshot.png"
                ;(captureRef as jest.Mock).mockResolvedValue(mockUri)
                ;(Share.share as jest.Mock).mockResolvedValue({ action: "sharedAction" })

                const { result } = renderHook(() => useShareVeBetterCard())
                const mockRef = { current: {} as any }
                result.current.cardRef.current = mockRef.current

                await act(async () => {
                    await result.current.shareCard()
                })

                expect(captureRef).toHaveBeenCalledWith(result.current.cardRef, {
                    format: "png",
                    quality: 1,
                    result: "tmpfile",
                })
                expect(Share.share).toHaveBeenCalledWith({
                    url: mockUri,
                    message: "Check out my VeBetterDAO impact! 🌱",
                })
                expect(releaseCapture).toHaveBeenCalledWith(mockUri)
                expect(result.current.isSharing).toBe(false)
            })
        })

        describe("WHEN capture fails", () => {
            it("THEN it should handle the error gracefully", async () => {
                const error = new Error("Capture failed")
                ;(captureRef as jest.Mock).mockRejectedValue(error)

                const { result } = renderHook(() => useShareVeBetterCard())
                const mockRef = { current: {} as any }
                result.current.cardRef.current = mockRef.current

                await act(async () => {
                    await result.current.shareCard()
                })

                expect(captureRef).toHaveBeenCalled()
                expect(Share.share).not.toHaveBeenCalled()
                expect(result.current.isSharing).toBe(false)
            })
        })

        describe("WHEN user cancels the share", () => {
            it("THEN it should clean up resources without logging error", async () => {
                const mockUri = "file:///path/to/screenshot.png"
                ;(captureRef as jest.Mock).mockResolvedValue(mockUri)
                ;(Share.share as jest.Mock).mockRejectedValue(new Error("User did not share"))

                const { result } = renderHook(() => useShareVeBetterCard())
                const mockRef = { current: {} as any }
                result.current.cardRef.current = mockRef.current

                await act(async () => {
                    await result.current.shareCard()
                })

                expect(releaseCapture).toHaveBeenCalledWith(mockUri)
                expect(result.current.isSharing).toBe(false)
            })
        })

        describe("WHEN shareCard is called while already sharing", () => {
            it("THEN it should not attempt to share again", async () => {
                const mockUri = "file:///path/to/screenshot.png"
                ;(captureRef as jest.Mock).mockImplementation(
                    () =>
                        new Promise(resolve => {
                            setTimeout(() => resolve(mockUri), 100)
                        }),
                )

                const { result } = renderHook(() => useShareVeBetterCard())
                const mockRef = { current: {} as any }
                result.current.cardRef.current = mockRef.current

                const promise1 = act(async () => {
                    await result.current.shareCard()
                })
                const promise2 = act(async () => {
                    await result.current.shareCard()
                })

                await Promise.all([promise1, promise2])

                expect(captureRef).toHaveBeenCalledTimes(1)
            })
        })
    })
})
