package org.vechain.veworld.app

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import org.vechain.veworld.app.googleDrive.GoogleDrivePackage

// import Native modules

class VeWorldPackage : ReactPackage {

    override fun createViewManagers(
            reactContext: ReactApplicationContext,
    ): List<ViewManager<*, *>> {
        return emptyList()
    }

    override fun createNativeModules(
            reactContext: ReactApplicationContext,
    ): MutableList<NativeModule> {
        val modules = mutableListOf<NativeModule>()

        // Add GoogleDrivePackage
        modules.add(GoogleDrivePackage(reactContext))

        return modules
    }
}
