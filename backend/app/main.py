from fastapi import FastAPI

app = FastAPI(title="SaaS Platform API")


@app.get("/health")
def health_check():
    return {"status": "ok"}