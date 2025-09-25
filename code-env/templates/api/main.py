"""
{{PROJECT_NAME}} API
{{PROJECT_DESCRIPTION}}

FastAPI application template optimized for AI development.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from pydantic import BaseModel
from typing import List, Optional
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="{{PROJECT_NAME}}",
    description="{{PROJECT_DESCRIPTION}}",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# In-memory storage (replace with database in production)
items_db: List[Item] = []
item_counter = 0

# Dependency functions
async def get_db():
    """Database dependency - replace with actual DB connection"""
    return items_db

# Routes
@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0"
    )

@app.post("/items/", response_model=Item)
async def create_item(item: ItemCreate, db: List[Item] = Depends(get_db)):
    """Create a new item"""
    global item_counter
    item_counter += 1
    
    new_item = Item(
        id=item_counter,
        name=item.name,
        description=item.description,
        created_at=datetime.now()
    )
    
    db.append(new_item)
    logger.info(f"Created item: {new_item.id}")
    
    return new_item

@app.get("/items/", response_model=List[Item])
async def get_items(skip: int = 0, limit: int = 100, db: List[Item] = Depends(get_db)):
    """Get all items with pagination"""
    return db[skip : skip + limit]

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int, db: List[Item] = Depends(get_db)):
    """Get item by ID"""
    for item in db:
        if item.id == item_id:
            return item
    
    raise HTTPException(status_code=404, detail="Item not found")

@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item_update: ItemCreate, db: List[Item] = Depends(get_db)):
    """Update item by ID"""
    for i, item in enumerate(db):
        if item.id == item_id:
            updated_item = Item(
                id=item_id,
                name=item_update.name,
                description=item_update.description,
                created_at=item.created_at
            )
            db[i] = updated_item
            logger.info(f"Updated item: {item_id}")
            return updated_item
    
    raise HTTPException(status_code=404, detail="Item not found")

@app.delete("/items/{item_id}")
async def delete_item(item_id: int, db: List[Item] = Depends(get_db)):
    """Delete item by ID"""
    for i, item in enumerate(db):
        if item.id == item_id:
            deleted_item = db.pop(i)
            logger.info(f"Deleted item: {item_id}")
            return {"message": "Item deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Item not found")

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )