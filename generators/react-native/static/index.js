/**
 * @format
 */

 import React from 'react';
 import { AppRegistry, SafeAreaView, View, Text } from 'react-native'
 import { Foo } from './src/index';
import {name as appName} from './app.json';



const Container = () => {
    return <SafeAreaView>
      <View contentInsetAdjustmentBehavior="automatic">
        <Foo />
      </View>
    </SafeAreaView>
}

export default Foo

AppRegistry.registerComponent(appName, () => Container);
