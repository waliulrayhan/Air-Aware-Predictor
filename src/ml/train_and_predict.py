from pm25_predictor import PM25Predictor

def main():
    try:
        # Initialize predictor
        predictor = PM25Predictor('public/dhaka-air-quality.xlsx')
        
        # Train model
        print("Training model...")
        predictor.train_model()
        
        # Make predictions
        print("Generating predictions...")
        predictions = predictor.predict_future(days=7)
        
        # Save predictions
        predictor.save_predictions(predictions)
        print("Predictions saved to public/predictions.json")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        print("\nPlease ensure:")
        print("1. The data file exists at 'public/dhaka-air-quality.xlsx'")
        print("2. The CSV file has the correct format with 'date' and 'pm25' columns")
        print("3. The data is properly formatted")
        print("\nExample CSV format:")
        print("date,pm25")
        print("2023-01-01,25.4")
        print("2023-01-02,28.1")

if __name__ == "__main__":
    main() 