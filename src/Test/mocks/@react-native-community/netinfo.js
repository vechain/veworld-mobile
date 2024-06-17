export default {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    fetch: jest.fn().mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: "wifi",
    }),
    useNetInfo: () => ({
        isConnected: true,
        isInternetReachable: true,
        type: "wifi",
    }),
}
