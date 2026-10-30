from sqlalchemy import Column, Integer, String, Numeric, Boolean, Date, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="USER")
    daily_calories_goal = Column(Integer, default=2000)
    protein_goal_g = Column(Integer, default=150)
    carbs_goal_g = Column(Integer, default=200)
    fat_goal_g = Column(Integer, default=70)

    # Relacja do dzienników posiłków
    daily_logs = relationship("DailyLog", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    calories_100g = Column(Integer, nullable=False)
    protein_100g = Column(Numeric(5, 1), nullable=False)
    carbs_100g = Column(Numeric(5, 1), nullable=False)
    fat_100g = Column(Numeric(5, 1), nullable=False)
    is_approved = Column(Boolean, default=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)


class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relacje
    user = relationship("User", back_populates="daily_logs")
    entries = relationship("LogEntry", back_populates="daily_log", cascade="all, delete-orphan")


class LogEntry(Base):
    __tablename__ = "log_entries"

    id = Column(Integer, primary_key=True, index=True)
    daily_log_id = Column(Integer, ForeignKey("daily_logs.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    meal_type = Column(String(30), nullable=False)
    weight_g = Column(Integer, nullable=False)
    calories = Column(Integer, nullable=False)
    protein_g = Column(Numeric(5, 1), nullable=False)
    carbs_g = Column(Numeric(5, 1), nullable=False)
    fat_g = Column(Numeric(5, 1), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relacje
    daily_log = relationship("DailyLog", back_populates="entries")
    product = relationship("Product")