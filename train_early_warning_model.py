"""
Student Dropout Early Warning System - Machine Learning Model Trainer
Trains a Gradient Boosting Classifier on anonymized student data to predict dropout 2-3 months in advance.
"""

import json
import random
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

def generate_synthetic_student_data(num_students=1200, seed=42):
    np.random.seed(seed)
    random.seed(seed)

    institutions = ["University", "Engineering College", "Skill Development Program"]
    departments_univ = ["Computer Science", "Business Admin", "Psychology", "Biology", "Economics"]
    departments_eng = ["Computer Science", "Electrical Eng", "Mechanical Eng", "Civil Eng", "AI & Robotics"]
    departments_skill = ["Full-Stack Web Dev", "Solar Installation", "CNC Machining", "Data Analytics", "Cybersecurity"]

    first_names = ["Aarav", "Ananya", "Rohan", "Priya", "Vikram", "Neha", "Rahul", "Sneha", "Karan", "Pooja", "Arjun", "Diya", "Aditya", "Ishita", "Siddharth", "Meera", "Kabir", "Tanvi", "Yash", "Riya"]
    last_names = ["Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Rao", "Nair", "Joshi", "Das", "Reddy", "Mehta", "Chopra", "Deshmukh", "Bhat"]

    students = []

    for i in range(1, num_students + 1):
        inst = random.choice(institutions)
        if inst == "University":
            dept = random.choice(departments_univ)
        elif inst == "Engineering College":
            dept = random.choice(departments_eng)
        else:
            dept = random.choice(departments_skill)

        # Baseline stats with correlated risk features
        latent_risk = np.random.beta(2, 5) # skewed towards lower risk, but subset high risk

        gpa = round(float(np.clip(4.0 - (latent_risk * 3.2) + np.random.normal(0, 0.3), 1.0, 4.0)), 2)
        gpa_trend = round(float(np.clip(- (latent_risk * 1.2) + np.random.normal(0.05, 0.2), -1.5, 0.5)), 2)
        failed_credits = int(np.clip(round(latent_risk * 9 + np.random.normal(0, 1)), 0, 15))
        quiz_completion_rate = round(float(np.clip(100 - (latent_risk * 65) + np.random.normal(0, 5), 10, 100)), 1)

        attendance_overall = round(float(np.clip(95 - (latent_risk * 55) + np.random.normal(0, 4), 25, 100)), 1)
        attendance_recent_30d_drop = round(float(np.clip((latent_risk * 40) + np.random.normal(0, 5), 0, 60)), 1)
        consecutive_absences = int(np.clip(round(latent_risk * 12 + np.random.normal(0, 1.5)), 0, 20))

        assignment_ontime_rate = round(float(np.clip(98 - (latent_risk * 60) + np.random.normal(0, 5), 15, 100)), 1)
        assignment_delay_avg_hours = round(float(np.clip((latent_risk * 90) + np.random.normal(0, 10), 0, 168)), 1)
        missed_assignments = int(np.clip(round(latent_risk * 8 + np.random.normal(0, 1)), 0, 12))

        lms_weekly_logins = int(np.clip(round(25 - (latent_risk * 22) + np.random.normal(0, 2)), 0, 40))
        library_checkouts = int(np.clip(round(12 - (latent_risk * 11) + np.random.normal(0, 1)), 0, 25))
        digital_research_hours = round(float(np.clip(35 - (latent_risk * 32) + np.random.normal(0, 3), 0, 50)), 1)

        tuition_due_days = int(np.clip(round(latent_risk * 75 + np.random.normal(0, 10)), 0, 120))
        scholarship_warning = 1 if latent_risk > 0.55 and random.random() > 0.3 else 0
        admin_hold = 1 if tuition_due_days > 45 or failed_credits > 6 else 0

        fin_status_roll = random.random()
        if latent_risk > 0.6 and fin_status_roll > 0.4:
            fin_status = "Pending Dues"
        elif scholarship_warning == 1:
            fin_status = "Scholarship Warning"
        elif random.random() > 0.6:
            fin_status = "Partial Aid"
        else:
            fin_status = "Full Aid / Paid"

        # Calculate true target label: 2-3 months early warning dropout prediction
        dropout_logit = (
            -3.5
            + (4.0 - gpa) * 0.95
            + (-gpa_trend) * 1.2
            + (100 - attendance_overall) * 0.045
            + attendance_recent_30d_drop * 0.065
            + consecutive_absences * 0.22
            + (100 - assignment_ontime_rate) * 0.035
            + missed_assignments * 0.38
            + (30 - lms_weekly_logins) * 0.08
            + (tuition_due_days / 15.0) * 0.35
            + scholarship_warning * 1.1
            + admin_hold * 0.8
        )
        dropout_prob = 1.0 / (1.0 + np.exp(-dropout_logit))
        dropped_out = 1 if dropout_prob > 0.50 else 0

        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        student_id = f"STU-2026-{1000 + i}"

        students.append({
            "student_id": student_id,
            "name": name,
            "institution_type": inst,
            "department": dept,
            "gpa": gpa,
            "gpa_trend": gpa_trend,
            "failed_credits": failed_credits,
            "quiz_completion_rate": quiz_completion_rate,
            "attendance_overall_pct": attendance_overall,
            "attendance_recent_30d_drop_pct": attendance_recent_30d_drop,
            "consecutive_absences": consecutive_absences,
            "assignment_ontime_rate": assignment_ontime_rate,
            "assignment_delay_avg_hours": assignment_delay_avg_hours,
            "missed_assignments_count": missed_assignments,
            "lms_weekly_logins": lms_weekly_logins,
            "library_checkout_count": library_checkouts,
            "digital_research_hours": digital_research_hours,
            "tuition_due_days": tuition_due_days,
            "scholarship_warning": scholarship_warning,
            "financial_aid_status": fin_status,
            "admin_hold": admin_hold,
            "true_dropout_prob": round(float(dropout_prob), 4),
            "dropped_out": dropped_out
        })

    return pd.DataFrame(students)

