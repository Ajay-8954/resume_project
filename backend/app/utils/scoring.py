import random

def normalize_scores(analysis_dict):
    base_score = analysis_dict['overall_score']
    for category in analysis_dict['analysis_breakdown'].values():
        variation = random.randint(-10, 10)
        category['score'] = max(0, min(100, base_score + variation))
    return analysis_dict

def calculate_overall_score(analysis_dict):
    """Calculate weighted overall score based on category weights"""
    weights = {
        'tailoring': 0.30,
        'content': 0.25,
        'format': 0.15,
        'sections': 0.15,
        'style': 0.15
    }
    
    weighted_sum = 0
    for category, data in analysis_dict['analysis_breakdown'].items():
        weighted_sum += data['score'] * weights.get(category, 0)
    
    return min(100, max(0, round(weighted_sum)))