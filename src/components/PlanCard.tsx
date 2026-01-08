import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  id: string;
  title: string;
  price?: string;
  advantages: string[];
  onSubscribe: (productId: string) => void;
  loading?: boolean;
};

const PlanCard: React.FC<Props> = ({ id, title, price, advantages, onSubscribe, loading }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {price ? <Text style={styles.price}>{price}</Text> : null}
      <View style={styles.list}>
        {advantages.map((a, i) => (
          <Text key={i} style={styles.adv}>• {a}</Text>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.btn, loading ? styles.btnDisabled : null]}
        onPress={() => onSubscribe(id)}
        disabled={loading}
      >
        <Text style={styles.btnText}>{loading ? "..." : "S'abonner"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    padding: 16, 
    borderRadius: 8, 
    backgroundColor: "#fff", 
    marginBottom: 12, 
    shadowColor: "#000", 
    shadowOpacity: 0.05, 
    shadowRadius: 6, 
    elevation: 2 
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  price: { fontSize: 16, color: "#007AFF", marginBottom: 8 },
  list: { marginBottom: 12 },
  adv: { fontSize: 14, color: "#333", marginBottom: 4 },
  btn: { backgroundColor: "#007AFF", paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  btnDisabled: { backgroundColor: "#8fb4ff" },
  btnText: { color: "#fff", fontWeight: "600" },
});

export default PlanCard;
