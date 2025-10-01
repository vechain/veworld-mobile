import React from "react"
import { render, screen } from "@testing-library/react-native"
import { ActivityDetailsScreen } from "./ActivityDetailsScreen"
import { ActivityStatus, ActivityType, NETWORK_TYPE } from "~Model"
import { Routes } from "~Navigation"
import { TestHelpers, TestWrapper } from "~Test"
import { RootState } from "~Storage/Redux/Types"
import { DappTransactionDetails } from "./Components/DappTransactionDetails"

jest.mock("react-native-localize", () => ({
    getTimeZone: () => "UTC",
}))

jest.mock("expo-camera", () => ({
    CameraView: () => null,
}))

const { mockDappTxActivity, mockDappTxActivityNoBlock } = TestHelpers.data

const createPreloadedState = (): Partial<RootState> => ({
    tokens: {
        tokens: {
            [NETWORK_TYPE.MAIN]: {
                custom: {},
                officialTokens: [],
                suggestedTokens: [],
            },
            [NETWORK_TYPE.TEST]: {
                custom: {},
                officialTokens: [],
                suggestedTokens: [],
            },
            [NETWORK_TYPE.SOLO]: {
                custom: {},
                officialTokens: [],
                suggestedTokens: [],
            },
            [NETWORK_TYPE.OTHER]: {
                custom: {},
                officialTokens: [],
                suggestedTokens: [],
            },
        },
    },
})

const createWrapper = ({ children }: { children: React.ReactNode }) => {
    return <TestWrapper preloadedState={createPreloadedState()}>{children}</TestWrapper>
}

const createMockRoute = (activity: any, isSwap: boolean = false, token: any = null) => ({
    params: { activity, token, isSwap },
    key: "test-key",
    name: Routes.ACTIVITY_DETAILS as const,
})

const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => true,
    getState: () => ({
        routes: [{ name: "ActivityDetails" }],
        index: 0,
    }),
} as any

