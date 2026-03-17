import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv("water_dissegration_data.csv")
print(df.columns)
print(df.head())
