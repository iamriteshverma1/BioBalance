# Create sample health data and meal recommendations to make the app realistic
import json
import random

# Sample user health profiles with realistic vitals
sample_users = [
    {
        "name": "John",
        "age": 45,
        "vitals": {
            "blood_pressure": "140/90",
            "blood_sugar": 150,
            "oxygen_saturation": 95
        },
        "conditions": ["hypertension", "pre-diabetes"]
    },
    {
        "name": "Sarah",
        "age": 32,
        "vitals": {
            "blood_pressure": "118/78",
            "blood_sugar": 85,
            "oxygen_saturation": 98
        },
        "conditions": []
    },
    {
        "name": "Mike",
        "age": 58,
        "vitals": {
            "blood_pressure": "150/95",
            "blood_sugar": 180,
            "oxygen_saturation": 93
        },
        "conditions": ["diabetes", "hypertension"]
    }
]

# Create meal database based on research findings
meal_database = {
    "blood_pressure_friendly": [
        {
            "name": "Spinach and Quinoa Salad",
            "description": "Rich in potassium, magnesium, and nitrates",
            "nutrients": {"potassium": 800, "magnesium": 150, "fiber": 8},
            "calories": 320
        },
        {
            "name": "Grilled Salmon with Beets",
            "description": "Omega-3 fatty acids and natural nitrates",
            "nutrients": {"omega3": 2.5, "potassium": 650, "nitrates": "high"},
            "calories": 380
        },
        {
            "name": "Oatmeal with Berries",
            "description": "Beta-glucan fiber and anthocyanins",
            "nutrients": {"beta_glucan": 3, "antioxidants": "high", "fiber": 6},
            "calories": 285
        }
    ],
    "blood_sugar_friendly": [
        {
            "name": "Lentil and Vegetable Soup",
            "description": "High fiber, low glycemic index",
            "nutrients": {"fiber": 12, "protein": 18, "glycemic_index": "low"},
            "calories": 240
        },
        {
            "name": "Greek Yogurt with Nuts",
            "description": "Protein-rich with healthy fats",
            "nutrients": {"protein": 15, "healthy_fats": 8, "carbs": 12},
            "calories": 200
        },
        {
            "name": "Grilled Chicken with Broccoli",
            "description": "Lean protein with fiber-rich vegetables",
            "nutrients": {"protein": 35, "fiber": 5, "carbs": 8},
            "calories": 300
        }
    ],
    "oxygen_supporting": [
        {
            "name": "Iron-Rich Spinach Smoothie",
            "description": "Supports hemoglobin and oxygen transport",
            "nutrients": {"iron": 5, "vitamin_c": 60, "folate": 200},
            "calories": 180
        },
        {
            "name": "Beetroot and Carrot Juice",
            "description": "Natural nitrates for oxygen uptake",
            "nutrients": {"nitrates": "high", "vitamin_c": 45, "antioxidants": "high"},
            "calories": 120
        },
        {
            "name": "Pomegranate Bowl",
            "description": "Antioxidants for circulation",
            "nutrients": {"antioxidants": "very_high", "vitamin_c": 40, "fiber": 4},
            "calories": 150
        }
    ]
}

# Algorithm logic for meal recommendations
def recommend_meals(vitals, conditions):
    recommendations = []
    
    # Parse blood pressure
    bp_parts = vitals["blood_pressure"].split("/")
    systolic = int(bp_parts[0])
    diastolic = int(bp_parts[1])
    
    # Blood pressure recommendations
    if systolic >= 140 or diastolic >= 90:
        recommendations.extend(meal_database["blood_pressure_friendly"])
    
    # Blood sugar recommendations
    if vitals["blood_sugar"] > 126:  # Diabetes threshold
        recommendations.extend(meal_database["blood_sugar_friendly"])
    elif vitals["blood_sugar"] > 100:  # Pre-diabetes
        recommendations.extend(meal_database["blood_sugar_friendly"][:2])
    
    # Oxygen saturation recommendations
    if vitals["oxygen_saturation"] < 95:
        recommendations.extend(meal_database["oxygen_supporting"])
    
    return recommendations

# Generate recommendations for sample users
user_recommendations = {}
for user in sample_users:
    recs = recommend_meals(user["vitals"], user["conditions"])
    user_recommendations[user["name"]] = {
        "vitals": user["vitals"],
        "conditions": user["conditions"],
        "recommendations": recs[:4]  # Limit to top 4 recommendations
    }

print("Sample User Recommendations:")
for name, data in user_recommendations.items():
    print(f"\n{name}:")
    print(f"  Vitals: BP {data['vitals']['blood_pressure']}, Sugar {data['vitals']['blood_sugar']}, O2 {data['vitals']['oxygen_saturation']}%")
    print(f"  Conditions: {data['conditions'] if data['conditions'] else 'None'}")
    print(f"  Recommended meals: {len(data['recommendations'])}")
    for meal in data['recommendations']:
        print(f"    - {meal['name']}: {meal['calories']} cal")

# Save data for the app
app_data = {
    "users": sample_users,
    "meal_database": meal_database,
    "user_recommendations": user_recommendations
}

with open('biobalance_data.json', 'w') as f:
    json.dump(app_data, f, indent=2)

print("\n\nData saved to biobalance_data.json for the app")