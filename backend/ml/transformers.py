"""
Custom scikit-learn transformers for robust preprocessing in Customer Churn prediction.
Handles unexpected types, blank string representations of missing values,
and unseen categories safely.
"""

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin


class SafeNumericalTransformer(BaseEstimator, TransformerMixin):
    """
    Safely converts input data to float, handling strings with whitespace or invalid values
    by turning them into NaN for subsequent imputation.
    """

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        if isinstance(X, pd.DataFrame):
            return X.apply(pd.to_numeric, errors="coerce").to_numpy(dtype=float)
        arr = np.array(X, dtype=object)
        res = np.zeros(arr.shape, dtype=float)
        for i in range(arr.shape[0]):
            for j in range(arr.shape[1]):
                val = arr[i, j]
                try:
                    if val is None or (isinstance(val, str) and val.strip() == ""):
                        res[i, j] = np.nan
                    else:
                        res[i, j] = float(val)
                except (ValueError, TypeError):
                    res[i, j] = np.nan
        return res


class SafeCategoricalTransformer(BaseEstimator, TransformerMixin):
    """
    Safely converts categorical inputs to string representations, replacing NaNs
    with a standardized 'missing' token for imputation/encoding.
    """

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        if isinstance(X, pd.DataFrame):
            return X.fillna("missing").astype(str).to_numpy()
        arr = np.array(X, dtype=object)
        res = np.empty(arr.shape, dtype=object)
        for i in range(arr.shape[0]):
            for j in range(arr.shape[1]):
                val = arr[i, j]
                res[i, j] = "missing" if val is None or pd.isna(val) else str(val).strip()
        return res
