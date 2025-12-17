"""File management endpoints"""
from fastapi import APIRouter, UploadFile, File
from typing import List

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload file - TODO: Implement Supabase Storage"""
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "url": f"/files/{file.filename}"
    }

@router.get("")
async def list_files():
    """List user files - TODO: Implement"""
    return []

@router.delete("/{file_id}")
async def delete_file(file_id: str):
    """Delete file - TODO: Implement"""
    return {"message": "File deleted"}
