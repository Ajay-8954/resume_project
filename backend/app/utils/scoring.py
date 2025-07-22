# import random

# def normalize_scores(analysis_dict):
#     base_score = analysis_dict['overall_score']
#     for category in analysis_dict['analysis_breakdown'].values():
#         variation = random.randint(-10, 10)
#         category['score'] = max(0, min(100, base_score + variation))
#     return analysis_dict

# def calculate_overall_score(analysis_dict):
#     """Calculate weighted overall score based on category weights"""
#     weights = {
#         'tailoring': 0.30,
#         'content': 0.25,
#         'format': 0.15,
#         'sections': 0.15,
#         'style': 0.15
#     }
    
#     weighted_sum = 0
#     for category, data in analysis_dict['analysis_breakdown'].items():
#         weighted_sum += data['score'] * weights.get(category, 0)
    
#     return min(100, max(0, round(weighted_sum)))


import random

def normalize_scores(analysis_dict):
    """No longer randomizing scores, just ensuring they're within bounds"""
    for category in analysis_dict['analysis_breakdown'].values():
        category['score'] = max(0, min(100, category['score']))
    return analysis_dict

# --- KEY CHANGE: The `normalize_scores` function has been completely DELETED. ---
# This was the primary source of the inaccurate scores.

def calculate_overall_score(analysis_dict):
    """Calculate weighted overall score based on the AI's real category scores."""
    # These weights now correctly reflect the importance of each category from the prompt.
    weights = {
        'tailoring': 0.35,
        'content': 0.20,
        'format': 0.15,
        'sections': 0.15,
        'style': 0.15
    }
    
    weighted_sum = 0
    total_weight = 0
    
    # Check if 'analysis_breakdown' exists and is a dictionary
    if 'analysis_breakdown' not in analysis_dict or not isinstance(analysis_dict.get('analysis_breakdown'), dict):
        # Fallback if the AI response is not structured correctly
        return analysis_dict.get('overall_score', 0)

    for category, data in analysis_dict['analysis_breakdown'].items():
        # Check if the category is in our weights and data is a dict with a 'score'
        if category in weights and isinstance(data, dict) and 'score' in data:
            score = data.get('score', 0)
            weight = weights[category]
            weighted_sum += score * weight
            total_weight += weight
            
    # Avoid division by zero if no valid categories were found
    if total_weight == 0:
        return 0
        
    # The overall score is the calculated weighted average
    # The min/max ensures the score is always between 0 and 100.
    return min(100, max(0, round(weighted_sum)))