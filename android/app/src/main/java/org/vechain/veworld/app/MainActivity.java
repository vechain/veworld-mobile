package org.vechain.veworld.app;
import expo.modules.ReactActivityDelegateWrapper;

import android.os.Bundle;
import android.util.Log;

import com.zoontek.rnbootsplash.RNBootSplash;

import com.facebook.react.ReactActivity;

import io.sentry.Sentry;
import io.sentry.SentryLevel;
import io.sentry.android.core.SentryAndroid;

import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "VeWorld";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    RNBootSplash.init(this, R.style.BootTheme);
    super.onCreate(null);

    SentryAndroid.init(this, options -> {
      options.setDsn("https://d9f6366fe78846b88450241b1bc23e05@o4505487555297280.ingest.sentry.io/4505487558508544");
      // Add a callback that will be used before the event is sent to Sentry.
      // With this callback, you can modify the event or, when returning null, also discard the event.
      options.setBeforeSend((event, hint) -> {

        event.setTag("Feature_Tag", "NATIVE_ANDROID");

        if (SentryLevel.DEBUG.equals(event.getLevel()))
          return null;
        else {
          return event;
        }
      });
    });


    /*
      try {
        throw new CustomException("Custom exception occurred");
      } catch(Exception e) {
        Sentry.captureMessage("Something went wrong");
        Sentry.captureException(e);
      }
    */
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled()));
  }
}

