from enum import Enum
from pydantic import BaseModel


class EngineType(str, Enum):
    engine_1 = "engine_1"
    engine_2 = "engine_2"
    engine_3 = "engine_3"


class JobCreate(BaseModel):
    engine_type: EngineType
    input_data: str


class JobResponse(BaseModel):
    id: int
    engine_type: str
    status: str

    class Config:
        from_attributes = True