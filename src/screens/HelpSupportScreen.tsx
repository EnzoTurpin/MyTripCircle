import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ModernCard } from "../components/ModernCard";
import { ModernButton } from "../components/ModernButton";
import { FAQ } from "../data/faq";

const HelpSupportScreen: React.FC = () => {
  const [openId, setOpenId] = React.useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(openId === id ? null : id);
  };
  const navigation = useNavigation();

  const openEmail = () => {
    Linking.openURL("mailto:support@mytripcircle.com?subject=Demande%20d'aide");
  };

  const faqItems = [
    {
      icon: "help-circle-outline",
      title: "Comment créer un voyage ?",
      description: "Appuyez sur le bouton + dans l'onglet Voyages",
      color: "#2891FF",
    },
    {
      icon: "people-outline",
      title: "Comment inviter des amis ?",
      description: "Ouvrez un voyage et appuyez sur 'Inviter des amis'",
      color: "#8869FF",
    },
    {
      icon: "calendar-outline",
      title: "Comment ajouter une réservation ?",
      description: "Dans un voyage, appuyez sur + dans la section Réservations",
      color: "#FF6B9D",
    },
    {
      icon: "map-outline",
      title: "Comment ajouter une adresse ?",
      description: "Allez dans l'onglet Adresses et appuyez sur +",
      color: "#4CAF50",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#2891FF", "#8869FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.3)",
                  "rgba(255, 255, 255, 0.1)",
                ]}
                style={styles.iconGradient}
              >
                <Ionicons name="help-circle" size={48} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Aide & Support</Text>
            <Text style={styles.headerSubtitle}>
              Nous sommes là pour vous aider
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <ModernCard variant="elevated" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="chatbubble-ellipses" size={32} color="#2891FF" />
              <Text style={styles.infoTitle}>Besoin d'aide ?</Text>
            </View>
            <Text style={styles.infoParagraph}>
              Notre équipe de support est disponible pour répondre à toutes vos
              questions sur MyTripCircle.
            </Text>
            <Text style={styles.infoParagraph}>
              Contactez-nous par email ou consultez notre FAQ ci-dessous pour
              trouver rapidement des réponses.
            </Text>
          </ModernCard>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Questions fréquentes</Text>
            {faqItems.map((item, index) => (
              <ModernCard
                key={index}
                variant="outlined"
                style={styles.faqItem}
                onPress={() => {}}
              >
                <View style={styles.faqHeader}>
                  <View
                    style={[
                      styles.faqIcon,
                      { backgroundColor: item.color + "15" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.faqContent}>
                    <Text style={styles.faqTitle}>{item.title}</Text>
                    <Text style={styles.faqDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
                </View>
              </ModernCard>
            ))}
          </View>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={openEmail}
            activeOpacity={0.7}
          >
            <Ionicons
              name="mail"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.contactButtonText}>Contacter le support</Text>
          </TouchableOpacity>

          <ModernCard variant="outlined" style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={20} color="#616161" />
              <Text style={styles.contactText}>support@mytripcircle.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="time" size={20} color="#616161" />
              <Text style={styles.contactText}>Lun - Ven, 9h - 18h</Text>
            </View>
          </ModernCard>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 64 + 10 : 24,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -20,
    marginTop: 5,
    zIndex: 10,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    marginTop: -100,
    paddingHorizontal: 24,
    paddingBottom: 64,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
    marginLeft: 12,
  },
  infoParagraph: {
    fontSize: 16,
    color: "#616161",
    lineHeight: 24,
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  faqContent: {
    flex: 1,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  faqDescription: {
    fontSize: 14,
    color: "#616161",
  },
  contactButton: {
    backgroundColor: "#2891FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 24,
    shadowColor: "#2891FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  contactInfo: {
    padding: 20,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: "#616161",
    marginLeft: 12,
  },
});

export default HelpSupportScreen;
