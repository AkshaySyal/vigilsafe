from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.organization import Organization
from app.models.user import User

org_bp = Blueprint('organizations', __name__)


@org_bp.route('/', methods=['GET'])
@jwt_required()
def get_organizations():
    orgs = Organization.query.all()
    return jsonify([o.to_dict() for o in orgs]), 200


@org_bp.route('/create', methods=['POST'])
@jwt_required()
def create_organization():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'name is required'}), 400

    org = Organization(name=data['name'], type=data.get('type', 'community'))
    db.session.add(org)
    db.session.flush()

    user = User.query.get(int(get_jwt_identity()))
    if user:
        user.org_id = org.id
        user.role = 'admin'

    db.session.commit()
    return jsonify(org.to_dict()), 201


@org_bp.route('/join/<int:org_id>', methods=['POST'])
@jwt_required()
def join_organization(org_id):
    org = Organization.query.get_or_404(org_id)
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.org_id = org_id
    db.session.commit()
    return jsonify({'message': f'Joined {org.name}', 'org': org.to_dict()}), 200
