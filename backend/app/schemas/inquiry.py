from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, EmailStr, Field


class CustomerSchema(BaseModel):
    fullName: str = Field(min_length=2)
    address: str = Field(min_length=5)
    email: EmailStr
    phone: str = ''
    notes: str = ''


class InquiryInput(BaseModel):
    productType: Literal['window', 'door', 'shutter']
    quantity: int = Field(default=1, ge=1, le=50)
    globalConfig: dict[str, Any] = Field(default_factory=dict)
    windows: list[dict[str, Any]] = Field(default_factory=list)
    doorConfig: dict[str, Any] = Field(default_factory=dict)
    shutterConfig: dict[str, Any] = Field(default_factory=dict)
    customer: CustomerSchema


class CustomerDraftSchema(BaseModel):
    fullName: str = ''
    address: str = ''
    email: str = ''
    phone: str = ''
    notes: str = ''


class InquiryDraftInput(BaseModel):
    productType: Literal['window', 'door', 'shutter']
    quantity: int = Field(default=1, ge=1, le=50)
    globalConfig: dict[str, Any] = Field(default_factory=dict)
    windows: list[dict[str, Any]] = Field(default_factory=list)
    doorConfig: dict[str, Any] = Field(default_factory=dict)
    shutterConfig: dict[str, Any] = Field(default_factory=dict)
    customer: CustomerDraftSchema = Field(default_factory=CustomerDraftSchema)


class InquiryStatusUpdate(BaseModel):
    status: Literal['neu', 'in_bearbeitung', 'abgeschlossen']


class InquiryOut(BaseModel):
    id: int
    inquiry_type: str
    product_type: str
    status: str
    created_at: datetime
    customer: dict[str, str]
    configuration: dict[str, Any]


class InquiryListResponse(BaseModel):
    items: list[InquiryOut]
