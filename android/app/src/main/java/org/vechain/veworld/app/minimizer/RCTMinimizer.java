package org.vechain.veworld.app.minimizer;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class RCTMinimizer extends ReactContextBaseJavaModule {
    RCTMinimizer(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "Minimizer";
    }

    @ReactMethod
    public void goBack() {
        android.app.Activity activity = getCurrentActivity();
        if (activity != null) {
            activity.moveTaskToBack(true);
        }
    }
}
