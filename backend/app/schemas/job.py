from pydantic import BaseModel


class JobCreate(BaseModel):
    engine_type: str
    input_data: str


class JobResponse(BaseModel):
    id: int
    engine_type: str
    status: str

    class Config:
        from_attributes = True