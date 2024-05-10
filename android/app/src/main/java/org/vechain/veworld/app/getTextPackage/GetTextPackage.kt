package org.vechain.veworld.app.getTextPackage

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class GetTextPackage(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "GetTextPackageNativeModule"
    }

    @ReactMethod
    fun getText(text: String, promise: Promise) {
        try {
            promise.resolve("Hello $text")
        } catch (e: Throwable) {
            promise.reject("Create Event Error", e)
        }
    }
}