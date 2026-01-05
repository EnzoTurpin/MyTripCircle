import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import ApiService from "../services/ApiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import { useAuth } from "../contexts/AuthContext";

type OtpRouteParams = {
  userId: string;
};

const OtpScreen = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const route = useRoute<RouteProp<{ params: OtpRouteParams }, "params">>();
  const { userId } = route.params;

  const { verifyOtp } = useAuth(); // 🔥 IMPORTANT

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "OTP must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const success = await verifyOtp(userId, otp); // 🔥 ICI

      if (!success) {
        Alert.alert("Error", "Invalid OTP");
      }
      // ❌ PAS DE navigation ici
      // ❌ PAS DE setUser ici
    } catch {
      Alert.alert("Error", "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };


return (
  <View style={{ padding: 20 }}>
    <Text style={{ fontSize: 20, marginBottom: 10 }}>
      Enter the OTP code
    </Text>

    <TextInput
      keyboardType="number-pad"
      maxLength={6}
      value={otp}
      onChangeText={setOtp}
      placeholder="123456"
      style={{
        borderWidth: 1,
        padding: 10,
        marginBottom: 20,
        textAlign: "center",
        fontSize: 18,
      }}
    />

    <Button title={loading ? "Verifying..." : "Verify"} onPress={handleVerify} disabled={loading} />
  </View>
);
};

export default OtpScreen;