def train_gradient_boosting_classifier():
    print("=== Generating Synthetic Historical Student Dataset ===")
    df = generate_synthetic_student_data(num_students=1500)

    feature_cols = [
        "gpa", "gpa_trend", "failed_credits", "quiz_completion_rate",
        "attendance_overall_pct", "attendance_recent_30d_drop_pct", "consecutive_absences",
        "assignment_ontime_rate", "assignment_delay_avg_hours", "missed_assignments_count",
        "lms_weekly_logins", "library_checkout_count", "digital_research_hours",
        "tuition_due_days", "scholarship_warning", "admin_hold"
    ]

    X = df[feature_cols]
    y = df["dropped_out"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    print(f"Dataset Size: {len(df)} records | Training: {len(X_train)} | Test: {len(X_test)}")
    print(f"Overall Historical Dropout Rate: {df['dropped_out'].mean() * 100:.1f}%\n")

    print("=== Training Gradient Boosting Classifier ===")
    gb_model = GradientBoostingClassifier(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=4,
        min_samples_split=5,
        subsample=0.85,
        random_state=42
    )

    gb_model.fit(X_train, y_train)

    # Evaluation
    y_pred = gb_model.predict(X_test)
    y_prob = gb_model.predict_proba(X_test)[:, 1]

    roc_auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)

    print(f"Model Training Complete!")
    print(f"ROC-AUC Score: {roc_auc:.4f}")
    print(f"Accuracy: {report['accuracy'] * 100:.2f}%\n")

    # Feature Importances
    importances = dict(zip(feature_cols, [round(float(val), 4) for val in gb_model.feature_importances_]))
    sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))

    print("=== Top Feature Importances (Gradient Boosting) ===")
    for feat, imp in list(sorted_importances.items())[:8]:
        print(f" - {feat:30s}: {imp * 100:.2f}%")

    # Export Summary to JSON
    summary = {
        "model_name": "Gradient Boosting Classifier",
        "parameters": {
            "n_estimators": 120,
            "learning_rate": 0.08,
            "max_depth": 4,
            "subsample": 0.85
        },
        "metrics": {
            "roc_auc": round(float(roc_auc), 4),
            "accuracy": round(float(report["accuracy"]), 4),
            "precision_dropout": round(float(report["1"]["precision"]), 4),
            "recall_dropout": round(float(report["1"]["recall"]), 4),
            "f1_dropout": round(float(report["1"]["f1-score"]), 4),
            "confusion_matrix": cm.tolist()
        },
        "feature_importances": sorted_importances,
        "sample_students": df.head(10).to_dict(orient="records")
    }

    with open("trained_model_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print("\nModel summary exported successfully to 'trained_model_summary.json'.")

if __name__ == "__main__":
    train_gradient_boosting_classifier()
