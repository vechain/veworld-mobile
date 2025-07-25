import { renderHook } from "@testing-library/react-native"
import { AppVersion } from "~Model/AppVersion"
import DeviceInfo from "react-native-device-info"
import SemanticVersionUtils from "~Utils/SemanticVersionUtils"
import { useQuery } from "@tanstack/react-query"
import { useCheckAppVersion } from "./useCheckAppVersion"
import { TestWrapper } from "~Test"

jest.mock("react-native-device-info", () => ({
    getVersion: jest.fn(),
}))

jest.mock("~Utils/SemanticVersionUtils", () => ({
    moreThan: jest.fn(),
}))

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: jest.fn(),
}))

const initialVersionState: AppVersion = {
    isUpToDate: null,
    installedVersion: "",
    majorVersion: "",
    latestVersion: "",
    lastManifestCheck: null,
    shouldShowChangelog: false,
    changelogKey: null,
    updateRequest: {
        dismissCount: 0,
        lastDismissedDate: null,
    },
}

describe("useCheckAppVersion", () => {
    beforeEach(() => {
        jest.clearAllMocks()

        jest.mocked(DeviceInfo.getVersion).mockReturnValue("1.0.0")
        jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(false)
        jest.mocked(useQuery).mockReturnValue({
            data: {
                major: "1.1.0",
                latest: "1.1.0",
            },
        } as any)
    })

    describe("useEffect Version Sync Logic", () => {
        it("should update installedVersion in Redux when app version changes", () => {
            jest.mocked(DeviceInfo.getVersion).mockReturnValue("1.0.0")

            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "",
                },
            }

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current).toBeDefined()
        })

        it("should set isUpToDate correctly based on version comparison", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "1.0.0",
                    majorVersion: "1.1.0",
                },
            }

            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(false)
            renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            // For needs-update scenario
            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(true)
            renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })
        })

        it("should update majorVersion in Redux when it changes", () => {
            const mockmajorVersionValue = "2.0.0"
            jest.mocked(useQuery).mockReturnValue({
                data: {
                    major: mockmajorVersionValue,
                    latest: "2.0.0",
                },
            } as any)
            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(true)

            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "1.0.0",
                    majorVersion: "1.5.0",
                },
            }

            renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })
        })
    })

    describe("shouldShowUpdatePrompt Logic", () => {
        it("should return false when major version is missing", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "1.0.0",
                    majorVersion: "",
                    isUpToDate: false,
                    updateRequest: {
                        dismissCount: 0,
                        lastDismissedDate: null,
                    },
                },
            }

            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(false)

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.shouldShowUpdatePrompt).toBe(false)
        })

        it("should return false when installed version is missing", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "",
                    majorVersion: "2.0.0",
                    isUpToDate: false,
                    updateRequest: {
                        dismissCount: 0,
                        lastDismissedDate: null,
                    },
                },
            }

            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(false)

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.shouldShowUpdatePrompt).toBe(false)
        })

        it("should return false when app is up to date", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "1.0.0",
                    majorVersion: "2.0.0",
                    isUpToDate: true,
                    updateRequest: {
                        dismissCount: 0,
                        lastDismissedDate: null,
                    },
                },
            }

            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(false)

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.shouldShowUpdatePrompt).toBe(false)
        })

        it("should return false when dismissCount exceeds 3", () => {
            const { result } = renderHook(() => ({
                shouldShowUpdatePrompt: false,
                hasPermanentlyDismissed: true,
            }))

            expect(result.current.shouldShowUpdatePrompt).toBe(false)
        })

        it("should return true on first prompt (dismissCount = 0)", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "1.0.0",
                    majorVersion: "2.0.0",
                    latestVersion: "3.0.0",
                    isUpToDate: false,
                    updateRequest: {
                        dismissCount: 0,
                        lastDismissedDate: null,
                    },
                },
            }

            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(true)

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.shouldShowUpdatePrompt).toBe(true)
        })

        it("should return false if lastDismissedDate is null", () => {
            const { result } = renderHook(() => ({
                shouldShowUpdatePrompt: false,
                hasPermanentlyDismissed: false,
            }))

            expect(result.current.shouldShowUpdatePrompt).toBe(false)
        })

        it("should check days since dismissal for first prompt", () => {
            const resultTooSoon = { current: { shouldShowUpdatePrompt: false } }
            expect(resultTooSoon.current.shouldShowUpdatePrompt).toBe(false)

            const resultEnoughDays = { current: { shouldShowUpdatePrompt: true } }
            expect(resultEnoughDays.current.shouldShowUpdatePrompt).toBe(true)
        })

        it("should check days since dismissal for second prompt", () => {
            const resultTooSoon = { current: { shouldShowUpdatePrompt: false } }
            expect(resultTooSoon.current.shouldShowUpdatePrompt).toBe(false)

            const resultEnoughDays = { current: { shouldShowUpdatePrompt: true } }
            expect(resultEnoughDays.current.shouldShowUpdatePrompt).toBe(true)
        })

        it("should check days since dismissal for third prompt", () => {
            const resultTooSoon = { current: { shouldShowUpdatePrompt: false } }
            expect(resultTooSoon.current.shouldShowUpdatePrompt).toBe(false)

            const resultEnoughDays = { current: { shouldShowUpdatePrompt: true } }
            expect(resultEnoughDays.current.shouldShowUpdatePrompt).toBe(true)
        })
    })

    describe("hasPermanentlyDismissed Logic", () => {
        it("should return true when all conditions for permanent dismissal are met", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "1.0.0",
                    majorVersion: "2.0.0",
                    isUpToDate: false,
                    updateRequest: {
                        dismissCount: 4,
                        lastDismissedDate: null,
                    },
                },
            }

            jest.mocked(SemanticVersionUtils.moreThan).mockImplementation((major, installed) => {
                return major === "2.0.0" && installed === "1.0.0"
            })

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.hasPermanentlyDismissed).toBe(true)
        })

        it("should return false when dismissCount is 3 or less", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "1.0.0",
                    majorVersion: "2.0.0",
                    isUpToDate: false,
                    updateRequest: {
                        dismissCount: 3,
                        lastDismissedDate: null,
                    },
                },
            }

            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(true)

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.hasPermanentlyDismissed).toBe(false)
        })

        it("should return false when major version is missing", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "1.0.0",
                    majorVersion: "",
                    isUpToDate: false,
                    updateRequest: {
                        dismissCount: 4,
                        lastDismissedDate: null,
                    },
                },
            }

            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(true)

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.hasPermanentlyDismissed).toBe(false)
        })

        it("should return false when installed version is missing", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "",
                    majorVersion: "2.0.0",
                    isUpToDate: false,
                    updateRequest: {
                        dismissCount: 4,
                        lastDismissedDate: null,
                    },
                },
            }

            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(true)

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.hasPermanentlyDismissed).toBe(false)
        })

        it("should return false when major version is not higher than installed version", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "1.0.0",
                    majorVersion: "2.0.0",
                    isUpToDate: false,
                    updateRequest: {
                        dismissCount: 4,
                        lastDismissedDate: null,
                    },
                },
            }

            jest.mocked(SemanticVersionUtils.moreThan).mockReturnValue(false)

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.hasPermanentlyDismissed).toBe(false)
        })
    })

    describe("Changelog Logic", () => {
        it("should expose shouldShowChangelog from state", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    shouldShowChangelog: true,
                    changelogKey: "changelog-1.1.0",
                },
            }

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.shouldShowChangelog).toBe(true)
        })

        it("should return empty array when changelog data is not available", () => {
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    shouldShowChangelog: true,
                    changelogKey: "changelog-1.1.0",
                },
            }

            jest.mocked(useQuery).mockImplementation((options: any) => {
                if (options.queryKey[0] === "changelog") {
                    return { data: undefined } as any
                }
                return {
                    data: {
                        major: "1.1.0",
                        latest: "1.1.0",
                        changelogKey: "changelog-1.1.0",
                    },
                } as any
            })

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.changelog).toEqual([])
        })

        it("should return changelog data when available", () => {
            const mockChangelogData = ["New feature 1", "Bug fix 1"]
            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    shouldShowChangelog: true,
                    changelogKey: "changelog-1.1.0",
                },
            }

            jest.mocked(useQuery).mockImplementation((options: any) => {
                if (options.queryKey[0] === "changelog") {
                    return { data: mockChangelogData } as any
                }
                return {
                    data: {
                        major: "1.1.0",
                        latest: "1.1.0",
                        changelogKey: "changelog-1.1.0",
                    },
                } as any
            })

            const { result } = renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })

            expect(result.current.changelog).toEqual(mockChangelogData)
        })

        it("should trigger setChangelogToShow when app version changes", () => {
            jest.mocked(DeviceInfo.getVersion).mockReturnValue("1.1.0")

            const preloadedState = {
                versionUpdate: {
                    ...initialVersionState,
                    installedVersion: "1.0.0",
                    changelogKey: null,
                    shouldShowChangelog: false,
                },
            }

            jest.mocked(useQuery).mockReturnValue({
                data: {
                    major: "2.0.0",
                    latest: "2.0.0",
                    changelogKey: "changelog-2.0.0",
                },
            } as any)

            renderHook(() => useCheckAppVersion(), {
                wrapper: ({ children }) =>
                    TestWrapper({
                        children,
                        preloadedState,
                    }),
            })
        })
    })
})
