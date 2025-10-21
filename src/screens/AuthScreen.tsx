import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, loading } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await register(name, email, password);
      }

      if (!success) {
        Alert.alert("Error", isLogin ? "Login failed" : "Registration failed");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Ionicons name="airplane" size={80} color="white" />
            <Text style={styles.title}>MyTripCircle</Text>
            <Text style={styles.subtitle}>
              Plan your perfect trip with friends
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading || isSubmitting ? styles.buttonDisabled : null,
              ]}
              onPress={handleSubmit}
              disabled={loading || isSubmitting}
            >
              <Text style={styles.buttonText}>
                {loading || isSubmitting
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In"
                  : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center" as const,
    padding: 20,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center" as const,
  },
  form: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 20,
    paddingBottom: 10,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center" as const,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center" as const,
  },
  switchText: {
    color: "#007AFF",
    fontSize: 16,
  },
});

export default AuthScreen;
