import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import json
from datetime import datetime, timedelta

class PM25Predictor:
    def __init__(self, data_path):
        self.data_path = data_path
        self.scaler = MinMaxScaler()
        self.model = None
        self.sequence_length = 7  # Number of time steps to look back
        
    def preprocess_data(self):
        try:
            # Read Excel file instead of CSV
            df = pd.read_excel(self.data_path)
            
            # Verify required columns exist
            if 'date' not in df.columns or 'pm25' not in df.columns:
                raise Exception("Excel file must contain 'date' and 'pm25' columns")
            
            # Continue with preprocessing
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)
            df.sort_index(inplace=True)
            
            # Scale the data
            scaled_data = self.scaler.fit_transform(df[['pm25']])
            return scaled_data
        except Exception as e:
            raise Exception(f"Error reading Excel file: {e}")
    
    def create_sequences(self, data):
        X, y = [], []
        for i in range(len(data) - self.sequence_length):
            X.append(data[i:(i + self.sequence_length), 0])
            y.append(data[i + self.sequence_length, 0])
        return np.array(X), np.array(y)
    
    def build_model(self):
        model = Sequential([
            LSTM(50, activation='relu', input_shape=(self.sequence_length, 1)),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse')
        return model
    
    def train_model(self):
        # Preprocess data
        scaled_data = self.preprocess_data()
        
        # Create sequences
        X, y = self.create_sequences(scaled_data)
        
        # Reshape X for LSTM [samples, time steps, features]
        X = X.reshape((X.shape[0], X.shape[1], 1))
        
        # Split data into train and test sets
        train_size = int(len(X) * 0.8)
        X_train, X_test = X[:train_size], X[train_size:]
        y_train, y_test = y[:train_size], y[train_size:]
        
        # Build and train model
        self.model = self.build_model()
        self.model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.1)
        
        return X_test, y_test
    
    def predict_future(self, days=7):
        # Get the last sequence_length days of data
        scaled_data = self.preprocess_data()
        last_sequence = scaled_data[-self.sequence_length:]
        
        # Make predictions
        predictions = []
        current_sequence = last_sequence.reshape(1, self.sequence_length, 1)
        
        for _ in range(days):
            # Predict next value
            next_pred = self.model.predict(current_sequence)[0]
            predictions.append(next_pred[0])
            
            # Update sequence for next prediction
            current_sequence = np.roll(current_sequence, -1)
            current_sequence[0, -1, 0] = next_pred
        
        # Inverse transform predictions
        predictions = np.array(predictions).reshape(-1, 1)
        predictions = self.scaler.inverse_transform(predictions)
        
        return predictions
    
    def save_predictions(self, predictions):
        try:
            # Read Excel file for last date
            df = pd.read_excel(self.data_path)
            last_date = pd.to_datetime(df['date']).max()
            
            # Generate dates for predictions
            dates = [(last_date + timedelta(days=i+1)).strftime('%Y-%m-%d') 
                    for i in range(len(predictions))]
            
            # Create prediction dictionary
            prediction_dict = {
                'dates': dates,
                'predictions': predictions.flatten().tolist()
            }
            
            # Save to JSON
            with open('public/predictions.json', 'w') as f:
                json.dump(prediction_dict, f)
        except Exception as e:
            raise Exception(f"Error saving predictions: {e}") 