package org.vechain.veworld.app

import org.vechain.veworld.app.getTextPackage.GetTextPackage

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import org.vechain.veworld.app.googleDrive.GoogleDriveManager

// import Native modules

class VeWorldPackage : ReactPackage {

    override fun createViewManagers(
        reactContext: ReactApplicationContext,
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> = mutableListOf()

    override fun createNativeModules(
        reactContext: ReactApplicationContext,
    ): MutableList<NativeModule> =
        listOf(GetTextPackage(reactContext), GoogleDriveManager(reactContext)).toMutableList()
}