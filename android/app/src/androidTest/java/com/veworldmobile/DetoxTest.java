package com.veworldmobile;

import com.wix.detox.Detox;
import com.wix.detox.config.DetoxConfig;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
//import androidx.test.rule.ActivityTestRule;
import androidx.test.ext.junit.rules.ActivityScenarioRule;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
    @Rule
    public ActivityScenarioRule<MainActivity> mActivityRule = new ActivityScenarioRule<>(MainActivity.class, false, false);

    @Test
    public void runDetoxTests() {
        DetoxConfig detoxConfig = new DetoxConfig();
        detoxConfig.idlePolicyConfig.masterTimeoutSec = 300;
        detoxConfig.idlePolicyConfig.idleResourceTimeoutSec = 300;
        detoxConfig.rnContextLoadTimeoutSec = (BuildConfig.DEBUG ? 300 : 300);

        Detox.runTests(mActivityRule, detoxConfig);
    }
}