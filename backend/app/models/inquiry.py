from datetime import datetime
from sqlalchemy import DateTime, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Inquiry(Base):
    __tablename__ = 'inquiries'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    inquiry_type: Mapped[str] = mapped_column(String(20), default='final', nullable=False)
    product_type: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default='neu', nullable=False)

    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(160), nullable=False)
    phone: Mapped[str] = mapped_column(String(60), default='', nullable=False)
    notes: Mapped[str] = mapped_column(Text, default='', nullable=False)

    configuration: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
