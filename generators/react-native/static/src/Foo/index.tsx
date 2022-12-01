/**
 *
 * Foo
 *
 */

import React, { useState } from 'react'
import {View, Text, Button} from 'react-native'

const Foo = () => {
  const [count, setCount] = useState(0)
  const increment = () =>{
    setCount(count +1)
  }
  return (
    <View><Text>This is the Foo Component! {count} </Text><Button title="Click" onPress={
      ()=>{
        increment()
      }
    } /></View>
  );
}

export default Foo
