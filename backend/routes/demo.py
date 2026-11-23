import gc
import logging
import shutil
import threading
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image

from config import ALLOWED_EXTENSIONS, TEMP_DIR
from face_engine import face_engine, native_face_lock

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/demo", tags=["Demo"])

DEMO_CACHE_DIR = TEMP_DIR / "demo"
DEMO_CACHE_DIR.mkdir(parents=True, exist_ok=True)
DEMO_TTL_SECONDS = 30 * 60
_demo_sessions: Dict[str, dict] = {}
_demo_lock = threading.Lock()


def _cleanup_expired_sessions() -> None:
    now = time.time()
    expired = [
        session_id
        for session_id, session in list(_demo_sessions.items())
        if now - session["created_at"] > DEMO_TTL_SECONDS
    ]
    for session_id in expired:
        _remove_session(session_id)


def _remove_session(session_id: str) -> None:
    session = _demo_sessions.pop(session_id, None)
    if session:
        shutil.rmtree(session["directory"], ignore_errors=True)


@router.post("/process")
async def process_demo_gallery(files: List[UploadFile] = File(...)):
    _cleanup_expired_sessions()
    if len(files) != 3:
        raise HTTPException(status_code=400, detail="Please upload exactly 3 demo photos.")

    session_id = uuid.uuid4().hex
    session_dir = DEMO_CACHE_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    photos = []
    known_encodings = []
    photo_encodings = {}

    try:
        for index, file in enumerate(files, start=1):
            suffix = Path(file.filename or "").suffix.lower()
            if suffix not in ALLOWED_EXTENSIONS:
                raise HTTPException(status_code=400, detail=f"{file.filename}: unsupported image format.")

            image_bytes = await file.read()
            if not image_bytes:
                raise HTTPException(status_code=400, detail=f"{file.filename}: empty file.")

            photo_id = uuid.uuid4().hex
            original_path = session_dir / f"{photo_id}{suffix}"
            original_path.write_bytes(image_bytes)

            thumb_path = session_dir / f"{photo_id}_thumb.jpg"
            try:
                with Image.open(original_path) as image:
                    image.thumbnail((500, 500))
                    if image.mode in ("RGBA", "P"):
                        image = image.convert("RGB")
                    image.save(thumb_path, "JPEG", quality=82)
            except Exception as exc:
                raise HTTPException(status_code=400, detail=f"{file.filename}: invalid image.") from exc

            with native_face_lock:
                result = face_engine.process_photo(str(original_path))

            encodings = result["encodings"]
            known_encodings.extend(encodings)
            photo_encodings[photo_id] = encodings
            photos.append({
                "photo_id": photo_id,
                "filename": file.filename or f"photo-{index}.jpg",
                "url": f"/demo-cache/{session_id}/{thumb_path.name}",
                "full_url": f"/demo-cache/{session_id}/{original_path.name}",
                "faces_count": len(encodings),
            })

        with _demo_lock:
            _demo_sessions[session_id] = {
                "created_at": time.time(),
                "directory": session_dir,
                "photos": photos,
                "known_encodings": known_encodings,
                "photo_encodings": photo_encodings,
            }
    except HTTPException:
        shutil.rmtree(session_dir, ignore_errors=True)
        raise
    except Exception:
        shutil.rmtree(session_dir, ignore_errors=True)
        logger.exception("Demo gallery processing failed")
        raise HTTPException(status_code=500, detail="Demo gallery could not be processed.")

    gc.collect()
    return {
        "session_id": session_id,
        "expires_in_seconds": DEMO_TTL_SECONDS,
        "photos": photos,
        "processed_faces": sum(photo["faces_count"] for photo in photos),
        "storage": "local temporary cache only",
    }


@router.post("/search/{session_id}")
async def search_demo_gallery(session_id: str, face_image: UploadFile = File(...)):
    _cleanup_expired_sessions()
    with _demo_lock:
        session = _demo_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Demo session expired or not found.")

    image_bytes = await face_image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Please select a clear selfie.")

    with native_face_lock:
        user_encoding = face_engine.encode_user_face(image_bytes)
    if user_encoding is None:
        raise HTTPException(status_code=400, detail="No clear face detected. Use a selfie with good lighting.")

    matches = []
    seen_photos = set()
    for photo in session["photos"]:
        encodings = session["photo_encodings"].get(photo["photo_id"], [])
        if not encodings:
            continue
        with native_face_lock:
            face_matches = face_engine.compare_faces(encodings, user_encoding)
        if face_matches:
            best_similarity = max(similarity for _, similarity in face_matches)
            matches.append((best_similarity, photo))
            seen_photos.add(photo["photo_id"])

    matches.sort(key=lambda item: item[0], reverse=True)
    results = [
        {
            "photo_id": photo["photo_id"],
            "filename": photo["filename"],
            "url": photo["url"],
            "full_url": photo["full_url"],
            "similarity_score": round(float(similarity), 4),
        }
        for similarity, photo in matches
        if photo["photo_id"] in seen_photos
    ]
    return {
        "total_matches": len(results),
        "results": results,
        "storage": "No database or cloud storage was used",
        "session_id": session_id,
    }


@router.delete("/session/{session_id}")
async def delete_demo_session(session_id: str):
    with _demo_lock:
        _remove_session(session_id)
    return {"deleted": True}
