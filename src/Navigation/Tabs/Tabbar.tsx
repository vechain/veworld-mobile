import React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {TabIcon, BlurView} from '~Components'
import {useTheme} from '~Common'
import {HomeStack} from '~Navigation/Stacks'

const Tab = createBottomTabNavigator()

export const Tabbar = () => {
    const theme = useTheme()

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.tabicon,
                tabBarInactiveTintColor: theme.colors.tabiconInactive,
                tabBarStyle: {position: 'absolute'},
                tabBarBackground: () => <BlurView />,
            }}>
            <Tab.Screen
                name="HomeStack"
                component={HomeStack}
                options={{
                    tabBarLabel: 'Wallet',
                    tabBarIcon: ({focused, size}) => (
                        <TabIcon
                            focused={focused}
                            size={size}
                            title={'Wallet'}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}
