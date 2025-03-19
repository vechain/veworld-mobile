package org.vechain.veworld.app.secureBackground

import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import android.app.Activity
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.interfaces.TurboModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.NativeModule

@ReactModule(name = SecureBackgroundModule.NAME)
class SecureBackgroundModule(private val reactContext: ReactApplicationContext) : TurboModule, NativeModule {

    companion object {
        const val NAME = "BackgroundSecure"
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun blockScreen() {
        val activity: Activity? = reactContext.currentActivity
        activity?.runOnUiThread {
            activity.window.setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
            )
        }
    }

    @ReactMethod
    fun unblockScreen() {
        val activity: Activity? = reactContext.currentActivity
        activity?.runOnUiThread {
            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        }
    }

    override fun initialize() {
    }

    override fun invalidate() {
    }
}
