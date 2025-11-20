from app import db
from datetime import datetime

class Incident(db.Model):
    __tablename__ = 'incidents'

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    incident_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location_descriptor = db.Column(db.String(200))
    severity = db.Column(db.String(20))
    tags = db.Column(db.JSON)
    keywords = db.Column(db.JSON)
    image_url = db.Column(db.String(500))
    is_anonymous = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'incident_type': self.incident_type,
            'description': self.description,
            'location_descriptor': self.location_descriptor,
            'severity': self.severity,
            'tags': self.tags or [],
            'keywords': self.keywords or [],
            'image_url': self.image_url,
            'is_anonymous': self.is_anonymous,
            'user_id': self.user_id if not self.is_anonymous else None,
            'org_id': self.org_id,
            'created_at': self.created_at.isoformat()
        }
