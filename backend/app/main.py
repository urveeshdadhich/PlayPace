import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from .api import endpoints

app = FastAPI(title="PlayPace API")

# Setup CORS to allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix="/api")

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist')

if os.path.isdir(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
    
    @app.exception_handler(StarletteHTTPException)
    async def custom_http_exception_handler(request, exc):
        if exc.status_code == 404 and not request.url.path.startswith("/api"):
            return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
else:
    @app.get("/")
    def read_root():
        return {"message": "PlayPace API is running. Build frontend to serve."}
