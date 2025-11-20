from flask import jsonify, request
from sqlalchemy import func, or_
from app import db
from app.models.incident import Incident
from app.models.user import User
from flask import Blueprint
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

stats_bp = Blueprint('stats', __name__)


def _visible_query():
    """Base Incident query scoped to what the current requester is allowed to see."""
    verify_jwt_in_request(optional=True)
    raw_id = get_jwt_identity()
    user = User.query.get(int(raw_id)) if raw_id else None

    if user and user.org_id:
        return Incident.query.filter(
            or_(Incident.org_id == None, Incident.org_id == user.org_id)
        )
    return Incident.query.filter(Incident.org_id == None)


@stats_bp.route('/incidents_by_category', methods=['GET'])
def incidents_by_category():
    base = _visible_query()
    rows = base.with_entities(Incident.category, func.count(Incident.id)).group_by(Incident.category).all()
    return jsonify([{'category': r[0], 'count': r[1]} for r in rows])


@stats_bp.route('/incidents_over_time', methods=['GET'])
def incidents_over_time():
    base = _visible_query()
    rows = (
        base.with_entities(
            func.date(Incident.created_at).label('date'),
            func.count(Incident.id).label('count')
        )
        .group_by(func.date(Incident.created_at))
        .order_by(func.date(Incident.created_at))
        .all()
    )
    return jsonify([{'date': str(r[0]), 'count': r[1]} for r in rows])


@stats_bp.route('/top_tags', methods=['GET'])
def top_tags():
    incidents = _visible_query().all()
    counts = {}
    for inc in incidents:
        for tag in (inc.tags or []):
            counts[tag] = counts.get(tag, 0) + 1
    sorted_tags = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:10]
    return jsonify([{'tag': t, 'count': c} for t, c in sorted_tags])


@stats_bp.route('/severity_distribution', methods=['GET'])
def severity_distribution():
    base = _visible_query()
    rows = base.with_entities(Incident.severity, func.count(Incident.id)).group_by(Incident.severity).all()
    return jsonify([{'severity': r[0], 'count': r[1]} for r in rows])
