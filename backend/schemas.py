from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    calories_100g: int
    protein_100g: float
    carbs_100g: float
    fat_100g: float

class ProductOut(ProductBase):
    id: int
    is_approved: bool

    class Config:
        from_attributes = True

class LogEntryCreate(BaseModel):
    user_id: int = 1
    product_name: str
    calories_100g: int
    protein_100g: float
    carbs_100g: float
    fat_100g: float
    meal_type: str
    weight_g: int