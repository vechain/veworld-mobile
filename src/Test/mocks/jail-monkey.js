/**
 * Mock for the jail-monkey package
 */

const JailMonkey = {
    isJailBroken: jest.fn().mockReturnValue(false),
    canMockLocation: jest.fn().mockReturnValue(false),
    trustFall: jest.fn().mockReturnValue(true),
    isDebuggedMode: jest.fn().mockReturnValue(false),
    hookDetected: jest.fn().mockReturnValue(false),
    isOnExternalStorage: jest.fn().mockReturnValue(false),
    AdbEnabled: jest.fn().mockReturnValue(false),
    isDevelopmentSettingsMode: jest.fn().mockReturnValue(false),
}

export default JailMonkey
