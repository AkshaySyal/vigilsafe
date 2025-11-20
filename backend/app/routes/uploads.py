import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.services.storage import save_image

uploads_bp = Blueprint('uploads', __name__)


@uploads_bp.route('/image', methods=['POST'])
def upload_image():
    """
    Upload an image, get back a URL to include in incident create payload.
    Auth optional — allows anonymous reporters to attach photos.
    """
    verify_jwt_in_request(optional=True)

    if 'image' not in request.files:
        return jsonify({'error': 'No image field in request'}), 400

    file = request.files['image']
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        url = save_image(file)
    except ValueError as e:
        return jsonify({'error': str(e)}), 422

    return jsonify({'image_url': url}), 201


@uploads_bp.route('/<filename>')
def serve_upload(filename):
    """Serve locally stored uploads in dev. In prod, S3/CDN handles this."""
    upload_dir = os.path.join(current_app.root_path, '..', 'uploads')
    return send_from_directory(upload_dir, filename)
