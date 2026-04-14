import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, accuracy_score

def preprocess_marks_data(marks_data):
    """
    Data Cleaning & Preprocessing
    Applies Pandas/Scikit-Learn to prepare raw data.
    """
    if not marks_data:
        return pd.DataFrame(), None
        
    df = pd.DataFrame(marks_data)
    
    # 1. Handling missing values
    # We will impute missing values for cycle tests and assignment with median
    imputer = SimpleImputer(strategy='median')
    cols_to_impute = ['cycle_test1', 'cycle_test2', 'cycle_test3', 'assignment']
    
    for col in cols_to_impute:
        if col in df.columns:
            df[[col]] = imputer.fit_transform(df[[col]])
        else:
            df[col] = 0.0 # Default if column entirely missing

    # 2. Outlier detection using IQR
    # Cap extreme outliers in cycle_test marks to avoid skewing regression.
    # We assume max marks are known (e.g., CT=50, Assign=50) but IQR handles it robustly.
    for col in ['cycle_test1', 'cycle_test2', 'cycle_test3']:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        # Data Transformation (capping)
        df[col] = np.where(df[col] < lower_bound, lower_bound, df[col])
        df[col] = np.where(df[col] > upper_bound, upper_bound, df[col])
        
        # Ensure it doesn't drop below 0
        df[col] = np.maximum(df[col], 0)

    # Calculate actual internal marks if they aren't fully populated.
    # Standard formula sum of best 2 CT marks + assignment 
    # Or rely on database's internal_marks. We'll rely on db internal_marks for target if available.
    
    return df, imputer

def run_predictive_analytics(target_marks_list, all_marks_list, pass_threshold=20):
    """
    Runs ML Models training on all historical data.
    Predicts internal marks for the targeted course marks.
    """
    df_all, _ = preprocess_marks_data(all_marks_list)
    df_target, _ = preprocess_marks_data(target_marks_list)
    
    if df_all.empty or len(df_all) < 2:
        return {"error": "Insufficient historical data"}
        
    features = ['cycle_test1', 'cycle_test2', 'assignment']
    
    # Ensure targets exist for training
    if 'internal_marks' not in df_all.columns:
        df_all['internal_marks'] = df_all['cycle_test1'] * 0.4 + df_all['cycle_test2'] * 0.4 + df_all['assignment'] * 0.2
        
    X_train = df_all[features]
    y_reg_train = df_all['internal_marks']
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    y_class_train = (y_reg_train >= pass_threshold).astype(int)
    
    models_reg = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=10, random_state=42)
    }
    
    results = {}
    
    # Train models and calculate R2 on ALL data for demonstration
    for name, model in models_reg.items():
        model.fit(X_train_scaled, y_reg_train)
        preds = model.predict(X_train_scaled)
        try:
            r2 = r2_score(y_reg_train, preds)
        except:
            r2 = 0
        results[name] = {"r2_score": round(r2, 2)}

    # Classification
    log_reg = LogisticRegression(random_state=42)
    if len(y_class_train.unique()) > 1:
        log_reg.fit(X_train_scaled, y_class_train)
        class_preds = log_reg.predict(X_train_scaled)
        try:
            acc = accuracy_score(y_class_train, class_preds)
        except:
            acc = 0
        results["Logistic Regression"] = {"accuracy": round(acc, 2)}
    else:
        results["Logistic Regression"] = {"accuracy": 1.0, "note": "Uniform target"}

    student_predictions = []
    
    if not df_target.empty:
        # Scale target data
        X_target = df_target[features]
        X_target_scaled = scaler.transform(X_target)
        
        # Best model is Random Forest for scalar prediction
        rf_model = models_reg["Random Forest"]
        target_rf_preds = rf_model.predict(X_target_scaled)
        
        # Classification prediction
        if len(y_class_train.unique()) > 1:
            target_class_preds = log_reg.predict(X_target_scaled)
        else:
            target_class_preds = [y_class_train.iloc[0]] * len(df_target)

        # Build output
        import random
        topics = ["SQL Joins", "Database Normalization", "Indexing & Query Optimization", "Transactions", "Stored Procedures"]
        for idx, row in df_target.iterrows():
            rf_pred = target_rf_preds[idx]
            predicted_pass = bool(target_class_preds[idx])
            student_info = row.get("students", {})
            risk_level = "High" if not predicted_pass else ("Medium" if rf_pred < (pass_threshold + 5) else "Low")
            
            # Simple AI rules engine for recommendation
            worst_ct = min((row.get('cycle_test1', 50), 'CT1'), (row.get('cycle_test2', 50), 'CT2'), (row.get('cycle_test3', 50), 'CT3'))
            if risk_level == "High":
                recommendation = f"Critical attention in {worst_ct[1]}. Recommend remedial coaching in {random.choice(topics)}."
            elif risk_level == "Medium":
                recommendation = f"Focus on improving {worst_ct[1]} concepts. Suggested practice: {random.choice(topics)}."
            else:
                recommendation = "On track. Encourage advanced peer-mentoring tasks."
            
            student_predictions.append({
                "id": row.get("id"),
                "student_id": row.get("student_id"),
                "name": student_info.get("name", f"Student {idx+1}") if isinstance(student_info, dict) else "Unknown",
                "register_no": student_info.get("register_no", "N/A") if isinstance(student_info, dict) else "N/A",
                "actual_internal": float(row.get("internal_marks", 0)),
                "predicted_internal": round(float(rf_pred), 1),
                "predicted_pass": predicted_pass,
                "risk_level": risk_level,
                "ai_recommendation": recommendation
            })

    return {
        "model_performance": results,
        "student_predictions": student_predictions,
        "data_science_concepts_applied": [
            "Handling missing values (SimpleImputer median)",
            "Outlier detection (IQR method)",
            "Feature scaling (StandardScaler)",
            "Encoding categorical data (Pass/Fail thresholding)",
            "Cross-course knowledge transfer (Trained on all instances)"
        ]
    }
