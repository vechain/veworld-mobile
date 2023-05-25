import { renderHook, act } from "@testing-library/react-hooks"
import { Linking } from "react-native"
import { useCameraPermissions } from "."
import { Camera } from "expo-camera"
import { AppStateType } from "~Model"
import { AlertUtils } from "~Utils"

jest.mock("../useAppState", () => ({
    useAppState: () => [AppStateType.BACKGROUND, AppStateType.ACTIVE],
}))
jest.mock("react-native", () => ({
    AppState: jest.requireActual("react-native").AppState,
    Linking: {
        openSettings: jest.fn(),
    },
}))

jest.mock("~i18n", () => ({
    useI18nContext: jest.fn(() => ({
        LL: {
            TITLE_ALERT_CAMERA_PERMISSION: jest.fn(),
            SB_ALERT_CAMERA_PERMISSION: jest.fn(),
        },
    })),
}))

jest.mock("~Utils", () => ({
    AlertUtils: {
        showGoToSettingsAlert: jest.fn(),
    },
}))

describe("useCameraPermissions", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should return an object with the correct shape", async () => {
        const { result } = renderHook(() => useCameraPermissions())

        expect(result.current).toEqual(
            expect.objectContaining({
                checkPermissions: expect.any(Function),
                hasPerms: expect.any(Boolean),
                isCanceled: expect.any(Boolean),
            }),
        )
    })

    it("should request camera permissions when checkPermissions is called and the permissions have not been granted", async () => {
        const { result } = renderHook(() => useCameraPermissions())

        ;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
            granted: false,
            canAskAgain: true,
        })
        ;(
            Camera.requestCameraPermissionsAsync as jest.Mock
        ).mockResolvedValueOnce({
            granted: true,
        })

        await act(async () => {
            result.current.checkPermissions()
        })

        expect(Camera.getCameraPermissionsAsync).toHaveBeenCalled()
        expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled()
        expect(result.current.hasPerms).toBe(true)
    })

    it("should check if it has already permissions", async () => {
        const { result } = renderHook(() => useCameraPermissions())

        ;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
            granted: true,
            canAskAgain: true,
        })

        await act(async () => {
            result.current.checkPermissions()
        })

        expect(Camera.getCameraPermissionsAsync).toHaveBeenCalled()
        expect(result.current.hasPerms).toBe(true)
    })

    it("should show an alert when the user has denied camera permissions and cannot be prompted again", async () => {
        const { result } = renderHook(() => useCameraPermissions())
        ;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
            granted: false,
            canAskAgain: false,
        })
        let successFn: () => void = () => {}
        let cancelFn: () => void = () => {}
        ;(AlertUtils.showGoToSettingsAlert as jest.Mock).mockImplementation(
            (_title, _message, _cancel, _success) => {
                cancelFn = _cancel
                successFn = _success
            },
        )
        await act(async () => {
            result.current.checkPermissions()
        })
        act(() => {
            successFn()
            cancelFn()
        })

        expect(Camera.getCameraPermissionsAsync).toHaveBeenCalled()
        expect(Linking.openSettings).toHaveBeenCalled()
    })

    it("should show an alert prompting the user to go to settings when camera permissions have been denied but can be prompted again", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
            useCameraPermissions(),
        )

        ;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
            granted: false,
            canAskAgain: true,
        })

        await act(async () => {
            result.current.checkPermissions()
            await waitForNextUpdate()
        })

        expect(Camera.getCameraPermissionsAsync).toHaveBeenCalled()
        expect(Linking.openSettings).not.toHaveBeenCalled()
    })

    it("should show run checkPermissions", async () => {
        const { result } = renderHook(() => useCameraPermissions())
        jest.spyOn(result.current, "checkPermissions")
        await act(async () => {
            result.current.checkPermissions()
        })
        expect(result.current.checkPermissions).toHaveBeenCalled()
    })
})