describe("ActivityDetailsScreen Logic Tests", () => {
    describe("ActivityDetailsScreen Component - Real Logic Testing", () => {
        it("should render ActivityDetailsScreen and test activityStatus logic with SUCCESS status", () => {
            const activity = { ...mockDappTxActivity, status: ActivityStatus.SUCCESS }
            const route = createMockRoute(activity)

            render(<ActivityDetailsScreen route={route} navigation={mockNavigation} />, { wrapper: createWrapper })

            expect(screen.getByTestId("Activity_Details_Screen")).toBeTruthy()
            expect(screen.getByText("Details")).toBeTruthy()

            expect(screen.queryByText("Failed")).toBeNull()
            expect(screen.queryByText("Pending")).toBeNull()

            expect(screen.getByText("Status")).toBeTruthy()
        })

        it("should render ActivityDetailsScreen and test activityStatus logic with REVERTED status", () => {
            const activity = { ...mockDappTxActivity, status: ActivityStatus.REVERTED }
            const route = createMockRoute(activity)

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <ActivityDetailsScreen route={route} navigation={mockNavigation} />
                </TestWrapper>,
            )

            expect(screen.getByTestId("Activity_Details_Screen")).toBeTruthy()
            expect(screen.getByText("Details")).toBeTruthy()

            expect(screen.getByText("Failed")).toBeTruthy()

            expect(screen.getByText("Status")).toBeTruthy()
        })

        it("should render ActivityDetailsScreen and test activityStatus logic with PENDING status", () => {
            const activity = { ...mockDappTxActivity, status: ActivityStatus.PENDING }
            const route = createMockRoute(activity)

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <ActivityDetailsScreen route={route} navigation={mockNavigation} />
                </TestWrapper>,
            )

            expect(screen.getByTestId("Activity_Details_Screen")).toBeTruthy()
            expect(screen.getByText("Details")).toBeTruthy()

            expect(screen.getByText("Pending")).toBeTruthy()

            expect(screen.getByText("Status")).toBeTruthy()
        })

        it("should render ActivityDetailsScreen and test explorer button logic with txId and blockNumber", () => {
            const activity = {
                ...mockDappTxActivity,
                txId: "0x123456789abcdef",
                blockNumber: 12345,
                status: ActivityStatus.SUCCESS,
            }
            const route = createMockRoute(activity)

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <ActivityDetailsScreen route={route} navigation={mockNavigation} />
                </TestWrapper>,
            )

            expect(screen.getByTestId("Activity_Details_Screen")).toBeTruthy()
            expect(screen.getByTestId("view-on-explorer-button")).toBeTruthy()
        })

        it("should render ActivityDetailsScreen and test explorer button logic without blockNumber", () => {
            const activity = {
                ...mockDappTxActivityNoBlock,
                txId: "0x123456789abcdef",
                blockNumber: undefined,
                status: ActivityStatus.SUCCESS,
            }
            const route = createMockRoute(activity)

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <ActivityDetailsScreen route={route} navigation={mockNavigation} />
                </TestWrapper>,
            )

            expect(screen.getByTestId("Activity_Details_Screen")).toBeTruthy()
            expect(screen.queryByTestId("view-on-explorer-button")).toBeNull()
        })

        it("should render ActivityDetailsScreen and test swap logic with B3TR_SWAP_B3TR_TO_VOT3", () => {
            const swapActivity = {
                ...mockDappTxActivity,
                type: ActivityType.B3TR_SWAP_B3TR_TO_VOT3,
                value: "1000000000000000000",
                status: ActivityStatus.SUCCESS,
            }
            const route = createMockRoute(swapActivity, true)

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <ActivityDetailsScreen route={route} navigation={mockNavigation} />
                </TestWrapper>,
            )

            expect(screen.getByTestId("Activity_Details_Screen")).toBeTruthy()
            expect(screen.getByText("Details")).toBeTruthy()
        })

        it("should render ActivityDetailsScreen and test swap logic with B3TR_SWAP_VOT3_TO_B3TR", () => {
            const swapActivity = {
                ...mockDappTxActivity,
                type: ActivityType.B3TR_SWAP_VOT3_TO_B3TR,
                value: "2000000000000000000",
                status: ActivityStatus.SUCCESS,
            }
            const route = createMockRoute(swapActivity, true)

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <ActivityDetailsScreen route={route} navigation={mockNavigation} />
                </TestWrapper>,
            )

            expect(screen.getByTestId("Activity_Details_Screen")).toBeTruthy()
            expect(screen.getByText("Details")).toBeTruthy()
        })

        it("should render ActivityDetailsScreen and test swap logic with generic SWAP_FT_TO_FT", () => {
            const swapActivity = {
                ...mockDappTxActivity,
                type: ActivityType.SWAP_FT_TO_FT,
                inputToken: "0x123",
                inputValue: "1000000000000000000",
                outputToken: "0x456",
                outputValue: "2000000000000000000",
                status: ActivityStatus.SUCCESS,
            }
            const route = createMockRoute(swapActivity, true)

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <ActivityDetailsScreen route={route} navigation={mockNavigation} />
                </TestWrapper>,
            )

            expect(screen.getByTestId("Activity_Details_Screen")).toBeTruthy()
            expect(screen.getByText("Details")).toBeTruthy()
        })

        it("should render ActivityDetailsScreen and test non-swap activity logic", () => {
            const activity = {
                ...mockDappTxActivity,
                type: ActivityType.TRANSFER_FT,
                status: ActivityStatus.SUCCESS,
            }
            const route = createMockRoute(activity, false)

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <ActivityDetailsScreen route={route} navigation={mockNavigation} />
                </TestWrapper>,
            )

            expect(screen.getByTestId("Activity_Details_Screen")).toBeTruthy()
            expect(screen.getByText("Details")).toBeTruthy()
        })

        it("should render ActivityDetailsScreen and test activityFromStore priority logic", () => {
            const activity = { ...mockDappTxActivity, status: ActivityStatus.SUCCESS }
            const activityFromStore = { ...activity, status: ActivityStatus.PENDING }

            const stateWithStore = {
                ...createPreloadedState(),
                activities: {
                    activities: [activityFromStore],
                },
            }
            const route = createMockRoute(activity)

            render(
                <TestWrapper preloadedState={stateWithStore}>
                    <ActivityDetailsScreen route={route} navigation={mockNavigation} />
                </TestWrapper>,
            )

            expect(screen.getByTestId("Activity_Details_Screen")).toBeTruthy()
            expect(screen.getByText("Details")).toBeTruthy()
        })
    })
    describe("Activity Status Logic - Real Component Behavior", () => {
        it("should show 'Failed' when status is REVERTED and no blockNumber", () => {
            const activity = { ...mockDappTxActivityNoBlock, status: ActivityStatus.REVERTED }

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <DappTransactionDetails
                        activity={activity}
                        status={ActivityStatus.REVERTED}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Failed")).toBeTruthy()
        })

        it("should show 'Reverted' when status is REVERTED and has blockNumber", () => {
            const activity = { ...mockDappTxActivity, status: ActivityStatus.REVERTED }

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <DappTransactionDetails
                        activity={activity}
                        status={ActivityStatus.REVERTED}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Reverted")).toBeTruthy()
        })

        it("should show 'Success' when status is SUCCESS", () => {
            const activity = { ...mockDappTxActivity, status: ActivityStatus.SUCCESS }

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <DappTransactionDetails
                        activity={activity}
                        status={ActivityStatus.SUCCESS}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Success")).toBeTruthy()
        })

        it("should show 'Pending' when status is PENDING", () => {
            const activity = { ...mockDappTxActivity, status: ActivityStatus.PENDING }

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <DappTransactionDetails
                        activity={activity}
                        status={ActivityStatus.PENDING}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Pending")).toBeTruthy()
        })
    })

    describe("Explorer Button Logic - Real Component Behavior", () => {
        it("should show transaction details when activity has blockNumber", () => {
            const activity = { ...mockDappTxActivity, blockNumber: 12345 }

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <DappTransactionDetails
                        activity={activity}
                        status={ActivityStatus.SUCCESS}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Gas fee")).toBeTruthy()
            expect(screen.getByText("Transaction ID")).toBeTruthy()
            expect(screen.getByText("Block number")).toBeTruthy()
        })

        it("should hide transaction details when activity has no blockNumber", () => {
            const activity = { ...mockDappTxActivityNoBlock, blockNumber: undefined }

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <DappTransactionDetails
                        activity={activity}
                        status={ActivityStatus.SUCCESS}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.queryByText("Gas fee")).toBeNull()
            expect(screen.queryByText("Transaction ID")).toBeNull()
            expect(screen.queryByText("Block number")).toBeNull()
        })
    })

    describe("Real Component Integration - Different Status Scenarios", () => {
        it("should show different behavior for SUCCESS vs REVERTED status", () => {
            const { unmount } = render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <DappTransactionDetails
                        activity={mockDappTxActivity}
                        status={ActivityStatus.SUCCESS}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.queryByText("Failed")).toBeNull()
            expect(screen.queryByText("Reverted")).toBeNull()

            unmount()

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <DappTransactionDetails
                        activity={mockDappTxActivity}
                        status={ActivityStatus.REVERTED}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Reverted")).toBeTruthy()
        })
    })

    describe("Real Component Integration - Different BlockNumber Scenarios", () => {
        it("should show different behavior with vs without blockNumber", () => {
            const { unmount } = render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <DappTransactionDetails
                        activity={mockDappTxActivityNoBlock}
                        status={ActivityStatus.SUCCESS}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.queryByText("Gas fee")).toBeNull()
            expect(screen.queryByText("Transaction ID")).toBeNull()

            unmount()

            render(
                <TestWrapper preloadedState={createPreloadedState()}>
                    <DappTransactionDetails
                        activity={mockDappTxActivity}
                        status={ActivityStatus.SUCCESS}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Gas fee")).toBeTruthy()
            expect(screen.getByText("Transaction ID")).toBeTruthy()
            expect(screen.getByText("Block number")).toBeTruthy()
        })
    })
})
