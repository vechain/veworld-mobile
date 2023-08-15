import { renderHook } from "@testing-library/react-hooks"
import { useDelegation } from "~Hooks"
import { TestHelpers, TestWrapper } from "~Test"
import { DelegationType } from "~Model/Delegation"
import {
    getDefaultDelegationAccount,
    getDefaultDelegationOption,
    getDefaultDelegationUrl,
} from "~Storage/Redux"

const { account1D1, device1 } = TestHelpers.data
const setGasPayer = jest.fn()

jest.mock("~Storage/Redux/Selectors", () => ({
    ...jest.requireActual("~Storage/Redux/Selectors"),
    getDefaultDelegationOption: jest.fn(),
    getDefaultDelegationAccount: jest.fn(),
    getDefaultDelegationUrl: jest.fn(),
}))

describe("useDelegation", () => {
    beforeEach(() => {
        jest.resetAllMocks()
        // @ts-ignore
        ;(getDefaultDelegationOption as jest.Mock).mockReturnValue(
            DelegationType.NONE,
        )
        // @ts-ignore
        ;(getDefaultDelegationAccount as jest.Mock).mockReturnValue(undefined)

        // @ts-ignore
        ;(getDefaultDelegationUrl as jest.Mock).mockReturnValue(undefined)
    })

    it("should render", async () => {
        const { result } = renderHook(() => useDelegation({ setGasPayer }), {
            wrapper: TestWrapper,
        })

        expect(result.current).toEqual({
            setSelectedDelegationUrl: expect.any(Function),
            setSelectedDelegationAccount: expect.any(Function),
            setNoDelegation: expect.any(Function),
            selectedDelegationOption: DelegationType.NONE,
            selectedDelegationAccount: undefined,
            selectedDelegationUrl: undefined,
            isDelegated: false,
        })
    })

    it("should set selected delegation url", async () => {
        const url = "https://test.com"

        const { result } = renderHook(() => useDelegation({ setGasPayer }), {
            wrapper: TestWrapper,
        })

        await result.current.setSelectedDelegationUrl(url)

        expect(result.current.isDelegated).toBeTruthy()
        expect(result.current.selectedDelegationOption).toEqual(
            DelegationType.URL,
        )
        expect(result.current.selectedDelegationUrl).toEqual(url)
    })

    it("should set selected delegation account", async () => {
        const account = {
            ...account1D1,
            device: device1,
        }

        const { result } = renderHook(() => useDelegation({ setGasPayer }), {
            wrapper: TestWrapper,
        })

        await result.current.setSelectedDelegationAccount({
            ...account1D1,
            device: device1,
        })

        expect(result.current.isDelegated).toBeTruthy()
        expect(result.current.selectedDelegationOption).toEqual(
            DelegationType.ACCOUNT,
        )
        expect(result.current.selectedDelegationAccount).toEqual(account)
    })

    it("changing from URL to account should reset URL", async () => {
        const url = "https://test.com"
        const account = {
            ...account1D1,
            device: device1,
        }

        const { result } = renderHook(() => useDelegation({ setGasPayer }), {
            wrapper: TestWrapper,
        })

        await result.current.setSelectedDelegationUrl(url)
        await result.current.setSelectedDelegationAccount(account)

        expect(result.current.isDelegated).toBeTruthy()
        expect(result.current.selectedDelegationOption).toEqual(
            DelegationType.ACCOUNT,
        )
        expect(result.current.selectedDelegationAccount).toEqual(account)
        expect(result.current.selectedDelegationUrl).toBeUndefined()
    })

    it("using provided URL should automatically set delegation option", async () => {
        const url = "https://test.com"

        const { result } = renderHook(
            () => useDelegation({ setGasPayer, providedUrl: url }),
            {
                wrapper: TestWrapper,
            },
        )

        expect(result.current.isDelegated).toBeTruthy()
        expect(result.current.selectedDelegationOption).toEqual(
            DelegationType.URL,
        )
        expect(result.current.selectedDelegationUrl).toEqual(url)
    })

    it("should reset all delegation", async () => {
        const { result } = renderHook(() => useDelegation({ setGasPayer }), {
            wrapper: TestWrapper,
        })

        result.current.setSelectedDelegationUrl("https://test.com")

        expect(result.current.isDelegated).toBeTruthy()
        expect(result.current.selectedDelegationUrl).toEqual("https://test.com")

        result.current.setNoDelegation()

        expect(result.current.isDelegated).toBeFalsy()
        expect(result.current.selectedDelegationOption).toEqual(
            DelegationType.NONE,
        )
        expect(result.current.selectedDelegationAccount).toBeUndefined()
        expect(result.current.selectedDelegationUrl).toBeUndefined()
    })

    it("getDefaultDelegationAccount should auto set delegation account", async () => {
        const account = {
            ...account1D1,
            device: device1,
        }

        // @ts-ignore
        ;(getDefaultDelegationAccount as jest.Mock).mockReturnValue(account)
        // @ts-ignore
        ;(getDefaultDelegationOption as jest.Mock).mockReturnValue(
            DelegationType.ACCOUNT,
        )

        const { result } = renderHook(() => useDelegation({ setGasPayer }), {
            wrapper: TestWrapper,
        })

        expect(result.current.isDelegated).toBeTruthy()
        expect(result.current.selectedDelegationOption).toEqual(
            DelegationType.ACCOUNT,
        )
        expect(result.current.selectedDelegationAccount).toEqual(account)
    })

    it("getDefaultDelegationUrl should auto set delegation url", async () => {
        const url = "https://test.com"

        // @ts-ignore
        ;(getDefaultDelegationUrl as jest.Mock).mockReturnValue(url)
        // @ts-ignore
        ;(getDefaultDelegationOption as jest.Mock).mockReturnValue(
            DelegationType.URL,
        )

        const { result } = renderHook(() => useDelegation({ setGasPayer }), {
            wrapper: TestWrapper,
        })

        expect(result.current.isDelegated).toBeTruthy()
        expect(result.current.selectedDelegationOption).toEqual(
            DelegationType.URL,
        )
        expect(result.current.selectedDelegationUrl).toEqual(url)
    })
})
