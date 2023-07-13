import { Alert } from "react-native"
import {
    setJSExceptionHandler,
    setNativeExceptionHandler,
} from "react-native-exception-handler"
import RNRestart from "react-native-restart"
import * as Sentry from "@sentry/react-native"

const allowInDevMode = false // is an optional parameter is a boolean.

// unhandled JS errors
// in this case is just possible to display an alert to the user and log the error to sentry
setJSExceptionHandler((error, isFatal) => {
    Sentry.captureException(error)

    if (isFatal) {
        Alert.alert("Error", "Unexpected error occurred", [
            {
                text: "OK",
                onPress: () => RNRestart.Restart(), // restart the app
            },
        ])
    }
}, allowInDevMode)

const forceAppQuit = true // is an optional ANDROID specific parameter that defines
//    if the app should be force quit on error.  default value is true.
//    To see usecase check the common issues section.
const executeDefaultHandler = false // is an optional boolean (both IOS, ANDROID)
//    It executes previous exception handlers if set by some other module.
//    It will come handy when you use any other crash analytics module along with this one
//    Default value is set to false. Set to true if you are using other analytics modules.

// Unhandled native modules errors
// in this case is not possible to display anything to the user, the app will just crash but we can log the error to sentry
const exceptionhandler = exceptionString => {
    Sentry.captureException(new Error(exceptionString))

    // eslint-disable-next-line no-console
    console.warn(exceptionString)
}
setNativeExceptionHandler(exceptionhandler, forceAppQuit, executeDefaultHandler)
