import sys
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

def get_travel_season(start_date_str):
    if not start_date_str:
        return None
    try:
        from datetime import datetime
        # Expecting ISO format from frontend (e.g., 2024-05-20)
        dt = datetime.strptime(start_date_str.split('T')[0], '%Y-%m-%d')
        month = dt.month
        
        if 3 <= month <= 6:
            return 'Summer'
        elif 7 <= month <= 9:
            return 'Monsoon'
        else:
            return 'Winter'
    except Exception:
        return None

def recommend(data):
    try:
        preferences = data.get('preferences', {})
        destinations = data.get('destinations', [])
        travel_dates = preferences.get('travelDates', {})
        user_season = get_travel_season(travel_dates.get('start'))

        if not destinations:
            return []

        # Convert to DataFrame
        df = pd.DataFrame(destinations)
        
        # 1. Feature Engineering: Combine activities into a single string
        df['features'] = df['activities'].apply(lambda x: ' '.join(x) if isinstance(x, list) else str(x))
        df['features'] = df['features'] + ' ' + df['climate'] + ' ' + df['season']

        # 2. Vectorize Text Features
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(df['features'])

        # 3. Create User Profile
        user_interests = ' '.join(preferences.get('interests', []))
        user_vector = tfidf.transform([user_interests])

        # 4. Calculate Interest Match Score
        interest_scores = cosine_similarity(user_vector, tfidf_matrix).flatten()
        df['interest_score'] = interest_scores

        # 5. Budget Filtering & Scoring
        user_budget = float(preferences.get('budget', 50000))
        
        def calculate_budget_fit(row, budget):
            min_cost = row['costRange']['min']
            max_cost = row['costRange']['max']
            avg_cost = (min_cost + max_cost) / 2
            
            if avg_cost <= budget:
                return 1.0
            elif min_cost <= budget:
                return 0.7
            else:
                return max(0, 1 - (min_cost - budget) / budget)

        df['budget_fit'] = df.apply(lambda row: calculate_budget_fit(row, user_budget), axis=1)

        # 6. Season Suitability Scoring
        def calculate_season_score(row, travel_season):
            if not travel_season:
                return 1.0, "Dates not provided - showing general relevance."
            
            dest_season = str(row['season']).lower()
            travel_season_lower = travel_season.lower()
            
            if travel_season_lower in dest_season:
                return 1.0, f"Perfect timing! {travel_season} is the best time to visit."
            else:
                return 0.5, f"Note: {travel_season} is not the peak season here, but it's still accessible."

        season_results = df.apply(lambda row: calculate_season_score(row, user_season), axis=1)
        df['season_score'] = [r[0] for r in season_results]
        df['season_reason'] = [r[1] for r in season_results]

        # 7. Final Combined Score (Balanced Weighting)
        # 50% interest, 30% budget, 20% season
        df['final_score'] = (df['interest_score'] * 0.5) + (df['budget_fit'] * 0.3) + (df['season_score'] * 0.2)
        
        # Sort and return top recommendations
        df = df.sort_values(by='final_score', ascending=False)
        
        # Format output with explainable metrics
        recommendations = []
        for _, row in df.head(5).iterrows():
            recommendations.append({
                "name": row['name'],
                "country": row['country'],
                "description": row['description'],
                "score": float(row['final_score']),
                "estimatedCost": int((row['costRange']['min'] + row['costRange']['max']) / 2),
                "activities": row['activities'],
                "climate": row['climate'],
                "imageUrl": row.get('imageUrl', ''),
                "explanation": {
                    "interestMatch": round(float(row['interest_score']) * 100, 1),
                    "budgetFit": round(float(row['budget_fit']) * 100, 1),
                    "seasonSuitability": row['season_reason']
                }
            })
            
        return recommendations
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Read from stdin
    try:
        input_str = sys.stdin.read()
        if not input_str:
            print(json.dumps([]))
            sys.exit(0)
            
        data = json.loads(input_str)
        recommendations = recommend(data)
        print(json.dumps(recommendations))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
