/**
 * Mock for the @privy-io/expo package
 */

import React from "react"

// Dynamic mock state that can be modified by tests
let mockUserState = {
    user: undefined,
    logout: jest.fn().mockResolvedValue(undefined),
}

let mockWalletState = {
    wallets: [],
    create: jest.fn().mockResolvedValue({}),
}

// Mock hooks - using direct function definitions
function usePrivy() {
    return mockUserState
}

function useEmbeddedEthereumWallet() {
    return mockWalletState
}

let mockOAuthState = {
    login: jest.fn().mockResolvedValue(undefined),
}

function useLoginWithOAuth() {
    return mockOAuthState
}

// Mock Provider component
function PrivyProvider({ children }) {
    return React.createElement("div", { "data-testid": "privy-provider" }, children)
}

// Helper functions to dynamically configure the mock state
const setAuthenticatedUser = userId => {
    mockUserState = {
        user: { id: userId },
        logout: jest.fn().mockResolvedValue(undefined),
    }
}

const setUnauthenticatedUser = () => {
    mockUserState = {
        user: null,
        logout: jest.fn().mockResolvedValue(undefined),
    }
}

const setCustomUser = userObject => {
    mockUserState = {
        user: userObject,
        logout: jest.fn().mockResolvedValue(undefined),
    }
}

const setMockWallets = wallets => {
    mockWalletState = {
        wallets: wallets,
        create: jest.fn().mockResolvedValue({}),
    }
}

const setMockPrivyProviderResp = (address, providerResponse) => {
    mockWalletState = {
        wallets: [
            {
                address,
                getProvider: jest.fn().mockResolvedValue({
                    request: jest.fn().mockResolvedValue(providerResponse),
                }),
            },
        ],
        create: jest.fn().mockResolvedValue({}),
    }
}

const setEmptyWallets = () => {
    mockWalletState = {
        wallets: [],
        create: jest.fn().mockResolvedValue({}),
    }
}

const setProviderError = error => {
    mockWalletState = {
        wallets: [
            {
                address: "0x5555555555555555555555555555555555555555",
                getProvider: jest.fn().mockResolvedValue({
                    request: jest.fn().mockRejectedValue(error),
                }),
            },
        ],
        create: jest.fn().mockResolvedValue({}),
    }
}

const setMockOAuthLogin = loginFn => {
    mockOAuthState = {
        login: loginFn || jest.fn().mockResolvedValue(undefined),
    }
}

const resetMockOAuth = () => {
    mockOAuthState = {
        login: jest.fn().mockResolvedValue(undefined),
    }
}

const resetAllMocks = () => {
    mockUserState = {
        user: undefined,
        logout: jest.fn().mockResolvedValue(undefined),
    }
    mockWalletState = {
        wallets: [],
        create: jest.fn().mockResolvedValue({}),
    }
    resetMockOAuth()
}

// ES module exports
export {
    usePrivy,
    useEmbeddedEthereumWallet,
    useLoginWithOAuth,
    PrivyProvider,
    // Helper functions for dynamic configuration
    setAuthenticatedUser,
    setUnauthenticatedUser,
    setCustomUser,
    setMockWallets,
    setMockPrivyProviderResp,
    setEmptyWallets,
    setProviderError,
    setMockOAuthLogin,
    resetMockOAuth,
    resetAllMocks,
}

// CommonJS exports for compatibility
module.exports = {
    usePrivy,
    useEmbeddedEthereumWallet,
    useLoginWithOAuth,
    PrivyProvider,
    // Helper functions for dynamic configuration
    setAuthenticatedUser,
    setUnauthenticatedUser,
    setCustomUser,
    setMockWallets,
    setMockPrivyProviderResp,
    setEmptyWallets,
    setProviderError,
    setMockOAuthLogin,
    resetMockOAuth,
    resetAllMocks,
}
