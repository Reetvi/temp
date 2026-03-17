import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

print("Loading data...")
df = pd.read_csv("water_dissegration_data.csv")

# Clean labels
label_map = {
    "no activity": "no_activity",
    "no-activity": "no_activity",
    "washing machine": "washing_machine",
    "washing-machine": "washing_machine",
}
df["label"] = df["label"].astype(str).str.strip().str.lower().replace(label_map)
required_cols = ["distance", "diff", "slope", "label"]
df = df.dropna(subset=required_cols)

print("Preparing features...")
X = df[["distance", "diff", "slope"]].values
y = df["label"].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training tuned RandomForest...")
rf = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)

# accuracy
y_pred = rf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Accuracy: {acc:.4f}")

print(f"Classes: {rf.classes_}")

print("Saving model...")
save_path = os.path.join("..", "backend", "saved_models", "RandomForest_model.h5")
joblib.dump(rf, save_path)
print(f"Saved to {save_path}")
