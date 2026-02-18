"""
Seed script — posts 20 mock incidents to the live Render backend.
Run: python scripts/seed_data.py
"""
import requests
import json

BASE_URL = "https://vigilsafe-backend.onrender.com"

INCIDENTS = [
    {
        "category": "work",
        "incident_type": "harassment",
        "description": "My manager has been repeatedly making sexual comments and inappropriate jokes during team meetings. Multiple coworkers witnessed this. I feel unsafe and uncomfortable coming to work.",
        "location_descriptor": "3rd floor conference room",
        "is_anonymous": False,
    },
    {
        "category": "school",
        "incident_type": "bullying",
        "description": "A group of students have been bullying and threatening a younger student in the hallway every day this week. They intimidate him and take his belongings by force.",
        "location_descriptor": "School hallway near lockers",
        "is_anonymous": False,
    },
    {
        "category": "community",
        "incident_type": "violence",
        "description": "There was a violent fight and assault near the park. One person had a weapon and attacked another. Police were called but arrived late.",
        "location_descriptor": "Central Park east entrance",
        "is_anonymous": True,
    },
    {
        "category": "work",
        "incident_type": "discrimination",
        "description": "I was passed over for promotion again. My manager made racist comments about my background. This is clear discrimination and bias against minorities in leadership positions.",
        "location_descriptor": "Downtown office building",
        "is_anonymous": False,
    },
    {
        "category": "school",
        "incident_type": "hazard",
        "description": "There is exposed electrical wiring in the science lab that poses a serious fire hazard. The ceiling is also flooding from a broken pipe. Extremely dangerous conditions.",
        "location_descriptor": "School science lab room 204",
        "is_anonymous": False,
    },
    {
        "category": "community",
        "incident_type": "threat",
        "description": "Someone left threatening notes on several car windshields in the parking lot warning residents to leave the neighborhood. Many residents feel coerced and afraid.",
        "location_descriptor": "Maple Street parking lot",
        "is_anonymous": True,
    },
    {
        "category": "work",
        "incident_type": "harassment",
        "description": "A coworker has been sending unwanted and explicit messages to several female employees. HR was notified but no action has been taken after three weeks.",
        "location_descriptor": "Marketing department, floor 2",
        "is_anonymous": False,
    },
    {
        "category": "school",
        "incident_type": "violence",
        "description": "Two students got into a serious fight and one was severely injured. There are rumors that someone brought a knife to school. This is an urgent safety emergency.",
        "location_descriptor": "School cafeteria",
        "is_anonymous": True,
    },
    {
        "category": "community",
        "incident_type": "other",
        "description": "Extensive graffiti and vandalism on the community center walls. Several windows were broken and property was destroyed overnight. Theft of equipment also reported.",
        "location_descriptor": "Community center on 5th Ave",
        "is_anonymous": True,
    },
    {
        "category": "family",
        "incident_type": "threat",
        "description": "I feel trapped and controlled at home. I am being manipulated and coerced into situations I am not comfortable with. I feel hopeless and afraid to speak out.",
        "location_descriptor": "Residential area, west side",
        "is_anonymous": True,
    },
    {
        "category": "work",
        "incident_type": "hazard",
        "description": "Chemical leak detected near the storage room. The smell is strong and several employees feel dizzy. The building manager has not responded to repeated safety reports.",
        "location_descriptor": "Building basement storage",
        "is_anonymous": False,
    },
    {
        "category": "school",
        "incident_type": "discrimination",
        "description": "A teacher consistently targets and mocks students from certain backgrounds. The profiling and prejudice is obvious to everyone in class. Students are stressed and overwhelmed.",
        "location_descriptor": "Classroom 12B",
        "is_anonymous": False,
    },
    {
        "category": "community",
        "incident_type": "harassment",
        "description": "A neighbor has been harassing residents with loud threats late at night. Multiple families have complained but the issue persists. People are scared to go outside.",
        "location_descriptor": "Elmwood residential area",
        "is_anonymous": True,
    },
    {
        "category": "work",
        "incident_type": "violence",
        "description": "An employee punched and assaulted a coworker in the break room following an argument. The victim was injured. Security footage exists but management is covering it up.",
        "location_descriptor": "Office break room floor 1",
        "is_anonymous": False,
    },
    {
        "category": "school",
        "incident_type": "bullying",
        "description": "Cyberbullying campaign targeting a student on social media. Classmates are humiliating and mocking her online. She is showing signs of anxiety and depression.",
        "location_descriptor": "Online / school grounds",
        "is_anonymous": False,
    },
    {
        "category": "community",
        "incident_type": "hazard",
        "description": "Broken streetlights and dangerous conditions on the main road near the school. There have been two near-miss accidents this week due to poor visibility.",
        "location_descriptor": "Main Street near school zone",
        "is_anonymous": False,
    },
    {
        "category": "work",
        "incident_type": "discrimination",
        "description": "Older employees are being systematically pushed out through unfair performance reviews. This is clear age discrimination and bias from new management.",
        "location_descriptor": "HR department",
        "is_anonymous": False,
    },
    {
        "category": "family",
        "incident_type": "violence",
        "description": "Domestic violence incident in the apartment above. Loud sounds of a physical attack and screaming were heard. This is an emergency situation requiring immediate attention.",
        "location_descriptor": "Apartment building 3rd floor",
        "is_anonymous": True,
    },
    {
        "category": "school",
        "incident_type": "hazard",
        "description": "The gym roof is leaking badly and the floor is flooded. Students slipped and got injured. The broken equipment poses additional injury risks.",
        "location_descriptor": "School gymnasium",
        "is_anonymous": False,
    },
    {
        "category": "community",
        "incident_type": "other",
        "description": "Suspicious individual stalking and following residents near the shopping mall. Multiple people reported the same person. Police report filed but no follow-up.",
        "location_descriptor": "Westfield Mall parking area",
        "is_anonymous": True,
    },
]


def register_seed_user():
    resp = requests.post(f"{BASE_URL}/auth/register", json={
        "username": "seedbot",
        "email": "seedbot@vigilsafe.dev",
        "password": "seedpass123"
    })
    if resp.status_code == 201:
        print("Registered seed user")
        return resp.json()["token"]
    elif resp.status_code == 409:
        print("Seed user exists, logging in...")
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "seedbot@vigilsafe.dev",
            "password": "seedpass123"
        })
        if resp.status_code == 200:
            return resp.json()["token"]
    print(f"Auth failed: {resp.status_code} {resp.text}")
    return None


def seed_incidents(token):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    passed = 0
    for i, incident in enumerate(INCIDENTS):
        resp = requests.post(f"{BASE_URL}/incidents/create", json=incident, headers=headers)
        if resp.status_code == 201:
            data = resp.json()
            print(f"[{i+1:02d}] ✓ {incident['category']}/{incident['incident_type']} — severity={data.get('severity', '?')} tags={data.get('tags', [])}")
            passed += 1
        else:
            print(f"[{i+1:02d}] ✗ FAILED {resp.status_code}: {resp.text[:80]}")
    print(f"\nDone: {passed}/{len(INCIDENTS)} incidents seeded")


if __name__ == "__main__":
    print(f"Seeding data to {BASE_URL}...")
    token = register_seed_user()
    if token:
        seed_incidents(token)
