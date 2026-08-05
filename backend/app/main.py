from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "application": "BugForge",
        "status": "running",
        "message": "Welcome to BugForge 🚀"
    }