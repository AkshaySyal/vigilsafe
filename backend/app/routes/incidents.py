from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from sqlalchemy import or_
from app import db
from app.models.incident import Incident
from app.models.user import User
from app.services.nlp import analyze_incident
from app.utils import require_role

incidents_bp = Blueprint('incidents', __name__)


def _current_user():
    """Return User object if a valid JWT is present, else None."""
    verify_jwt_in_request(optional=True)
    raw_id = get_jwt_identity()
    if not raw_id:
        return None
    return User.query.get(int(raw_id))


@incidents_bp.route('/create', methods=['POST'])
@require_role('reporter')
def create_incident():
    data = request.get_json()
    if not data or not data.get('category') or not data.get('description'):
        return jsonify({'error': 'category and description are required'}), 400

    user = _current_user()

    # If caller passes an org_id, verify they are a member
    org_id = data.get('org_id')
    if org_id and (not user or user.org_id != int(org_id)):
        return jsonify({'error': 'You are not a member of that organization'}), 403

    analysis = analyze_incident(data['description'])

    incident = Incident(
        category=data['category'],
        incident_type=data.get('incident_type', 'general'),
        description=data['description'],
        location_descriptor=data.get('location_descriptor', ''),
        severity=analysis['severity'],
        tags=analysis['tags'],
        keywords=analysis['keywords'],
        is_anonymous=data.get('is_anonymous', False),
        image_url=data.get('image_url'),
        user_id=user.id if user and not data.get('is_anonymous') else None,
        org_id=org_id,
    )
    db.session.add(incident)
    db.session.commit()

    return jsonify({'incident': incident.to_dict(), 'analysis': analysis}), 201


@incidents_bp.route('/', methods=['GET'])
def get_incidents():
    user = _current_user()

    query = Incident.query

    # Multi-tenant visibility:
    # - Public incidents (org_id=null) visible to everyone
    # - Org incidents visible only to members of that org
    if user and user.org_id:
        query = query.filter(
            or_(Incident.org_id == None, Incident.org_id == user.org_id)
        )
    else:
        query = query.filter(Incident.org_id == None)

    # Additional filters
    if cat := request.args.get('category'):
        query = query.filter_by(category=cat)
    if sev := request.args.get('severity'):
        query = query.filter_by(severity=sev)
    if itype := request.args.get('type'):
        query = query.filter_by(incident_type=itype)

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    paginated = query.order_by(Incident.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'incidents': [i.to_dict() for i in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page,
    }), 200


@incidents_bp.route('/<int:incident_id>', methods=['GET'])
def get_incident(incident_id):
    user = _current_user()
    incident = Incident.query.get_or_404(incident_id)

    # Enforce org privacy on single-incident fetch too
    if incident.org_id and (not user or user.org_id != incident.org_id):
        return jsonify({'error': 'Access denied'}), 403

    return jsonify(incident.to_dict()), 200
