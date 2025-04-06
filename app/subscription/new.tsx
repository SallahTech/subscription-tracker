import { useState } from "react";
import { StyleSheet, View, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "components/Button";

const CATEGORIES = [
  "Entertainment",
  "Music",
  "Productivity",
  "Health & Fitness",
  "Education",
  "Gaming",
  "News",
  "Other",
];

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const [subscription, setSubscription] = useState({
    name: "",
    amount: "",
    category: "",
    description: "",
    nextRenewal: new Date().toISOString().split("T")[0],
  });

  const handleSave = () => {
    // TODO: Save new subscription to the database
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Add Subscription</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText>Name</ThemedText>
            <TextInput
              style={styles.input}
              value={subscription.name}
              onChangeText={(text) =>
                setSubscription({ ...subscription, name: text })
              }
              placeholder="Enter subscription name"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText>Amount</ThemedText>
            <TextInput
              style={styles.input}
              value={subscription.amount}
              onChangeText={(text) =>
                setSubscription({ ...subscription, amount: text })
              }
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText>Category</ThemedText>
            <TextInput
              style={styles.input}
              value={subscription.category}
              onChangeText={(text) =>
                setSubscription({ ...subscription, category: text })
              }
              placeholder="Select a category"
            />
            <View style={styles.categories}>
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={
                    subscription.category === category ? "primary" : "secondary"
                  }
                  onPress={() => setSubscription({ ...subscription, category })}
                >
                  {category}
                </Button>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText>Next Renewal Date</ThemedText>
            <TextInput
              style={styles.input}
              value={subscription.nextRenewal}
              onChangeText={(text) =>
                setSubscription({ ...subscription, nextRenewal: text })
              }
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={subscription.description}
              onChangeText={(text) =>
                setSubscription({ ...subscription, description: text })
              }
              placeholder="Add a description (optional)"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button onPress={handleSave}>Add Subscription</Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  content: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
});
