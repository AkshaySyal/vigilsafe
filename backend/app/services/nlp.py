import os
import re
import requests

HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', '')

RISK_KEYWORDS = {
    'physical_hazard': ['broken', 'fire', 'electrical', 'flooding', 'injury', 'dangerous', 'unsafe', 'wiring', 'chemical', 'exposed', 'leak'],
    'bullying': ['bully', 'bullying', 'harass', 'harassment', 'intimidate', 'threaten', 'mock', 'tease', 'humiliate'],
    'mental_health_risk': ['stress', 'anxiety', 'depressed', 'overwhelmed', 'scared', 'hopeless', 'suicidal', 'mental', 'afraid', 'fear'],
    'discrimination': ['discriminate', 'racist', 'sexist', 'bias', 'unfair', 'targeted', 'profiling', 'prejudice'],
    'violence': ['fight', 'attack', 'hit', 'punch', 'weapon', 'gun', 'knife', 'assault', 'violence', 'beat', 'kicked'],
    'sexual_harassment': ['sexual', 'inappropriate', 'unwanted', 'groping', 'touching', 'explicit'],
    'property_damage': ['damage', 'vandalism', 'broken', 'destroyed', 'theft', 'stolen', 'graffiti'],
    'coercion': ['forced', 'coerced', 'blackmail', 'pressure', 'manipulate', 'control', 'trapped'],
}

HIGH_SEVERITY_WORDS = ['weapon', 'gun', 'knife', 'assault', 'fire', 'suicidal', 'attack', 'violence', 'emergency', 'urgent', 'critical', 'explosive', 'shooting']
MEDIUM_SEVERITY_WORDS = ['harassment', 'bully', 'threat', 'discrimination', 'injury', 'unsafe', 'dangerous', 'abuse', 'stalking']

STOPWORDS = {
    'this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'their',
    'what', 'when', 'where', 'will', 'would', 'could', 'should', 'about',
    'which', 'there', 'then', 'than', 'just', 'some', 'very', 'also', 'into',
    'more', 'over', 'after', 'before', 'your', 'told', 'said', 'really', 'work',
    'time', 'people', 'made', 'make', 'know', 'going', 'went', 'come', 'came',
}


def extract_keywords(text: str) -> list:
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    seen = set()
    keywords = []
    for w in words:
        if w not in STOPWORDS and w not in seen:
            seen.add(w)
            keywords.append(w)
    return keywords[:15]


def predict_tags(text: str) -> list:
    text_lower = text.lower()
    return [tag for tag, kws in RISK_KEYWORDS.items() if any(kw in text_lower for kw in kws)]


def classify_severity(text: str, tags: list) -> str:
    text_lower = text.lower()
    if any(w in text_lower for w in HIGH_SEVERITY_WORDS):
        return 'high'
    if any(w in text_lower for w in MEDIUM_SEVERITY_WORDS) or len(tags) >= 2:
        return 'medium'
    return 'low'


def get_hf_summary(text: str) -> str:
    url = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn'
    headers = {'Authorization': f'Bearer {HUGGINGFACE_API_KEY}'}
    payload = {'inputs': text, 'parameters': {'max_length': 80, 'min_length': 20}}
    response = requests.post(url, headers=headers, json=payload, timeout=15)
    response.raise_for_status()
    result = response.json()
    if isinstance(result, list) and result:
        return result[0].get('summary_text', '')
    return ''


def analyze_incident(description: str) -> dict:
    keywords = extract_keywords(description)
    tags = predict_tags(description)
    severity = classify_severity(description, tags)

    summary = None
    if HUGGINGFACE_API_KEY and len(description) > 100:
        try:
            summary = get_hf_summary(description)
        except Exception:
            pass

    return {
        'keywords': keywords,
        'tags': tags,
        'severity': severity,
        'summary': summary,
    }
