import { act, render, screen, waitFor } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"

import { useQrScanDetection } from "~Hooks/useQrScanDetection"

import { useCodeScanner } from "react-native-vision-camera"
import { SendReceiveBottomSheet } from "./SendReceiveBottomSheet"

jest.mock("~Hooks/useQrScanDetection", () => ({
    useQrScanDetection: jest.fn(),
}))

jest.mock("expo-camera", () => ({
    Camera: {
        getCameraPermissionsAsync: jest.fn().mockResolvedValue(true),
    },
    CameraType: {
        back: "back",
    },
}))

describe("SendReceiveBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    describe("Scan", () => {
        it("should close automatically the BS when scanning returns true", async () => {
            ;(useQrScanDetection as jest.Mock).mockImplementation(args => args.onScan)
            ;(useCodeScanner as jest.Mock).mockImplementation(args => {
                ;(args as any).onCodeScanned()
                return args
            })

            const ref = {
                current: { present: jest.fn(), close: jest.fn() },
            }
            const onScan = jest.fn().mockResolvedValue(true)
            render(<SendReceiveBottomSheet ref={ref as any} onScan={onScan} />, { wrapper: TestWrapper })

            const spiedClose = jest.spyOn(ref.current, "close")

            await act(() => {
                ref.current.present({ tabs: ["scan"], defaultTab: "scan" })
            })

            expect(screen.queryByTestId("SEND_RECEIVE_BS_WC_SUPPORTED")).toBeNull()

            await waitFor(() => {
                expect(spiedClose).toHaveBeenCalled()
            })
        })
        it("should not close automatically the BS when scanning returns false", async () => {
            ;(useQrScanDetection as jest.Mock).mockImplementation(args => args.onScan)
            ;(useCodeScanner as jest.Mock).mockImplementation(args => {
                ;(args as any).onCodeScanned()
                return args
            })

            const ref = {
                current: { present: jest.fn(), close: jest.fn() },
            }
            const onScan = jest.fn().mockResolvedValue(false)
            render(<SendReceiveBottomSheet ref={ref as any} onScan={onScan} />, { wrapper: TestWrapper })

            const spiedClose = jest.spyOn(ref.current, "close")

            await act(() => {
                ref.current.present({ tabs: ["scan"], defaultTab: "scan" })
            })

            await waitFor(() => {
                expect(onScan).toHaveBeenCalled()
                expect(spiedClose).not.toHaveBeenCalled()
            })
        })
        it("should show WC if it is a supported target", async () => {
            ;(useQrScanDetection as jest.Mock).mockImplementation(args => args.onScan)
            ;(useCodeScanner as jest.Mock).mockImplementation(args => args)

            const ref = {
                current: { present: jest.fn(), close: jest.fn() },
            }
            const onScan = jest.fn().mockResolvedValue(false)
            render(<SendReceiveBottomSheet ref={ref as any} onScan={onScan} hasWCTarget />, { wrapper: TestWrapper })

            await act(() => {
                ref.current.present({ tabs: ["scan"], defaultTab: "scan" })
            })

            expect(screen.getByTestId("SEND_RECEIVE_BS_WC_SUPPORTED")).toBeVisible()
        })
    })
})
