/* eslint-disable no-console */
import {
    setJSExceptionHandler,
    setNativeExceptionHandler,
} from "react-native-exception-handler"
import * as Sentry from "@sentry/react-native"

const allowInDevMode = false // is an optional parameter is a boolean.

// unhandled JS errors
// in this case is just possible to display an alert to the user and log the error to sentry
setJSExceptionHandler(error => {
    try {
        console.error("setJSExceptionHandler", error)
        Sentry.captureException(error)
    } catch (e) {
        console.error(e)
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
    try {
        console.error("exceptionhandler", exceptionString)
        Sentry.captureException(new Error(exceptionString))
    } catch (e) {
        console.error(e)
    }
}
setNativeExceptionHandler(exceptionhandler, forceAppQuit, executeDefaultHandler)
