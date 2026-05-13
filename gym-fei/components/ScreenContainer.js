import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  StatusBar,
} from "react-native";

export default function ScreenContainer({
  children,
  scroll = true,
  style = {},
  contentContainerStyle = {},
}) {
  const Container = scroll ? ScrollView : View;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container
          style={{ flex: 1 }}
          contentContainerStyle={[
            {
              flexGrow: 1,
              padding: 0,
            },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StatusBar barStyle="light-content" />

          <View style={[{ flex: 1 }, style]}>{children}</View>
        </Container>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
