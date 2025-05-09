package org.vechain.veworld.app

import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "VeWorld"

    override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme)
        super.onCreate(null)

        // Handle app links (deep linking)
        intent?.data?.let { appLinkData ->
            val appLinkAction = intent.action
            // Process deep links here if needed
        }
    }

    override fun onResume() {
        super.onResume()
        // Clear the FLAG_SECURE flag when the app resumes
        window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }

    override fun onPause() {
        super.onPause()
        // Set the FLAG_SECURE flag when the app is paused (goes to background)
        window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate =
            DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
