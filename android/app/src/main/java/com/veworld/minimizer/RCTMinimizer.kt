package com.veworld.minimizer

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class RCTMinimizer(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "Minimizer"

    @ReactMethod
    fun goBack() {
        val activity = currentActivity
        activity?.moveTaskToBack(true)
    }
}