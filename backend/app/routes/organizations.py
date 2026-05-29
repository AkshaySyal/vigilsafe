from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.organization import Organization
from app.models.user import User
from app.utils import require_role

org_bp = Blueprint('organizations', __name__)


@org_bp.route('/', methods=['GET'])
@jwt_required()
def get_organizations():
    orgs = Organization.query.all()
    return jsonify([o.to_dict() for o in orgs]), 200


@org_bp.route('/create', methods=['POST'])
@require_role('reporter')
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


@org_bp.route('/<int:org_id>/members', methods=['GET'])
@require_role('reporter')
def get_members(org_id):
    user = User.query.get(int(get_jwt_identity()))
    if user.org_id != org_id:
        return jsonify({'error': 'Access denied'}), 403
    members = User.query.filter_by(org_id=org_id).all()
    return jsonify([m.to_dict() for m in members]), 200


@org_bp.route('/<int:org_id>/members/<int:user_id>/role', methods=['PATCH'])
@require_role('admin')
def set_member_role(org_id, user_id):
    """Admin-only: set a member's role to viewer, reporter, or admin."""
    admin = User.query.get(int(get_jwt_identity()))
    if admin.org_id != org_id:
        return jsonify({'error': 'You are not an admin of this organization'}), 403

    data = request.get_json()
    new_role = data.get('role') if data else None
    if new_role not in ('viewer', 'reporter', 'admin'):
        return jsonify({'error': 'role must be viewer, reporter, or admin'}), 400

    target = User.query.get_or_404(user_id)
    if target.org_id != org_id:
        return jsonify({'error': 'User is not a member of this organization'}), 400

    target.role = new_role
    db.session.commit()
    return jsonify({'message': f'{target.username} is now {new_role}', 'user': target.to_dict()}), 200
