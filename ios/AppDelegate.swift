import ExpoModulesCore
import RNBootSplash
import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    var reactNativeDelegate: ReactNativeDelegate?
    var reactNativeFactory: RCTReactNativeFactory?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Clear keychain on first install
        clearKeychainIfNecessary()

        let delegate = ReactNativeDelegate()
        let factory = RCTReactNativeFactory(delegate: delegate)
        delegate.dependencyProvider = RCTAppDependencyProvider()

        reactNativeDelegate = delegate
        reactNativeFactory = factory

        window = UIWindow(frame: UIScreen.main.bounds)
        factory.startReactNative(
            withModuleName: "VeWorld",
            in: window,
            launchOptions: launchOptions
        )

        return true
    }

    // MARK: - Deep Linking Support
    func application(
        _ application: UIApplication, open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        return RCTLinkingManager.application(application, open: url, options: options)
    }

    func application(
        _ application: UIApplication, continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        return RCTLinkingManager.application(
            application, continue: userActivity, restorationHandler: restorationHandler)
    }

    // MARK: - Privacy Screen (Secure View on Background)
    func applicationDidEnterBackground(_ application: UIApplication) {
      let secureView = UIView(frame: window?.bounds ?? .zero)
        secureView.tag = 9_824_684
        secureView.backgroundColor = UIColor(
            red: 0.11372549019607843, green: 0.09019607843137255, blue: 0.22745098039215686,
            alpha: 1)

        let imageViewWidth: CGFloat = 100
        let imageViewHeight: CGFloat = 91
        let xPosition = (secureView.frame.width - imageViewWidth) / 2
        let yPosition = (secureView.frame.height - imageViewHeight) / 2

        let imageView = UIImageView(
            frame: CGRect(
                x: xPosition, y: yPosition, width: imageViewWidth, height: imageViewHeight))
        imageView.contentMode = .scaleAspectFit
        imageView.image = UIImage(named: "BootSplashLogo")

        secureView.addSubview(imageView)
        window?.addSubview(secureView)
    }

    func applicationWillEnterForeground(_ application: UIApplication) {

        if let secureView = window?.viewWithTag(9_824_684) {
            secureView.removeFromSuperview()
        }
    }

    // MARK: - Clear Keychain on First Install
    private func clearKeychainIfNecessary() {
        let hasRunBefore = UserDefaults.standard.bool(forKey: "HAS_RUN_BEFORE")

        if !hasRunBefore {
            UserDefaults.standard.set(true, forKey: "HAS_RUN_BEFORE")

            let secItemClasses: [CFString] = [
                kSecClassGenericPassword,
                kSecClassInternetPassword,
                kSecClassCertificate,
                kSecClassKey,
                kSecClassIdentity,
            ]

            for secItemClass in secItemClasses {
                let spec: [String: Any] = [kSecClass as String: secItemClass]
                SecItemDelete(spec as CFDictionary)
            }
        }
    }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
    override func sourceURL(for bridge: RCTBridge) -> URL? {
        self.bundleURL()
    }

    override func bundleURL() -> URL? {
        #if DEBUG
            RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
            Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }

    // MARK: - BootSplash Integration
    override func customize(_ rootView: RCTRootView) {
        super.customize(rootView)
        RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
    }
}
