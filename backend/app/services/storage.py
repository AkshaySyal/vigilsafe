"""
Storage service — local filesystem now, S3-ready later.

To switch to S3:
1. pip install boto3
2. Set USE_S3=true, AWS_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in .env
3. Uncomment the S3 block below and remove the local block.
"""
import os
import uuid
from flask import current_app

ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB


def validate_image(file_storage):
    """Raise ValueError if the upload is invalid."""
    if file_storage.mimetype not in ALLOWED_MIME_TYPES:
        raise ValueError(f"Invalid file type: {file_storage.mimetype}. Allowed: jpeg, png, gif, webp")

    file_storage.seek(0, 2)
    size = file_storage.tell()
    file_storage.seek(0)
    if size > MAX_BYTES:
        raise ValueError(f"File too large ({size // 1024}KB). Maximum is 5MB")


def save_image(file_storage) -> str:
    """
    Save image and return a URL path.
    Local: /uploads/<uuid>.<ext>
    S3 (future): https://<bucket>.s3.amazonaws.com/<uuid>.<ext>
    """
    validate_image(file_storage)

    ext_map = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
    }
    ext = ext_map[file_storage.mimetype]
    filename = f"{uuid.uuid4().hex}.{ext}"

    use_s3 = os.environ.get('USE_S3', 'false').lower() == 'true'

    if use_s3:
        import boto3
        s3 = boto3.client('s3')
        bucket = os.environ['AWS_BUCKET']
        s3.upload_fileobj(file_storage, bucket, filename, ExtraArgs={'ContentType': file_storage.mimetype})
        return f"https://{bucket}.s3.amazonaws.com/{filename}"

    upload_dir = os.path.join(current_app.root_path, '..', 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    file_storage.save(os.path.join(upload_dir, filename))
    return f"/uploads/{filename}"
