# ChurnPredict — Setup & Execution Guide

A simple, OS-specific guide on what to download, how to install, and how to run the project.

---

## 1. What You Need to Download (Prerequisites)

Make sure you have installed:

1. **Python (version 3.10, 3.11, or 3.12)**
   - Download: [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - *(⚠️ On Windows, check the box **"Add Python to PATH"** during installation)*

2. **Node.js (version 18 or higher with npm)**
   - Download: [https://nodejs.org/](https://nodejs.org/) (Choose the **LTS** version)

---

## 2. One-Time Setup & Installation

Choose your Operating System below:

### 🪟 For Windows (Command Prompt / PowerShell)

Open Command Prompt (`cmd`) or PowerShell inside the project folder:

```cmd
:: 1. Create Python virtual environment
python -m venv .venv

:: 2. Activate the virtual environment
.venv\Scripts\activate

:: 3. Install backend packages
pip install -r backend\requirements.txt

:: 4. Install frontend packages
cd frontend
npm install
cd ..
```

---

### 🐧 🍎 For Linux / macOS (Terminal)

Open your Terminal inside the project folder:

```bash
# 1. Create Python virtual environment
python3 -m venv .venv

# 2. Activate the virtual environment
source .venv/bin/activate

# 3. Install backend packages
pip install -r backend/requirements.txt

# 4. Install frontend packages
cd frontend
npm install
cd ..
```

---

## 3. Machine Learning Model Performance

Evaluated on an independent, held-out test split of **1,057 unseen customer accounts**:

- **Production Model:** `RandomForestClassifier` (200 decision trees, balanced weights, optimal threshold $\tau = 0.57$)
- **Dataset:** IBM Telco Customer Churn (7,043 subscriber records, 19 input features)

### Test Split Performance Metrics:

| Metric | Score | Practical Meaning |
| :--- | :---: | :--- |
| **ROC-AUC** | **`85.04%`** | Excellent ability to distinguish churners from loyal subscribers |
| **Churn Recall** | **`73.93%`** | Catches **207 out of 280** actual churners (Key retention KPI) |
| **Accuracy** | **`77.77%`** | Overall correct predictions across test split |
| **Precision** | **`56.10%`** | Proportion of flagged subscribers who actually cancel |
| **F1-Score** | **`0.638`** | Harmonic balance of precision and recall for imbalanced classes |

### 2×2 Test Confusion Matrix ($N = 1,057$):
- **True Negatives (TN):** `615` (Retained accounts correctly predicted to stay)
- **False Positives (FP):** `162` (Accounts flagged as risk that stayed — false alarms)
- **False Negatives (FN):** `73` (Missed churners)
- **True Positives (TP):** `207` (Actual churners caught)

### Algorithm Comparison on Test Data:
| Algorithm | ROC-AUC | Churn Recall | F1-Score | Status |
| :--- | :---: | :---: | :---: | :--- |
| **Logistic Regression** | 84.12% | 74.02% | 0.639 | Baseline Linear Model |
| **XGBoost (XGBClassifier)** | 84.92% | 70.00% | 0.624 | Gradient Boosting |
| **Random Forest (Selected)** | **85.04%** | **73.93%** | **0.638** | **Production Winner** |

---

## 4. How to Run the Project

You need **two terminal windows** open at the same time:

### 🪟 For Windows

#### Terminal 1: Start Backend (Django)
```cmd
.venv\Scripts\activate
python backend\manage.py runserver 8000
```
> Running at: `http://localhost:8000`

#### Terminal 2: Start Frontend (Next.js)
```cmd
cd frontend
npm run dev
```
> Running at: `http://localhost:3000`

---

### 🐧 🍎 For Linux / macOS

#### Terminal 1: Start Backend (Django)
```bash
source .venv/bin/activate
python backend/manage.py runserver 8000
```
> Running at: `http://localhost:8000`

#### Terminal 2: Start Frontend (Next.js)
```bash
cd frontend
npm run dev
```
> Running at: `http://localhost:3000`

---

## 5. Open the Web Application

Open your web browser and go to:

👉 **[http://localhost:3000](http://localhost:3000)**
