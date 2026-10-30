from datetime import date
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

app = FastAPI(title="Calorie Tracker API")

# Zezwolenie na zapytania z frontendu (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Calorie Tracker API is up and running!"}


@app.get("/api/products", response_model=List[schemas.ProductOut])
def get_products(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Product).filter(models.Product.is_approved == True)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    return query.all()


@app.post("/api/logs/entry")
def add_log_entry(entry: schemas.LogEntryCreate, db: Session = Depends(get_db)):
    # 1. Automatyczne utworzenie użytkownika testowego, jeśli baza została zresetowana
    user = db.query(models.User).filter(models.User.id == entry.user_id).first()
    if not user:
        user = models.User(
            id=entry.user_id,
            username="testuser",
            email="test@example.com",
            password_hash="dummy"
        )
        db.add(user)
        db.commit()

    today = date.today()

    # 2. Pobieramy lub tworzymy dzisiejszy dziennik
    daily_log = (
        db.query(models.DailyLog)
        .filter(
            models.DailyLog.user_id == entry.user_id,
            models.DailyLog.date == today,
        )
        .first()
    )

    if not daily_log:
        daily_log = models.DailyLog(user_id=entry.user_id, date=today)
        db.add(daily_log)
        db.commit()
        db.refresh(daily_log)

    # 3. Wyliczamy makroskładniki na podstawie wagi
    factor = entry.weight_g / 100.0
    calories = int(entry.calories_100g * factor)
    protein = round(entry.protein_100g * factor, 1)
    carbs = round(entry.carbs_100g * factor, 1)
    fat = round(entry.fat_100g * factor, 1)

    # 4. Tworzymy produkt w bazie lokalnej, jeśli pochodzi z Open Food Facts
    product = (
        db.query(models.Product)
        .filter(models.Product.name == entry.product_name)
        .first()
    )
    if not product:
        product = models.Product(
            name=entry.product_name,
            calories_100g=entry.calories_100g,
            protein_100g=entry.protein_100g,
            carbs_100g=entry.carbs_100g,
            fat_100g=entry.fat_100g,
            is_approved=True,
        )
        db.add(product)
        db.commit()
        db.refresh(product)

    # 5. Dodajemy wpis do dziennika
    new_entry = models.LogEntry(
        daily_log_id=daily_log.id,
        product_id=product.id,
        meal_type=entry.meal_type,
        weight_g=entry.weight_g,
        calories=calories,
        protein_g=protein,
        carbs_g=carbs,
        fat_g=fat,
    )
    db.add(new_entry)
    db.commit()

    return {"message": "Success"}