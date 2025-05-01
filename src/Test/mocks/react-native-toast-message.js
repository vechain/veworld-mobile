// Mock for react-native-toast-message
const ToastMethods = {
    show: jest.fn(),
    hide: jest.fn(),
    setRef: jest.fn(),
}

// Export a function component with the methods attached
const Toast = () => null
Toast.show = ToastMethods.show
Toast.hide = ToastMethods.hide
Toast.setRef = ToastMethods.setRef

// Create a BaseToast component mock
const BaseToast = () => null

// Export both the default Toast and named BaseToast
export { BaseToast }
export default Toast
