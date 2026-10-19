internal import Expo
import RNBootSplash
import React
import ReactAppDependencyProvider
import UIKit

@main
class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {
    var window: UIWindow?

    var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
    var reactNativeFactory: RCTReactNativeFactory?
    var reactNativeFactoryModuleName: String { "VeWorld" }

    public override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        let delegate = ReactNativeDelegate()
        let factory = ExpoReactNativeFactory(delegate: delegate)
        delegate.dependencyProvider = RCTAppDependencyProvider()

        reactNativeDelegate = delegate
        reactNativeFactory = factory

        // SceneDelegate creates the window and starts React Native (UIScene life cycle, required by the iOS 27 SDK).
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    // MARK: - Privacy Screen (Secure View on Background)
    public override func applicationDidEnterBackground(_ application: UIApplication) {
        super.applicationDidEnterBackground(application)

        let secureView = UIView(frame: window?.bounds ?? UIScreen.main.bounds)
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

    public override func applicationWillEnterForeground(_ application: UIApplication) {
        super.applicationWillEnterForeground(application)

        if let secureView = window?.viewWithTag(9_824_684) {
            secureView.removeFromSuperview()
        }
    }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
    override func sourceURL(for bridge: RCTBridge) -> URL? {
        bridge.bundleURL ?? bundleURL()
    }

    override func bundleURL() -> URL? {
        #if DEBUG
            RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
            Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }

    // MARK: - BootSplash Integration
    override func customize(_ rootView: UIView) {
        super.customize(rootView)
        RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
    }
}
