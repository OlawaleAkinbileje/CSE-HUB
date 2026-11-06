from fastapi import APIRouter, Query
from typing import Optional
import psycopg2
from app.config import settings

router = APIRouter(prefix="/api/v1/search", tags=["Search"])

@router.get("/")
def search_resources(
    q: Optional[str] = Query(None, description="Search query string"),
    category_slug: Optional[str] = Query(None),
    course_code: Optional[str] = Query(None),
    limit: int = 10,
    offset: int = 0
):
    conn = psycopg2.connect(settings.DATABASE_URL)
    cursor = conn.cursor()
    
    query = """
        SELECT 
            r.id, r.title, r.description, r.file_url, r.file_type, 
            r.file_size, r.programming_language, r.created_at,
            c.name as category_name, cr.course_code, cr.title as course_title
        FROM public.resources r
        LEFT JOIN public.categories c ON r.category_id = c.id
        LEFT JOIN public.courses cr ON r.course_id = cr.id
        WHERE r.status = 'approved'
    """
    params = []
    
    if q:
        query += """ 
            AND (
                r.search_vector @@ plainto_tsquery('english', %s)
                OR r.title ILIKE %s
            )
        """
        params.extend([q, f"%{q}%"])
        
    if category_slug:
        query += " AND c.slug = %s"
        params.append(category_slug)
        
    if course_code:
        query += " AND cr.course_code = %s"
        params.append(course_code)
        
    query += " ORDER BY r.created_at DESC LIMIT %s OFFSET %s;"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    columns = [col[0] for col in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    cursor.close()
    conn.close()
    
    return {"data": results, "count": len(results)}