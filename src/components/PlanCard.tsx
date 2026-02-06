import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ModernButton } from "./ModernButton";

type Props = {
  id: string;
  title: string;
  price?: string;
  advantages: string[];
  onSubscribe: (productId: string) => void;
  loading?: boolean;
  recommended?: boolean;
};

const PlanCard: React.FC<Props> = ({ 
  id, 
  title, 
  price, 
  advantages, 
  onSubscribe, 
  loading,
  recommended = false,
}) => {
  return (
    <View style={[styles.card, recommended && styles.recommendedCard]}>
      {recommended && (
        <View style={styles.badge}>
          <LinearGradient
            colors={['#2891FF', '#8869FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badgeGradient}
          >
            <Ionicons name="star" size={12} color="white" />
            <Text style={styles.badgeText}>Recommandé</Text>
          </LinearGradient>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {price && (
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.priceUnit}>/mois</Text>
          </View>
        )}
      </View>

      <View style={styles.advantagesList}>
        {advantages.map((advantage, index) => (
          <View key={index} style={styles.advantageItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
            </View>
            <Text style={styles.advantageText}>{advantage}</Text>
          </View>
        ))}
      </View>

      <ModernButton
        title={loading ? "Chargement..." : "S'abonner"}
        onPress={() => onSubscribe(id)}
        variant={recommended ? "primary" : "outline"}
        gradient={recommended}
        size="large"
        fullWidth
        disabled={loading}
        icon="arrow-forward"
        iconPosition="right"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#F5F5F5",
  },
  recommendedCard: {
    borderColor: "#2891FF",
    borderWidth: 2,
  },
  badge: {
    position: "absolute",
    top: -12,
    right: 24,
    zIndex: 10,
  },
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  header: {
    marginBottom: 24,
  },
  title: { 
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: { 
    fontSize: 32,
    fontWeight: "700",
    color: "#2891FF",
  },
  priceUnit: {
    fontSize: 16,
    color: "#616161",
    marginLeft: 4,
  },
  advantagesList: {
    marginBottom: 24,
  },
  advantageItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50" + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  advantageText: {
    flex: 1,
    fontSize: 15,
    color: "#212121",
    lineHeight: 24,
  },
});

export default PlanCard;
