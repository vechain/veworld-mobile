import { RegistrationClient } from "~Networking/NotificationCenter/RegistrationClient"
import {
    registerPushNotification,
    unregisterPushNotification,
} from "~Networking/NotificationCenter/NotificationCenterAPI"

jest.mock("~Networking/NotificationCenter/NotificationCenterAPI")

const mockRegisterPushNotification = registerPushNotification as jest.MockedFunction<typeof registerPushNotification>
const mockUnregisterPushNotification = unregisterPushNotification as jest.MockedFunction<
    typeof unregisterPushNotification
>

describe("RegistrationClient", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe("registerAddresses", () => {
        it("should successfully register a single address", async () => {
            const addresses = ["0x1234567890abcdef"]
            const subscriptionId = "sub-123"
            const mockResponse = { failed: [] }

            mockRegisterPushNotification.mockResolvedValueOnce(mockResponse)

            const results = await RegistrationClient.registerAddresses(addresses, subscriptionId)

            expect(mockRegisterPushNotification).toHaveBeenCalledWith({
                walletAddresses: addresses,
                subscriptionId,
            })
            expect(results).toHaveLength(1)
            expect(results[0]).toMatchObject({
                address: addresses[0],
                operation: "REGISTER",
                success: true,
                timestamp: expect.any(Number),
            })
            expect(results[0].error).toBeUndefined()
        })

        it("should successfully register multiple addresses in a single batch", async () => {
            const addresses = ["0xaaa", "0xbbb", "0xccc"]
            const subscriptionId = "sub-123"
            const mockResponse = { failed: [] }

            mockRegisterPushNotification.mockResolvedValueOnce(mockResponse)

            const results = await RegistrationClient.registerAddresses(addresses, subscriptionId)

            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(1)
            expect(results).toHaveLength(3)
            results.forEach((result, index) => {
                expect(result).toMatchObject({
                    address: addresses[index],
                    operation: "REGISTER",
                    success: true,
                    timestamp: expect.any(Number),
                })
            })
        })

        it("should handle partial failures in registration", async () => {
            const addresses = ["0xaaa", "0xbbb", "0xccc"]
            const subscriptionId = "sub-123"
            const mockResponse = { failed: ["0xbbb"] }

            mockRegisterPushNotification.mockResolvedValueOnce(mockResponse)

            const results = await RegistrationClient.registerAddresses(addresses, subscriptionId)

            expect(results).toHaveLength(3)
            expect(results[0]).toMatchObject({
                address: "0xaaa",
                success: true,
            })
            expect(results[1]).toMatchObject({
                address: "0xbbb",
                success: false,
                error: "failed",
            })
            expect(results[2]).toMatchObject({
                address: "0xccc",
                success: true,
            })
        })
    })

    describe("unregisterAddresses", () => {
        it("should successfully unregister a single address", async () => {
            const addresses = ["0x1234567890abcdef"]
            const subscriptionId = "sub-123"
            const mockResponse = { failed: [] }

            mockUnregisterPushNotification.mockResolvedValueOnce(mockResponse)

            const results = await RegistrationClient.unregisterAddresses(addresses, subscriptionId)

            expect(mockUnregisterPushNotification).toHaveBeenCalledWith({
                walletAddresses: addresses,
                subscriptionId,
            })
            expect(results).toHaveLength(1)
            expect(results[0]).toMatchObject({
                address: addresses[0],
                operation: "UNREGISTER",
                success: true,
                timestamp: expect.any(Number),
            })
            expect(results[0].error).toBeUndefined()
        })

        it("should handle partial failures in unregistration", async () => {
            const addresses = ["0xaaa", "0xbbb"]
            const subscriptionId = "sub-123"
            const mockResponse = { failed: ["0xaaa"] }

            mockUnregisterPushNotification.mockResolvedValueOnce(mockResponse)

            const results = await RegistrationClient.unregisterAddresses(addresses, subscriptionId)

            expect(results).toHaveLength(2)
            expect(results[0]).toMatchObject({
                address: "0xaaa",
                success: false,
                error: "failed",
            })
            expect(results[1]).toMatchObject({
                address: "0xbbb",
                success: true,
            })
        })
    })

    describe("batching logic", () => {
        it("should process addresses in batches of 5", async () => {
            const addresses = Array.from({ length: 12 }, (_, i) => `0xaddr${i}`)
            const mockResponse = { failed: [] }

            mockRegisterPushNotification.mockResolvedValue(mockResponse)

            const results = await RegistrationClient.registerAddresses(addresses, "sub-123")

            // 12 addresses should create 3 batches: [5, 5, 2]
            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(3)
            expect(mockRegisterPushNotification).toHaveBeenNthCalledWith(1, {
                walletAddresses: addresses.slice(0, 5),
                subscriptionId: "sub-123",
            })
            expect(mockRegisterPushNotification).toHaveBeenNthCalledWith(2, {
                walletAddresses: addresses.slice(5, 10),
                subscriptionId: "sub-123",
            })
            expect(mockRegisterPushNotification).toHaveBeenNthCalledWith(3, {
                walletAddresses: addresses.slice(10, 12),
                subscriptionId: "sub-123",
            })
            expect(results).toHaveLength(12)
        })

        it("should process exactly 5 addresses in one batch", async () => {
            const addresses = Array.from({ length: 5 }, (_, i) => `0xaddr${i}`)
            const mockResponse = { failed: [] }

            mockRegisterPushNotification.mockResolvedValueOnce(mockResponse)

            await RegistrationClient.registerAddresses(addresses, "sub-123")

            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(1)
        })

        it("should process 6 addresses in two batches", async () => {
            const addresses = Array.from({ length: 6 }, (_, i) => `0xaddr${i}`)
            const mockResponse = { failed: [] }

            mockRegisterPushNotification.mockResolvedValue(mockResponse)

            await RegistrationClient.registerAddresses(addresses, "sub-123")

            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(2)
            expect(mockRegisterPushNotification).toHaveBeenNthCalledWith(1, {
                walletAddresses: addresses.slice(0, 5),
                subscriptionId: "sub-123",
            })
            expect(mockRegisterPushNotification).toHaveBeenNthCalledWith(2, {
                walletAddresses: addresses.slice(5, 6),
                subscriptionId: "sub-123",
            })
        })
    })

    describe("retry mechanism", () => {
        it("should retry on 5xx server errors with exponential backoff", async () => {
            const addresses = ["0xaaa"]
            const serverError = {
                response: {
                    status: 503,
                },
            }
            const mockResponse = { failed: [] }

            mockRegisterPushNotification
                .mockRejectedValueOnce(serverError)
                .mockRejectedValueOnce(serverError)
                .mockResolvedValueOnce(mockResponse)

            const promise = RegistrationClient.registerAddresses(addresses, "sub-123")

            // First retry after 1000ms
            await jest.advanceTimersByTimeAsync(1000)
            // Second retry after 2000ms
            await jest.advanceTimersByTimeAsync(2000)

            const results = await promise

            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(3)
            expect(results[0].success).toBe(true)
        })

        it("should retry on network errors", async () => {
            const addresses = ["0xaaa"]
            const networkError = new Error("Network request failed")
            const mockResponse = { failed: [] }

            mockRegisterPushNotification.mockRejectedValueOnce(networkError).mockResolvedValueOnce(mockResponse)

            const promise = RegistrationClient.registerAddresses(addresses, "sub-123")

            await jest.advanceTimersByTimeAsync(1000)

            const results = await promise

            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(2)
            expect(results[0].success).toBe(true)
        })

        it("should retry on ECONNABORTED errors", async () => {
            const addresses = ["0xaaa"]
            const abortError = { code: "ECONNABORTED" }
            const mockResponse = { failed: [] }

            mockRegisterPushNotification.mockRejectedValueOnce(abortError).mockResolvedValueOnce(mockResponse)

            const promise = RegistrationClient.registerAddresses(addresses, "sub-123")

            await jest.advanceTimersByTimeAsync(1000)

            const results = await promise

            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(2)
            expect(results[0].success).toBe(true)
        })

        it("should not retry on 4xx client errors", async () => {
            const addresses = ["0xaaa"]
            const clientError = {
                response: {
                    status: 400,
                },
            }

            mockRegisterPushNotification.mockRejectedValueOnce(clientError)

            const results = await RegistrationClient.registerAddresses(addresses, "sub-123")

            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(1)
            expect(results[0]).toMatchObject({
                success: false,
                error: expect.any(String),
            })
        })

        it("should fail after max retries (3 attempts)", async () => {
            const addresses = ["0xaaa", "0xbbb"]
            const serverError = {
                response: {
                    status: 500,
                },
            }

            mockRegisterPushNotification.mockRejectedValue(serverError)

            const promise = RegistrationClient.registerAddresses(addresses, "sub-123")

            // Wait for all retries
            await jest.advanceTimersByTimeAsync(1000)
            await jest.advanceTimersByTimeAsync(2000)

            const results = await promise

            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(3)
            expect(results).toHaveLength(2)
            expect(results[0]).toMatchObject({
                address: "0xaaa",
                success: false,
                error: expect.any(String),
            })
            expect(results[1]).toMatchObject({
                address: "0xbbb",
                success: false,
                error: expect.any(String),
            })
        })
    })

    describe("error classification", () => {
        it("should classify 500 errors as retryable", async () => {
            const addresses = ["0xaaa"]
            const serverError = { response: { status: 500 } }
            const mockResponse = { failed: [] }

            mockRegisterPushNotification.mockRejectedValueOnce(serverError).mockResolvedValueOnce(mockResponse)

            const promise = RegistrationClient.registerAddresses(addresses, "sub-123")
            await jest.advanceTimersByTimeAsync(1000)
            const results = await promise

            expect(results[0].success).toBe(true)
            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(2)
        })

        it("should classify 400 errors as non-retryable", async () => {
            const addresses = ["0xaaa"]
            const clientError = { response: { status: 400 } }

            mockRegisterPushNotification.mockRejectedValueOnce(clientError)

            const results = await RegistrationClient.registerAddresses(addresses, "sub-123")

            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(1)
            expect(results[0].success).toBe(false)
        })
    })

    describe("edge cases", () => {
        it("should handle empty address array", async () => {
            const results = await RegistrationClient.registerAddresses([], "sub-123")

            expect(results).toHaveLength(0)
            expect(mockRegisterPushNotification).not.toHaveBeenCalled()
        })

        it("should handle mixed success and failure across multiple batches", async () => {
            const addresses = Array.from({ length: 7 }, (_, i) => `0xaddr${i}`)
            // First batch: 0-4, second batch: 5-6
            const mockResponse1 = { failed: ["0xaddr1", "0xaddr3"] }
            const mockResponse2 = { failed: ["0xaddr6"] }

            mockRegisterPushNotification.mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2)

            const results = await RegistrationClient.registerAddresses(addresses, "sub-123")

            expect(results).toHaveLength(7)
            expect(results[0].success).toBe(true)
            expect(results[1].success).toBe(false)
            expect(results[2].success).toBe(true)
            expect(results[3].success).toBe(false)
            expect(results[4].success).toBe(true)
            expect(results[5].success).toBe(true)
            expect(results[6].success).toBe(false)
        })

        it("should handle retry success after first batch and immediate success on second batch", async () => {
            const addresses = Array.from({ length: 6 }, (_, i) => `0xaddr${i}`)
            const serverError = { response: { status: 503 } }
            const mockResponse = { failed: [] }

            // First batch fails once then succeeds
            mockRegisterPushNotification
                .mockRejectedValueOnce(serverError)
                .mockResolvedValueOnce(mockResponse)
                .mockResolvedValueOnce(mockResponse)

            const promise = RegistrationClient.registerAddresses(addresses, "sub-123")

            await jest.advanceTimersByTimeAsync(1000)

            const results = await promise

            expect(results).toHaveLength(6)
            expect(results.every(r => r.success)).toBe(true)
            expect(mockRegisterPushNotification).toHaveBeenCalledTimes(3)
        })
    })
})
