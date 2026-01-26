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
  StatusBar,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ModernButton } from "../components/ModernButton";

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, loading } = useAuth();
  const { t } = useTranslation();
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert(t("common.error"), t("common.fillAllFields"));
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
        Alert.alert(
          t("common.error"),
          isLogin ? t("common.loginFailed") : t("common.registerFailed")
        );
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("common.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient 
      colors={['#2891FF', '#8869FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.iconGradient}
              >
                <Ionicons name="airplane" size={80} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>{t("appName") || "MyTripCircle"}</Text>
            <Text style={styles.subtitle}>{t("slogan") || "Organisez vos voyages ensemble"}</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.form,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {isLogin ? t("common.welcomeBack") || "Bon retour" : t("common.createAccount") || "Créer un compte"}
              </Text>
              <Text style={styles.formSubtitle}>
                {isLogin 
                  ? t("common.loginToContinue") || "Connectez-vous pour continuer" 
                  : t("common.signUpToStart") || "Inscrivez-vous pour commencer"}
              </Text>
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={"#2891FF"}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t("common.fullName")}
                  placeholderTextColor={"#BDBDBD"}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={"#2891FF"}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t("common.email")}
                placeholderTextColor={"#BDBDBD"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={"#2891FF"}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t("common.password")}
                placeholderTextColor={"#BDBDBD"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={"#BDBDBD"}
                />
              </TouchableOpacity>
            </View>

            {isLogin && (
              <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>{t("common.forgotPassword") || "Mot de passe oublié ?"}</Text>
              </TouchableOpacity>
            )}

            <ModernButton
              title={loading || isSubmitting
                ? t("common.pleaseWait")
                : isLogin
                ? t("common.signIn")
                : t("common.signUp")}
              onPress={handleSubmit}
              disabled={loading || isSubmitting}
              loading={loading || isSubmitting}
              gradient
              size="large"
              fullWidth
              icon={isLogin ? "log-in-outline" : "person-add-outline"}
              style={styles.submitButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {isLogin ? t("common.noAccount") || "Pas de compte ?" : t("common.haveAccount") || "Déjà un compte ?"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={styles.switchLink}>
                  {isLogin ? t("common.signUp") || "S'inscrire" : t("common.signIn") || "Se connecter"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t("common.termsAgree") || "En continuant, vous acceptez nos"}
            </Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>
                {t("common.termsAndConditions") || "Conditions d'utilisation"}
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
    padding: 24,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 64,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center" as const,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12,
  },
  formHeader: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#616161',
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    paddingVertical: 8,
  },
  eyeButton: {
    padding: 8,
  },
  forgotButton: {
    alignSelf: "flex-end" as const,
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 14,
    color: '#2891FF',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 16,
  },
  divider: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#616161',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#616161',
    marginRight: 4,
  },
  switchLink: {
    fontSize: 16,
    color: '#2891FF',
    fontWeight: '700',
  },
  footer: {
    marginTop: 32,
    alignItems: "center" as const,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    textDecorationLine: "underline" as const,
  },
});

export default AuthScreen;
