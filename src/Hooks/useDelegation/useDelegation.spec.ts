import { renderHook } from "@testing-library/react-hooks"
import { useDelegation } from "~Hooks"
import { TestHelpers, TestWrapper } from "~Test"
import { DelegationType } from "~Model/Delegation"

const { account1D1, device1 } = TestHelpers.data
const setGasPayer = jest.fn()

describe("useDelegation", () => {
    it("should render", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () => useDelegation({ setGasPayer }),
            {
                wrapper: TestWrapper,
            },
        )

        await waitForNextUpdate()

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

        const { result, waitForNextUpdate } = renderHook(
            () => useDelegation({ setGasPayer }),
            {
                wrapper: TestWrapper,
            },
        )

        await waitForNextUpdate()

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

        const { result, waitForNextUpdate } = renderHook(
            () => useDelegation({ setGasPayer }),
            {
                wrapper: TestWrapper,
            },
        )

        await waitForNextUpdate()

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

        const { result, waitForNextUpdate } = renderHook(
            () => useDelegation({ setGasPayer }),
            {
                wrapper: TestWrapper,
            },
        )

        await waitForNextUpdate()

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

        const { result, waitForNextUpdate } = renderHook(
            () => useDelegation({ setGasPayer, providedUrl: url }),
            {
                wrapper: TestWrapper,
            },
        )

        await waitForNextUpdate()

        expect(result.current.isDelegated).toBeTruthy()
        expect(result.current.selectedDelegationOption).toEqual(
            DelegationType.URL,
        )
        expect(result.current.selectedDelegationUrl).toEqual(url)
    })
})
