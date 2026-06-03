from pydantic import BaseModel, EmailStr, Field


class ContactInput(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    phone: str = ''
    message: str = Field(min_length=5)
