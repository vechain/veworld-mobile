import { act, renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { ethers } from "ethers"
import { TESTNET_NETWORK } from "@vechain/sdk-core"

import { LoginSession } from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"
import { useLoginSession } from "./useLoginSession"
import { NETWORK_TYPE } from "~Model"

const addSession = jest.fn().mockImplementation(payload => ({ type: "discovery/addSession", payload }))
jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    addSession: (...args: any[]) => addSession(...args),
}))

const createDiscoveryState = (...sessions: LoginSession[]): Partial<RootState> => {
    return {
        discovery: {
            bannerInteractions: {},
            connectedApps: [],
            custom: [],
            favorites: [],
            featured: [],
            hasOpenedDiscovery: false,
            tabsManager: {
                currentTabId: null,
                tabs: [],
            },
            isNormalUser: true,
            sessions: Object.fromEntries(sessions.map(session => [session.url, session])),
        },
        networks: {
            customNetworks: [],
            hardfork: {},
            isNodeError: false,
            selectedNetwork: NETWORK_TYPE.TEST,
            showConversionOtherNets: false,
            showTestNetTag: false,
        },
    }
}

describe("useLoginSession", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    describe("getLoginSession", () => {
        const session = {
            address: ethers.Wallet.createRandom().address,
            genesisId: TESTNET_NETWORK.genesisBlock.id,
            kind: "external",
            name: "TEST",
            url: "https://vechain.org",
            replaceable: false,
        } as const
        it("should be able to get a login session", () => {
            const state = createDiscoveryState(session)
            const { result } = renderHook(() => useLoginSession(), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: state,
                },
            })

            expect(
                result.current.getLoginSession("https://vechain.org/test", TESTNET_NETWORK.genesisBlock.id),
            ).toHaveProperty("name", "TEST")
        })

        it("should return any session if genesis id is not specified", () => {
            const state = createDiscoveryState(session)
            const { result } = renderHook(() => useLoginSession(), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: state,
                },
            })

            expect(result.current.getLoginSession("https://vechain.org/test")).toHaveProperty("name", "TEST")
        })

        it("should return undefined if not found", () => {
            const state = createDiscoveryState(session)
            const { result } = renderHook(() => useLoginSession(), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: state,
                },
            })

            expect(result.current.getLoginSession("https://docs.vechain.org")).toBeUndefined()
        })
    })
    describe("createSessionIfNotExists", () => {
        const session = {
            address: ethers.Wallet.createRandom().address,
            genesisId: TESTNET_NETWORK.genesisBlock.id,
            kind: "external",
            name: "TEST",
            url: "https://vechain.org",
            replaceable: false,
        } as const
        it("should skip creating a session if it is not an in-app request", () => {
            const state = createDiscoveryState(session)
            const { result } = renderHook(() => useLoginSession(), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: state,
                },
            })

            result.current.createSessionIfNotExists({ type: "wallet-connect" } as any)

            expect(addSession).not.toHaveBeenCalled()
        })
        it("should skip creating a session if a session already exists and it is not replaceable", () => {
            const state = createDiscoveryState(session)
            const { result } = renderHook(() => useLoginSession(), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: state,
                },
            })

            result.current.createSessionIfNotExists({
                type: "in-app",
                appName: "TEST",
                appUrl: session.url,
                method: "thor_signCertificate",
                id: "0x1",
                message: { payload: { type: "text", content: "TEST CONTENT" }, purpose: "identification" },
                options: {},
            })

            expect(addSession).not.toHaveBeenCalled()
        })

        it("should create a session if a session already exists and it is replaceable", async () => {
            const state = createDiscoveryState({ ...session, replaceable: true })
            const { result } = renderHook(() => useLoginSession(), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: state,
                },
            })

            await act(async () => {
                result.current.createSessionIfNotExists({
                    type: "in-app",
                    appName: "TEST",
                    appUrl: session.url,
                    method: "thor_signCertificate",
                    id: "0x1",
                    message: { payload: { type: "text", content: "TEST CONTENT" }, purpose: "identification" },
                    options: {},
                })
            })

            expect(addSession).toHaveBeenCalled()
        })

        it("should create a session if a session does not exist", async () => {
            const state = createDiscoveryState()
            const { result } = renderHook(() => useLoginSession(), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: state,
                },
            })

            await act(async () => {
                result.current.createSessionIfNotExists({
                    type: "in-app",
                    appName: "TEST",
                    appUrl: session.url,
                    method: "thor_signCertificate",
                    id: "0x1",
                    message: { payload: { type: "text", content: "TEST CONTENT" }, purpose: "identification" },
                    options: {},
                })
            })

            expect(addSession).toHaveBeenCalled()
        })
    })
})
